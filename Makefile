# TerraCollect — Dev commands
# Requires: docker, pnpm >= 9, node >= 20
# Windows users: run with Git Bash, WSL, or PowerShell (for `make`-less commands)

.PHONY: help install setup dev dev-up dev-down dev-logs db-migrate db-seed db-reset db-studio build lint typecheck test test-e2e clean

help: ## Show this help
	@grep -Eh '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

setup: install ## Full project setup (install + infra up + migrate + seed)
	$(MAKE) dev-up
	pnpm db:migrate
	$(MAKE) db-seed
	@echo "✅ Setup complete! Run 'make dev' to start the dev servers."

dev: ## Start all dev servers (API + Web) in parallel
	pnpm dev

dev-up: ## Start infrastructure services (PostGIS, MinIO, Redis)
	docker compose -f infra/docker-compose.yml up -d
	@echo "⏳ Waiting for services to be healthy..."
	@docker compose -f infra/docker-compose.yml ps

dev-down: ## Stop infrastructure services
	docker compose -f infra/docker-compose.yml down

dev-logs: ## Tail infrastructure logs
	docker compose -f infra/docker-compose.yml logs -f

dev-build: ## Rebuild infrastructure images
	docker compose -f infra/docker-compose.yml build

db-migrate: ## Run Prisma migrations
	pnpm --filter @terracollect/api db:migrate

db-migrate-deploy: ## Deploy Prisma migrations (production)
	pnpm --filter @terracollect/api db:migrate:deploy

db-seed: ## Seed the database with demo data
	pnpm --filter @terracollect/api db:seed

db-reset: ## Reset database (drop, migrate, seed)
	pnpm --filter @terracollect/api db:migrate
	$(MAKE) db-seed

db-studio: ## Open Prisma Studio
	pnpm --filter @terracollect/api db:studio

build: ## Build all packages and apps
	pnpm build

lint: ## Lint all packages and apps
	pnpm lint

typecheck: ## Typecheck all packages and apps
	pnpm typecheck

test: ## Run all tests
	pnpm test

test-e2e: ## Run e2e tests
	pnpm --filter @terracollect/api test:e2e

clean: ## Clean all build outputs
	pnpm clean
