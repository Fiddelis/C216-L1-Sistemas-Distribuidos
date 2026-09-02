BACKEND_DIR ?= backend
POETRY ?= poetry
APP ?= app.main:app
COMPOSE ?= docker compose

.PHONY: install test lint format run docker-build docker-up docker-down docker-ps docker-logs docker-restart help

install:
	cd $(BACKEND_DIR) && $(POETRY) install

test:
	cd $(BACKEND_DIR) && $(POETRY) run pytest

lint:
	cd $(BACKEND_DIR) && $(POETRY) run ruff check .

format:
	cd $(BACKEND_DIR) && $(POETRY) run ruff format .

run:
	cd $(BACKEND_DIR) && $(POETRY) run uvicorn $(APP) --reload

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
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia a API"
	@echo "  make docker-build   - constrói as imagens"
	@echo "  make docker-up      - inicia os serviços"
	@echo "  make docker-down    - para os serviços"
	@echo "  make docker-ps      - mostra o estado dos serviços"
	@echo "  make docker-logs    - acompanha os logs do backend"
	@echo "  make docker-restart - reinicia os serviços"
