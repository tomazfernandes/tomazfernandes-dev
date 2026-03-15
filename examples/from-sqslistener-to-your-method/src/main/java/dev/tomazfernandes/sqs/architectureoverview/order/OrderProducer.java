package dev.tomazfernandes.sqs.architectureoverview.order;

import io.awspring.cloud.sqs.operations.SqsTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class OrderProducer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(OrderProducer.class);

    private final SqsTemplate sqsTemplate;
    private final String queueName;
    private final boolean errorHandlerEnabled;

    public OrderProducer(SqsTemplate sqsTemplate,
                         @Value("${sqs-architecture-overview.orders-queue-name}") String queueName,
                         @Value("${sqs-architecture-overview.scenarios.error-handler.enabled:false}") boolean errorHandlerEnabled) {
        this.sqsTemplate = sqsTemplate;
        this.queueName = queueName;
        this.errorHandlerEnabled = errorHandlerEnabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        int count = errorHandlerEnabled ? 3 : 1;
        for (int i = 1; i <= count; i++) {
            var event = new OrderEvent("order-" + i, "Order #" + i);
            sqsTemplate.send(queueName, event);
            log.info("Sent: {}", event);
        }
    }
}
