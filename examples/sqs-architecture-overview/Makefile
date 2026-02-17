.PHONY: up down run no-java build clean logs

up: ## Start LocalStack
	docker compose up -d localstack

down: ## Stop all services
	docker compose down

run: up ## Start LocalStack and run the application
	./gradlew bootRun

no-java: ## Run everything in Docker (no Java required)
	docker compose up --build

build: ## Compile the project
	./gradlew build

clean: ## Clean build artifacts
	./gradlew clean

logs: ## Tail service logs
	docker compose logs -f

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
