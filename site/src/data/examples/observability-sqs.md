---
title: "SQS Observability with Spring Boot"
slug: "observability-sqs"
description: "A Spring Boot application demonstrating SQS message processing with structured logging and metrics."
tags: ["spring-boot", "aws", "sqs", "observability"]
createdDate: 2025-01-15T00:00:00Z
repoPath: "examples/observability-sqs"
postSlugs: ["hello-world"]
---

## Overview

This example demonstrates how to set up observability for SQS message processing in a Spring Boot application. It includes structured logging, Micrometer metrics, and health checks.

## Stack

- Spring Boot 3.x
- Spring Cloud AWS SQS
- Micrometer + Prometheus
- Logback with structured JSON output

## Key Files

- `src/main/java/.../SqsListenerConfig.java` — SQS listener configuration
- `src/main/resources/application.yml` — Application config with observability settings
- `docker-compose.yml` — LocalStack + Prometheus + Grafana

## Running

See the "Run it" section below for clone and setup instructions.
