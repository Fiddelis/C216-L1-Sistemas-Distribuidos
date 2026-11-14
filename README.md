# C216 L1 - Sistemas Distribuídos

Repositório para as práticas da disciplina de Sistemas Distribuídos.

## Stack

O Compose sobe três serviços: PostgreSQL, API FastAPI e o frontend Checkpoint.

```sh
make docker-up
```

- Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- API / docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

A Prática 7 integra o frontend à API: o catálogo deixa de usar estado local e
passa a chamar os endpoints de jogos, com CORS explícito e mensagens de erro.

## Desenvolvimento local

```sh
make docker-up
# ou, só o banco + API no Compose e o Vite fora:
make front-install
make front-dev
```

Configure `VITE_API_URL` e `CORS_ORIGINS` conforme `.env.example`.

## Testes

```sh
make test
```

Roda backend (pytest), frontend (Vitest) e E2E (Playwright) em um comando só.

Consulte [frontend/README.md](frontend/README.md) e
[backend/README.md](backend/README.md) para detalhes.
