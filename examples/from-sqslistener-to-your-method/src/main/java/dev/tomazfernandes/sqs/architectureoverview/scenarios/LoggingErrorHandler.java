package dev.tomazfernandes.sqs.architectureoverview.scenarios;

import io.awspring.cloud.sqs.listener.errorhandler.ErrorHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

/**
 * Failure policy scenario: logs the error and propagates the exception so the message is not
 * acknowledged. SQS redelivers it after the visibility timeout expires, demonstrating the
 * "what happens on exceptions" path of the processing pipeline.
 */
@Component
@ConditionalOnProperty(name = "sqs-architecture-overview.scenarios.error-handler.enabled", havingValue = "true")
public class LoggingErrorHandler implements ErrorHandler<Object> {
    private static final Logger log = LoggerFactory.getLogger(LoggingErrorHandler.class);

    @Override
    public void handle(Message<Object> message, Throwable t) {
        log.info("[Scenario: Error Handler] '{}' — message will return to queue for redelivery.", t.getMessage());
        if (t instanceof RuntimeException re) throw re;
        throw new RuntimeException(t);
    }
}
