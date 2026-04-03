# SQS Architecture Overview — Example Project

A Spring Boot application demonstrating the Spring Cloud AWS SQS listener pipeline covered in the [Architecture Overview](https://tomazfernandes.dev/posts/sqs-architecture-overview/) blog post.

The project processes order events through an SQS queue and includes toggleable scenarios that make each stage of the pipeline observable.

## Prerequisites

- Docker / Docker Compose
- Java 21+ (only for `make run`)

## Running

Each scenario has its own make target — Docker only, no Java required:

```bash
make run-assembly       # Assembly phase — container registry view at startup
make run-interceptor    # Execution envelope — before/after interceptor hooks
make run-error-handler  # Failure policy — error handling and redelivery
make run-ack-callback   # Acknowledgement flow — delete confirmation logs
make run-all            # All scenarios enabled
```

Stop with `Ctrl+C`, then clean up:

```bash
make down
```

Run `make` to see all available targets.

### Java / IntelliJ

If you have Java 21+, you can also run via Gradle and toggle scenarios in `application.yml` under `sqs-architecture-overview.scenarios`:

```bash
make run
```

## Scenarios

Each scenario makes a section of the [Architecture Overview](https://tomazfernandes.dev/posts/sqs-architecture-overview/) blog post observable at runtime.

### Assembly Phase View — `make run-assembly`

Logs container metadata at startup — container ids, queue names, running state, and key options (`maxConcurrentMessages`, `acknowledgementMode`). Proves that `@SqsListener` annotations were assembled into live `SqsMessageListenerContainer` instances.

### Correlation ID Interceptor — `make run-interceptor`

A `MessageInterceptor` that stamps a correlation ID into MDC and logs before/after each message. Shows the "execution envelope" — the hooks that wrap user code.

### Error Handler — `make run-error-handler`

The `OrderConsumer` throws for `order-2` the first N times it's processed. A custom `ErrorHandler` logs the failure and propagates the exception so the message returns to the queue for redelivery (visibility timeout is set to 5s in LocalStack). After N failures, processing succeeds.

Set `sqs-architecture-overview.scenarios.error-handler.fail-order-id` in `application.yml` to control which order ID triggers the failure.

### Acknowledgement Callback — `make run-ack-callback`

An `AcknowledgementResultCallback` that logs delete success/failure for each message. Makes "ack is delete" observable — you can see exactly when SQS confirms the message was removed from the queue.

## Project Structure

```
src/main/java/dev/tomazfernandes/sqs/architectureoverview/
├── SqsArchitectureOverviewApplication.java
├── order/
│   ├── OrderEvent.java              # Domain record
│   ├── OrderConsumer.java           # @SqsListener receiving OrderEvent
│   └── OrderProducer.java           # ApplicationRunner sending test orders
└── scenarios/
    ├── AssemblyPhaseView.java       # Logs container registry metadata at startup
    ├── CorrelationIdInterceptor.java # Before/after interceptor with correlation ID
    ├── LoggingErrorHandler.java     # Logs errors and propagates for redelivery
    └── LoggingAckCallback.java      # Logs acknowledgement (delete) results
```
