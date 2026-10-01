# Backend

API FastAPI organizada em `src/app/api/routes`, `src/app/schemas` e
`src/app/services`. `main.py` cria a aplicação e registra os routers.

## Recurso de carros

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | `/cars?marca=Toyota&limite=1` | Lista exemplos com filtro e limite |
| GET | `/cars/{car_id}` | Monta um exemplo com o ID solicitado |
| POST | `/cars` | Valida o corpo e devolve um carro com status 201 |
| PUT | `/cars/{car_id}` | Exige todos os campos do carro |
| PATCH | `/cars/{car_id}` | Altera apenas os campos enviados e não nulos |
| DELETE | `/cars/{car_id}` | Devolve status 204 sem corpo |

As respostas são demonstrativas, como no PR usado como referência. Não há
persistência: POST, PUT, PATCH e DELETE não alteram os exemplos das consultas.
O serviço PostgreSQL da Prática II continua disponível no Compose, mas não é
usado por estas rotas. As rotas `/` e `/hello/{name}` continuam disponíveis.

Os modelos Pydantic validam `marca`, `modelo`, `ano`, `cor` e `preco`.
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
