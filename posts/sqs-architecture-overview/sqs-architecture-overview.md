---
title: "Spring Cloud AWS SQS: Architecture Overview"
slug: "sqs-architecture-overview"
description: "A high-level walkthrough of the Spring Cloud AWS SQS listener architecture: startup assembly, container runtime, and the core components of the processing pipeline."
pubDatetime: 2025-01-16T00:00:00Z
tags: ["sqs", "aws", "spring-cloud-aws", "distributed-systems", "messaging"]
examples: ["sqs-architecture-overview"]
draft: false
---

This post walks through the Spring Cloud AWS SQS architecture introduced in the Spring Cloud AWS 3.0 redesign, [announced as GA in 2023](https://spring.io/blog/2023/05/02/announcing-spring-cloud-aws-3-0-0). It first outlines broker-agnostic concerns that production messaging consumers commonly have to handle, and then SQS-specific constraints.

With that baseline model established, the startup assembly section describes a common pattern Spring projects use to turn declarative, annotation-based configuration into listener containers, and maps the Spring Cloud AWS SQS implementation to that pattern.

The runtime execution section then breaks the "receive, handle, acknowledge" loop into a staged runtime pipeline built on AWS SDK v2 async APIs, linking those stages back to the earlier concerns.

<details>
<summary>Open table of contents</summary>

- [Reference and runnable examples](#reference-and-runnable-examples)
- [Broker-agnostic constraints for production consumers](#broker-agnostic-constraints-for-production-consumers)
- [How SQS broker semantics shape consumer constraints](#how-sqs-broker-semantics-shape-consumer-constraints)
- [Spring messaging integrations and a two-phase model](#spring-messaging-integrations-and-a-two-phase-model)
- [Assembly phase: declarative wiring and lifecycle](#assembly-phase-declarative-wiring-and-lifecycle)
- [How Spring Cloud AWS SQS maps onto this model](#how-spring-cloud-aws-sqs-maps-onto-this-model)
- [Container execution phase](#container-execution-phase)
- [Conclusion](#conclusion)

</details>

## Reference and runnable examples

For a canonical component-level reference with diagrams, see the [architectural overview](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/README.md) in the Spring Cloud AWS repository. This post is a narrative walkthrough of the same two-phase model.

To run the scenarios locally, clone the example project linked from the [examples page](/examples/sqs-architecture-overview/). It includes a Docker-based setup and the `make run-*` commands referenced throughout the post.

## Broker-agnostic constraints for production consumers

At a glance, consuming messages looks simple: receive, handle, acknowledge. In production, most of the complexity comes from the constraints around that loop.

These can be grouped into three ownership layers:
- **Broker/queue** owns delivery semantics such as redelivery behavior, dead-letter policies, and ordering guarantees.
- **Integration runtime** owns orchestration: receiving, dispatch, backpressure, acknowledgement calls, and instrumentation hooks.
- **Application** owns idempotency and side-effect safety. For brokers that provide at-least-once delivery, duplicates must be assumed.
- 
This post focuses on the responsibilities the **integration runtime** owns:

- **Ingress control:** how receiving is controlled and when it is paused.
- **Dispatch semantics:** how messages are dispatched under different modes (single, batch, ordered, grouped).
- **Execution envelope:** what wraps user code (interceptors, listener invocation) and how those hooks compose.
- **Failure policy:** what happens on exceptions and what that implies for retry and redelivery.
- **Acknowledgement flow:** when a message is considered “done” and how acknowledgement is executed and observed.

## How SQS broker semantics shape consumer constraints

At the broker layer, SQS’s semantics translate into concrete constraints for consumers:

- **Polling over the network:** SQS is pulled, not pushed. Throughput depends on polling duration, batch size, and how many receive requests you run in parallel.

- **Ordering and grouping:** Standard queues do not guarantee strict ordering. FIFO queues add message group ordering semantics, which constrains how much parallelism you can safely apply.

- **Redelivery and dead-lettering:** Retries are a consequence of visibility timeout and redelivery. Dead-letter behavior is configured through queue redrive policies.

- **Acknowledgement:** In SQS, acknowledging a message means deleting it. If processing succeeds but delete fails, the message may be delivered again, or routed to a DLQ.

- **Observability surface:** SQS exposes queue-level metrics such as depth and message age. Consumer-side signals need to be instrumented at the integration and application layer.

## Spring messaging integrations and a two-phase model

Spring-based messaging integrations have two distinct parts: an **assembly phase** and a **container runtime execution phase**.

## Assembly phase: declarative wiring and lifecycle

In this phase, a `BeanPostProcessor` discovers listener annotations and creates endpoints. A container factory turns endpoints into listener containers, and a registry keeps track of them.

Two kinds of configuration get applied during assembly:

- **Framework-level (annotation processing):** shared infrastructure that determines how listener-annotated methods are interpreted (conversion, method invocation, argument resolution). This is handled by the **EndpointRegistrar**.

- **Container-level (runtime behavior):** settings that determine how the container runs (polling, concurrency, backpressure, acknowledgement mode, timeouts). This is applied when the **factory** turns endpoints into containers, primarily through **container options / properties**.

Once the assembly is done, the registry manages container start and stop through Spring’s [`SmartLifecycle`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/SmartLifecycle.html) contract.

```mermaid
flowchart LR
  A["@Listener method"] --> B["BeanPostProcessor<br/>(detects + builds endpoints)"]
  B --> C["EndpointRegistrar<br/>(collects + configures endpoints)"]
  C --> D["Container factory"]
  D --> E["Listener container"]
  E --> F["Registry<br/>(lifecycle start/stop)"]
  ```

## How Spring Cloud AWS SQS maps onto this model

Spring Cloud AWS SQS follows this assembly pattern with its own components, documented in the [assembly phase](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/README.md#assembly-phase) section of the architecture overview. Here's how each assembly role maps to the module:

| Spring concept      | SQS module implementation |
|---|---|
| Listener annotation | [@SqsListener](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/annotation/SqsListener.java) |
| BeanPostProcessor   | [SqsListenerAnnotationBeanPostProcessor](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/annotation/SqsListenerAnnotationBeanPostProcessor.java) |
| Endpoint Registrar  | [EndpointRegistrar](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/config/EndpointRegistrar.java) |
| Container factory   | [SqsMessageListenerContainerFactory](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/config/SqsMessageListenerContainerFactory.java) |
| Listener container  | [SqsMessageListenerContainer](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/SqsMessageListenerContainer.java) |
| Container options   | [SqsContainerOptions](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/SqsContainerOptions.java) |
| Registry            | [DefaultListenerContainerRegistry](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/DefaultListenerContainerRegistry.java) |

> Try it: `make run-assembly` (prints the container registry view at startup)

## Container execution phase

The SQS-specific runtime is built on the AWS SDK v2 asynchronous `SqsAsyncClient` APIs (based on `CompletableFuture`), so SQS operations do not block container threads. When user-provided components (listeners, interceptors, error handlers) return async types, execution can remain non-blocking end-to-end.

On startup, the container assembles a [composable pipeline](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/README.md#composable-pipeline) and starts polling SQS:

```mermaid
flowchart LR
    A["MessageSource\n(polls SQS)"] --> B["MessageSink"]
    A --> BP["BackPressureHandler"]
    B --> P
    subgraph P ["MessageProcessingPipeline"]
        direction LR
        P1["Interceptor\n(before)"] --> P2["Listener"]
        P2 --> P3["ErrorHandler"]
        P3 --> P4["Interceptor\n(after)"]
        P4 --> P5["AcknowledgementHandler"]
    end
    P --> D["AcknowledgementProcessor\n(deletes from SQS)"]
    D --> E["AcknowledgementResultCallback"]
```

The components in this flow map the earlier constraints onto concrete mechanisms:

- **Ingress control:** [MessageSource](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/source/MessageSource.java) is responsible for polling SQS. [BackPressureHandler](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/backpressure/BackPressureHandler.java) applies backpressure by pausing/resuming polling based on criteria such as available in-flight capacity (`maxConcurrentMessages`).

- **Dispatch semantics:** [MessageSink](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/sink/MessageSink.java) selects the dispatch strategy, depending on the processing mode:

    - [FanOutMessageSink](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/sink/FanOutMessageSink.java): concurrent single-message processing
    - [BatchMessageSink](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/sink/BatchMessageSink.java): batch processing
    - [OrderedMessageSink](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/sink/OrderedMessageSink.java): sequential processing
    - [MessageGroupingSinkAdapter](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/sink/adapter/MessageGroupingSinkAdapter.java): FIFO per-group ordering

  Ordering is handled at dispatch time so the downstream processing pipeline can remain the same regardless of ordering constraints.

- **Execution envelope:** user code is invoked via [MessageListener](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/MessageListener.java), with [MessageInterceptor](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/interceptor/MessageInterceptor.java) providing before/after hooks around processing.

  > Try it: `make run-interceptor` (logs before/after hooks wrapping each message)

- **Failure policy:** [ErrorHandler](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/errorhandler/ErrorHandler.java) defines how processing failures are handled and whether they lead to retry/redelivery.

  > Try it: `make run-error-handler` (simulates failures and redelivery after visibility timeout)

- **Acknowledgement flow:** [AcknowledgementHandler](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/acknowledgement/handler/AcknowledgementHandler.java) determines when a message should be acknowledged and triggers the delete through [AcknowledgementProcessor](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/acknowledgement/AcknowledgementProcessor.java), which reports outcomes via [AcknowledgementResultCallback](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/acknowledgement/AcknowledgementResultCallback.java).

  > Try it: `make run-ack-callback` (logs when SQS confirms message deletion)

These stages also interact with cross-cutting concerns:

- **Redelivery / visibility:** by default, messages are acknowledged on successful processing and left unacknowledged on exceptions, which means they may be redelivered after the visibility timeout expires.

- **Observability:** the module provides [Micrometer instrumentation](https://docs.awspring.io/spring-cloud-aws/docs/4.0.0/reference/html/index.html#observability-support) out of the box for both listener and template operations, covering metrics and tracing with customizable conventions.

- **Duplicates / idempotency:** the runtime assumes at-least-once delivery; idempotency is handled at the application boundary.

The runtime is assembled by the [ContainerComponentFactory](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/ContainerComponentFactory.java) when the container starts, enabling multiple processing modes by swapping components while keeping the pipeline unchanged.

Customization is primarily exposed through container configuration and [SqsContainerOptions](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/src/main/java/io/awspring/cloud/sqs/listener/SqsContainerOptions.java).

## Conclusion

This post mapped common messaging constraints by turning the “receive, handle, acknowledge” loop into an explicit **staged runtime**, where orchestration is expressed as composable stages with clear responsibilities.

Spring Cloud AWS SQS makes this model concrete and splits the architecture into two phases:

- **Startup assembly:** build endpoints and containers from annotations and shared configuration, then let the registry manage container lifecycle.
- **Runtime execution:** run a staged pipeline that owns the integration-layer orchestration: ingress control, dispatch, an execution envelope, failure policy, and acknowledgement flow.

See the [architectural overview](https://github.com/awspring/spring-cloud-aws/blob/main/spring-cloud-aws-sqs/README.md) in the Spring Cloud AWS repository to dive deeper into concrete component boundaries. It includes diagrams and a component reference.

To run the scenarios locally, check out the playground project linked from the examples page and experiment with adding listeners, trying different configurations, and configuring custom components. For the full configuration surface and extension points, see the [reference docs](https://docs.awspring.io/spring-cloud-aws/docs/4.0.0/reference/html/index.html#sqs-integration).