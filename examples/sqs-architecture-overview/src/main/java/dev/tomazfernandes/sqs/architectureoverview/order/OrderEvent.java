package dev.tomazfernandes.sqs.architectureoverview.order;

public record OrderEvent(String orderId, String description) {}
