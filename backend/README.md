# Backend

API FastAPI organizada em `src/app/api/routes`, `src/app/schemas` e
`src/app/services`. `main.py` cria a aplicação e registra os routers.

## Recurso de jogos

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | `/games?genero=Aventura&limite=1` | Lista exemplos com filtro e limite |
| GET | `/games/{game_id}` | Monta um exemplo com o ID solicitado |
| POST | `/games` | Valida o corpo e devolve um jogo com status 201 |
| PUT | `/games/{game_id}` | Exige todos os campos do jogo |
| PATCH | `/games/{game_id}` | Altera apenas os campos enviados e não nulos |
| DELETE | `/games/{game_id}` | Devolve status 204 sem corpo |

Os jogos de exemplo são fictícios e as respostas são demonstrativas. Não há
persistência: POST, PUT, PATCH e DELETE não alteram os exemplos das consultas.
O serviço PostgreSQL da Prática II continua disponível no Compose, mas não é
usado por estas rotas. As rotas `/` e `/hello/{name}` continuam disponíveis.

Os modelos Pydantic validam `titulo`, `genero`, `ano`, `plataforma` e `preco`.
O ID deve ser positivo; `limite` aceita valores de 1 a 100.
Para executar a API, use `make run` ou `make docker-up` na raiz.
Consulte `/docs` para ver os corpos das requisições e a documentação dos endpoints.

## Executar os testes

Requer Python 3.13 e Poetry 2.4.1. Na raiz do repositório:

```sh
make install
make test
```

Para executar as duas partes separadamente:

```sh
make test-unit
make test-integration
```

`tests/unit` cobre modelos e services sem HTTP. `tests/integration` cobre todas
as rotas com `TestClient`, incluindo parâmetros e corpos inválidos.
O workflow do backend executa as duas pastas em etapas separadas em `push` e
`pull_request`.
