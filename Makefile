BACKEND_DIR ?= backend
POETRY ?= poetry
APP ?= app.main:app
COMPOSE ?= docker compose

.PHONY: install test test-unit test-integration lint format run db-upgrade db-migration db-current db-history docker-db-upgrade docker-build docker-up docker-down docker-ps docker-logs docker-restart help

install:
	cd $(BACKEND_DIR) && $(POETRY) install

test:
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

db-migration:
	@test -n "$(msg)" || (echo 'Use make db-migration msg="descrição"'; exit 1)
	cd $(BACKEND_DIR) && $(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	cd $(BACKEND_DIR) && $(POETRY) run alembic current

db-history:
	cd $(BACKEND_DIR) && $(POETRY) run alembic history

docker-db-upgrade:
	$(COMPOSE) exec backend poetry run alembic upgrade head

docker-build:
	$(COMPOSE) build

docker-up:
	$(COMPOSE) up -d --build

docker-down:
	$(COMPOSE) down

docker-ps:
	$(COMPOSE) ps

docker-logs:
	$(COMPOSE) logs -f backend

docker-restart:
	$(COMPOSE) restart

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala dependências"
	@echo "  make test     - executa testes"
	@echo "  make test-unit        - executa testes unitários"
	@echo "  make test-integration - executa testes HTTP"
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia a API"
	@echo "  make db-upgrade     - aplica as migrations"
	@echo '  make db-migration msg="descrição" - gera uma migration para revisão'
	@echo "  make db-current     - mostra a revisão aplicada"
	@echo "  make db-history     - lista o histórico das migrations"
	@echo "  make docker-db-upgrade - aplica migrations no container"
	@echo "  make docker-build   - constrói as imagens"
	@echo "  make docker-up      - inicia os serviços"
	@echo "  make docker-down    - para os serviços"
	@echo "  make docker-ps      - mostra o estado dos serviços"
	@echo "  make docker-logs    - acompanha os logs do backend"
	@echo "  make docker-restart - reinicia os serviços"
