package dev.tomazfernandes.sqs.architectureoverview.order;

import io.awspring.cloud.sqs.annotation.SqsListener;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OrderConsumer {
    private static final Logger log = LoggerFactory.getLogger(OrderConsumer.class);

    private final boolean errorHandlerEnabled;
    private final String failOrderId;
    private final int failNTimes;
    private final AtomicInteger failureCount = new AtomicInteger();

    public OrderConsumer(
            @Value("${sqs-architecture-overview.scenarios.error-handler.enabled:false}") boolean errorHandlerEnabled,
            @Value("${sqs-architecture-overview.scenarios.error-handler.fail-order-id:}") String failOrderId,
            @Value("${sqs-architecture-overview.scenarios.error-handler.fail-n-times:0}") int failNTimes) {
        this.errorHandlerEnabled = errorHandlerEnabled;
        this.failOrderId = failOrderId;
        this.failNTimes = failNTimes;
    }

    @SqsListener("${sqs-architecture-overview.orders-queue-name}")
    public void listen(OrderEvent event) {
        if (errorHandlerEnabled && event.orderId().equals(failOrderId) && failureCount.getAndIncrement() < failNTimes) {
            throw new RuntimeException("Simulated failure for " + event.orderId()
                    + " (attempt " + failureCount.get() + "/" + failNTimes + ")");
        }
        log.info("Received: orderId={}, description={}", event.orderId(), event.description());
    }
}
