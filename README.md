# Mini Helpdesk Inatel — Projeto Final C216 L1

Helpdesk de TI do campus: alunos abrem tickets; a equipe de TI conduz o fluxo de status; cada aluno só vê os próprios tickets. Identidade da demo via seletor de três personas (`stu-ana`, `stu-bruno`, `it-carla`) e header `X-Actor-Id` (sem login real).

## Funcionalidades

- CRUD de tickets (criar, listar, editar, excluir)
- Matriz de status com `POST /tickets/{id}/transitions`
- Isolamento aluno/TI na API
- Ação Responder (PATCH + transition) quando status é `Aguardando aluno`
- Frontend React (TypeScript) com React Router e UI zinc

## Tecnologias

FastAPI, Poetry, SQLAlchemy, Alembic, PostgreSQL, React, Vite, Tailwind, Biome, Vitest, Playwright, Docker Compose, GitHub Actions.

## Estrutura

- `backend/` — API em camadas (rotas, serviços, repositórios, schemas, models)
- `frontend/` — app Vite/React
- `docker-compose.yml` — `db` + `backend` + `frontend`

## Pré-requisitos

- Docker / Docker Compose
- (opcional local) Python 3.13 + Poetry 2.4, Node 24+

## Variáveis de ambiente

Veja `.env.example` (`DATABASE_URL`, `CORS_ORIGINS`, `VITE_API_URL`).

## Execução

```bash
docker compose down -v   # reset limpo (seed das 3 personas na migration)
docker compose up --build
```

- App: http://127.0.0.1:5173  
- API: http://127.0.0.1:8000/docs  

Migrations rodam no start do backend (`alembic upgrade head`), incluindo o seed dos três usuários.

## Testes

```bash
make test-backend          # pytest
cd frontend && npm ci && npm run test:unit && npm run test:integration
# E2E live (API precisa estar no ar):
cd frontend && npm run test:e2e
```

Ou `make test` com Poetry/npm instalados.