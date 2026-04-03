package dev.tomazfernandes.sqs.architectureoverview.scenarios;

import io.awspring.cloud.sqs.config.SqsMessageListenerContainerFactory;
import io.awspring.cloud.sqs.listener.acknowledgement.AcknowledgementResultCallback;
import java.util.Collection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

/**
 * Acknowledgement flow scenario: logs delete success/failure for each message, making the
 * "ack is delete" SQS semantic observable — the {@code AcknowledgementProcessor} deletes the
 * message from SQS, and this callback reports the outcome.
 *
 * <p>Unlike {@code MessageInterceptor} and {@code ErrorHandler}, {@code AcknowledgementResultCallback}
 * is not auto-detected by Spring Cloud AWS auto-configuration, so this component registers itself
 * on the container factory.
 */
@Component
@ConditionalOnProperty(name = "sqs-architecture-overview.scenarios.ack-callback", havingValue = "true")
public class LoggingAckCallback implements AcknowledgementResultCallback<Object> {
    private static final Logger log = LoggerFactory.getLogger(LoggingAckCallback.class);

    public LoggingAckCallback(SqsMessageListenerContainerFactory<Object> factory) {
        factory.setAcknowledgementResultCallback(this);
    }

    @Override
    public void onSuccess(Collection<Message<Object>> messages) {
        messages.forEach(m -> log.info("[Scenario: Ack Callback] delete confirmed — messageId={}", m.getHeaders().getId()));
    }

    @Override
    public void onFailure(Collection<Message<Object>> messages, Throwable t) {
        messages.forEach(m -> log.info("[Scenario: Ack Callback] delete failed — messageId={}, error={}",
                m.getHeaders().getId(), t.getMessage()));
    }
}
