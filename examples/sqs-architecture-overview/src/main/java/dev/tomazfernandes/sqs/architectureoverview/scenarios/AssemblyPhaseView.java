package dev.tomazfernandes.sqs.architectureoverview.scenarios;

import io.awspring.cloud.sqs.listener.MessageListenerContainer;
import io.awspring.cloud.sqs.listener.MessageListenerContainerRegistry;
import io.awspring.cloud.sqs.listener.SqsMessageListenerContainer;
import java.util.Collection;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Assembly phase scenario: proves that {@code @SqsListener} annotations were assembled into
 * live {@code SqsMessageListenerContainer} instances by the container factory and registry.
 *
 * <p>Logs container id, queue names, running state, and key container options
 * ({@code maxConcurrentMessages}, {@code acknowledgementMode}).
 */
@Component
@Order(1)
@ConditionalOnProperty(name = "sqs-architecture-overview.scenarios.assembly-view", havingValue = "true")
@SuppressWarnings("rawtypes")
public class AssemblyPhaseView implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AssemblyPhaseView.class);

    private final MessageListenerContainerRegistry registry;

    public AssemblyPhaseView(MessageListenerContainerRegistry registry) {
        this.registry = registry;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("[Scenario: Assembly Phase View] === Assembly Phase View ===");
        asSqsContainers(registry.getListenerContainers()).forEach(this::logContainerInfo);
        log.info("[Scenario: Assembly Phase View] === End Assembly Phase View ===");
    }

    private void logContainerInfo(SqsMessageListenerContainer<?> container) {
        log.info("[Scenario: Assembly Phase View] Container: id={}, queues={}, running={}",
                container.getId(),
                container.getQueueNames(),
                container.isRunning());
        var options = container.getContainerOptions();
        log.info("[Scenario: Assembly Phase View]   maxConcurrentMessages={}, maxMessagesPerPoll={}, acknowledgementMode={}",
                options.getMaxConcurrentMessages(),
                options.getMaxMessagesPerPoll(),
                options.getAcknowledgementMode());
    }

    private List<SqsMessageListenerContainer> asSqsContainers(Collection<MessageListenerContainer<?>> containers) {
        return containers.stream()
                .filter(SqsMessageListenerContainer.class::isInstance)
                .map(SqsMessageListenerContainer.class::cast)
                .toList();
    }
}
