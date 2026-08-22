POETRY ?= poetry
APP ?= app.main:app

.PHONY: install test lint format run help

install:
	$(POETRY) install

test:
	$(POETRY) run pytest

lint:
	$(POETRY) run ruff check .

format:
	$(POETRY) run ruff format .

run:
	$(POETRY) run uvicorn $(APP) --reload

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - instala dependências"
	@echo "  make test     - executa testes"
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia a API"

