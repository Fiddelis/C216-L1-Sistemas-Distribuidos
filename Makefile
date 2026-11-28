BACKEND_DIR ?= backend
POETRY ?= poetry
APP ?= app.main:app
COMPOSE ?= docker compose
FRONTEND_DIR ?= frontend
NPM ?= npm

.PHONY: install test test-backend test-unit test-integration lint format run db-upgrade docker-build docker-up docker-down docker-ps help

install:
	cd $(BACKEND_DIR) && $(POETRY) install
	cd $(FRONTEND_DIR) && $(NPM) install

test-backend:
	cd $(BACKEND_DIR) && $(POETRY) run pytest

test-unit:
	cd $(BACKEND_DIR) && $(POETRY) run pytest tests/unit

test-integration:
	cd $(BACKEND_DIR) && $(POETRY) run pytest tests/integration

lint:
	cd $(BACKEND_DIR) && $(POETRY) run ruff check .

format:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format .

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn $(APP) --reload

db-upgrade:
	cd $(BACKEND_DIR) && $(POETRY) run alembic upgrade head

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest
	cd $(FRONTEND_DIR) && $(NPM) run test:unit
	cd $(FRONTEND_DIR) && $(NPM) run test:integration
	cd $(FRONTEND_DIR) && $(NPM) run test:e2e

docker-build:
	$(COMPOSE) build

docker-up:
	$(COMPOSE) up -d --build

docker-down:
	$(COMPOSE) down

docker-ps:
	$(COMPOSE) ps

help:
	@echo "Comandos: install, test, test-backend, test-unit, test-integration, lint, run, db-upgrade, docker-up, docker-down"
