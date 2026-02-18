package dev.tomazfernandes.sqs.architectureoverview.scenarios;

import io.awspring.cloud.sqs.listener.interceptor.MessageInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

/**
 * Execution envelope scenario: a {@code MessageInterceptor} that logs before/after each message,
 * making the hooks that wrap user code visible.
 */
@Component
@ConditionalOnProperty(name = "sqs-architecture-overview.scenarios.interceptor.logging", havingValue = "true")
public class CorrelationIdInterceptor implements MessageInterceptor<Object> {
    private static final Logger log = LoggerFactory.getLogger(CorrelationIdInterceptor.class);

    @Override
    public Message<Object> intercept(Message<Object> message) {
        log.info("[Scenario: Interceptor] before — messageId={}", message.getHeaders().getId());
        return message;
    }

    @Override
    public void afterProcessing(Message<Object> message, Throwable t) {
        if (t != null) {
            log.info("[Scenario: Interceptor] after — messageId={}, failed: {}", message.getHeaders().getId(), t.getMessage());
        } else {
            log.info("[Scenario: Interceptor] after — messageId={}, success", message.getHeaders().getId());
        }
    }
}
