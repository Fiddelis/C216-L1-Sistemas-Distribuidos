BACKEND_DIR ?= backend
POETRY ?= poetry
APP ?= app.main:app
COMPOSE ?= docker compose
FRONTEND_DIR ?= frontend
NPM ?= npm

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
	@echo "  make front-install - instala dependências do frontend"
	@echo "  make front-dev     - inicia o site em http://127.0.0.1:5173"
	@echo "  make front-build   - gera a build do frontend"
	@echo "  make front-preview - serve a build em http://127.0.0.1:4173"
	@echo "  make front-lint    - verifica as regras do Biome"
	@echo "  make front-format  - formata o frontend"
	@echo "  make front-check   - verifica lint, formatação e imports"
	@echo "  make front-test    - executa testes unitários e de componentes"
	@echo "  make front-test-e2e - executa E2E com Chromium"

.PHONY: front-install front-dev front-build front-preview front-lint front-format front-format-check front-check front-test front-test-unit front-test-integration front-test-e2e front-e2e-install

front-install:
	cd $(FRONTEND_DIR) && $(NPM) ci

front-dev:
	cd $(FRONTEND_DIR) && $(NPM) run dev

front-build:
	cd $(FRONTEND_DIR) && $(NPM) run build

front-preview:
	cd $(FRONTEND_DIR) && $(NPM) run preview

front-lint:
	cd $(FRONTEND_DIR) && $(NPM) run lint

front-format:
	cd $(FRONTEND_DIR) && $(NPM) run format

front-format-check:
	cd $(FRONTEND_DIR) && $(NPM) run format:check

front-check:
	cd $(FRONTEND_DIR) && $(NPM) run check

front-test:
	cd $(FRONTEND_DIR) && $(NPM) test

front-test-unit:
	cd $(FRONTEND_DIR) && $(NPM) run test:unit

front-test-integration:
	cd $(FRONTEND_DIR) && $(NPM) run test:integration

front-e2e-install:
	cd $(FRONTEND_DIR) && $(NPM) exec -- playwright install --no-shell chromium

front-test-e2e:
	cd $(FRONTEND_DIR) && $(NPM) run test:e2e
