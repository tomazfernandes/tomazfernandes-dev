package dev.tomazfernandes.sqs.architectureoverview.scenarios;

import io.awspring.cloud.sqs.listener.interceptor.MessageInterceptor;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

/**
 * Execution envelope scenario: a {@code MessageInterceptor} that stamps a correlation ID into MDC
 * and logs before/after each message, making the before/after hooks that wrap user code visible.
 */
@Component
@ConditionalOnProperty(name = "sqs-architecture-overview.scenarios.interceptor.logging", havingValue = "true")
public class CorrelationIdInterceptor implements MessageInterceptor<Object> {
    private static final Logger log = LoggerFactory.getLogger(CorrelationIdInterceptor.class);

    @Override
    public Message<Object> intercept(Message<Object> message) {
        String correlationId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("correlationId", correlationId);
        log.info("[interceptor:before] correlationId={}, messageId={}",
                correlationId, message.getHeaders().getId());
        return message;
    }

    @Override
    public void afterProcessing(Message<Object> message, Throwable t) {
        String correlationId = MDC.get("correlationId");
        if (t != null) {
            log.info("[interceptor:after] correlationId={}, failed: {}", correlationId, t.getMessage());
        } else {
            log.info("[interceptor:after] correlationId={}, success", correlationId);
        }
        MDC.remove("correlationId");
    }
}
