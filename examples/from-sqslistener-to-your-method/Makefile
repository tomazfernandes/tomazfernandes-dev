.PHONY: up down run run-no-java build clean logs help \
       run-assembly run-interceptor run-error-handler run-ack-callback run-all

# --- Java (requires Java 21+) ---

up: ## Start LocalStack
	docker compose up -d localstack

down: ## Stop all services
	docker compose down

run: up ## Start LocalStack and run the application
	./gradlew bootRun

build: ## Compile the project
	./gradlew build

clean: ## Clean build artifacts
	./gradlew clean

logs: ## Tail service logs
	docker compose logs -f

# --- Docker scenarios (no Java required) ---

run-no-java: ## Run with no scenarios enabled (Docker)
	docker compose run --rm --build app

run-assembly: ## Assembly phase — container registry view at startup (Docker)
	docker compose run --rm --build app \
		--sqs-architecture-overview.scenarios.assembly-view=true

run-interceptor: ## Execution envelope — before/after interceptor hooks (Docker)
	docker compose run --rm --build app \
		--sqs-architecture-overview.scenarios.interceptor.logging=true

run-error-handler: ## Failure policy — error handling and redelivery (Docker)
	docker compose run --rm --build app \
		--sqs-architecture-overview.scenarios.error-handler.enabled=true

run-ack-callback: ## Acknowledgement flow — delete confirmation logs (Docker)
	docker compose run --rm --build app \
		--sqs-architecture-overview.scenarios.ack-callback=true

run-all: ## All scenarios enabled (Docker)
	docker compose run --rm --build app \
		--sqs-architecture-overview.scenarios.assembly-view=true \
		--sqs-architecture-overview.scenarios.interceptor.logging=true \
		--sqs-architecture-overview.scenarios.error-handler.enabled=true \
		--sqs-architecture-overview.scenarios.ack-callback=true

# --- Help ---

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
