# Mini Helpdesk Inatel — Projeto Final C216 L1

Helpdesk de TI do campus. O aluno abre um chamado e só vê os próprios. A equipe de TI vê a fila inteira e conduz o status. O acesso usa três usuários, sem login com senha: Ana Silva (`stu-ana`), Bruno Costa (`stu-bruno`) e Carla Mendes (`it-carla`). O frontend envia o usuário escolhido no header `X-Actor-Id`.

## Funcionalidades

- Criar, listar, editar e excluir tickets. A exclusão pede confirmação.
- A edição do chamado só abre depois do botão Editar.
- O aluno cria o ticket sem escolher prioridade. A API grava `media`. A TI altera prioridade e categoria.
- Matriz de status em `POST /tickets/{id}/transitions`: Aberto, Em andamento, Aguardando aluno, Resolvido e Fechado. Cada transição diz quem pode executá-la.
- Conversa entre o aluno e a TI em `POST /tickets/{id}/messages`. Chamado fechado não recebe mensagem.
- Aviso de mensagem nova para quem ainda não abriu o ticket.
- Histórico de quem abriu o chamado e de quem mudou o status.
- Métricas da fila para a TI, com filtro de período, status, categoria e prioridade.
- Isolamento na API: outro aluno recebe 404 ao pedir um ticket que não é dele.

## Tecnologias

FastAPI, Poetry, SQLAlchemy, Alembic, PostgreSQL, React, TypeScript, Vite, Tailwind, Biome, Vitest, Playwright, Docker Compose, GitHub Actions. Ruff no backend.

## Estrutura

- `backend/` — API em camadas: rotas, serviços, repositórios, schemas e models
- `frontend/` — app Vite/React
- `docker-compose.yml` — `db`, `backend` e `frontend`
- `.github/workflows/` — CI do backend e do frontend

## Pré-requisitos

- Docker e Docker Compose, para subir a aplicação como documentado
- Fora do Docker: Python 3.13, Poetry 2.4 e Node 24+

## Variáveis de ambiente

O arquivo `.env.example` lista `DATABASE_URL`, `CORS_ORIGINS` e `VITE_API_URL`. O Compose já define essas variáveis nos serviços. Nenhum segredo real entra no repositório. `X-Actor-Id` identifica qual desses usuários está usando a aplicação.

## Execução

```bash
docker compose up --build
```

Na subida, o backend roda `alembic upgrade head` e depois a API. A migration `0001` cria usuários e tickets de exemplo. A `0002` cria a conversa. A `0003` cria o histórico de status e registra a abertura dos tickets que já existiam.

- App: http://127.0.0.1:5173
- API: http://127.0.0.1:8000/docs

Para recomeçar do seed, apague o volume e suba de novo:

```bash
docker compose down -v
docker compose up --build
```

Fora do Docker, com o Postgres no ar: `make db-upgrade` e `make run` no backend, e `npm run dev` em `frontend/`. O Makefile também tem `make docker-up` e `make docker-down`.

## Testes

```bash
make test-backend
cd frontend && npm ci && npm run test:unit && npm run test:integration
```

O E2E usa a API e o banco de verdade. Suba a aplicação antes:

```bash
cd frontend && npm run test:e2e
```

`make test` roda o Pytest e, em seguida, os testes do frontend, inclusive o E2E. O CI executa Ruff, Biome, Pytest, Vitest, build e Playwright.
