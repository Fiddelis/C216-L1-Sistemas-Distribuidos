# Checkpoint

Frontend da biblioteca de jogos. Usa React, JavaScript, Vite, Tailwind CSS e
ícones Lucide. A interface cadastra, lista, edita, exclui, busca, filtra e
ordena jogos via API.

## Executar

Requer Node.js 24 e npm. Com a API em `http://127.0.0.1:8000`:

```sh
make front-install
make front-dev
```

Abra [http://127.0.0.1:5173](http://127.0.0.1:5173).
Com Docker Compose (`make docker-up`), o frontend também sobe na porta 5173.

A URL da API vem de `VITE_API_URL` (padrão `http://127.0.0.1:8000`).

## Funcionamento

O catálogo carrega os jogos da API. Criação usa `POST /games`, edição `PUT`,
exclusão `DELETE`. A listagem usa `GET /games?limite=100`. Filtros, busca e
ordenação continuam no cliente.

Falhas de rede mostram “Não foi possível conectar à API.”. Respostas de erro
exibem o `detail` devolvido pelo backend.

## Organização

- `src/components`: cards, formulário e diálogo modal.
- `src/services`: cliente HTTP e módulo de jogos (espelha os endpoints).
- `src/data`: opções do formulário e dados de exemplo dos testes.
- `src/lib`: validação, normalização, filtros e formatação.
- `src/App.jsx`: carga da API e composição da tela.
- `tests/unit`: regras e serviços.
- `tests/integration`: UI com o serviço de jogos mockado.
- `tests/e2e`: fluxos no Chromium com mock HTTP do contrato da API.

## Qualidade e testes

```sh
make front-check
make front-test
make front-e2e-install
make front-test-e2e
make test
```

`make test` na raiz executa backend + frontend + E2E.
