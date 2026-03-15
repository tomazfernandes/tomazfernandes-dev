package dev.tomazfernandes.sqs.architectureoverview;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;

@SpringBootApplication
public class SqsArchitectureOverviewApplication {
    private static final Logger log = LoggerFactory.getLogger(SqsArchitectureOverviewApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(SqsArchitectureOverviewApplication.class, args);
    }

    @Bean
    @Order(0)
    ApplicationRunner scenariosHint() {
        return args -> log.info("==> Toggle scenarios in src/main/resources/application.yml under sqs-architecture-overview.scenarios");
    }
}
