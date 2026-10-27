# Backend

API de jogos com FastAPI, SQLAlchemy e PostgreSQL. As rotas ficam em
`src/app/api/routes`, os contratos Pydantic em `schemas` e o modelo ORM em
`models`. Os services usam repositories para acessar o banco. `database`
configura o engine e a sessão por requisição. `main.py` registra os routers
e o tratamento de jogo inexistente.

## Iniciar com Docker Compose

Na raiz do repositório:

```sh
make docker-up
make docker-ps
```

O backend aguarda o PostgreSQL ficar saudável, aplica `alembic upgrade head`
e inicia a API em `http://localhost:8000`. Consulte `/docs` para experimentar
as requisições. O banco começa sem jogos.

O Compose usa `DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/c216`.
Dentro do container, `db` é o endereço do PostgreSQL, não `localhost`.
As credenciais do Compose são apenas para o ambiente da disciplina.

O volume `postgres_data` mantém os registros após reiniciar os containers.
`make docker-down` para os serviços sem remover esse volume.

## Executar fora do Docker

Requer Python 3.13 e Poetry 2.4.1. Suba o banco e configure a conexão antes
de aplicar a migration:

```sh
make install
docker compose up -d db
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/c216
make db-upgrade
make run
```

O arquivo `.env.example` documenta a configuração. Fora do Compose,
exporte as variáveis no shell; a aplicação não carrega `.env` automaticamente.
A API e o Alembic consultam a mesma variável `DATABASE_URL`.

## Endpoints

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | `/games?genero=RPG&limite=10` | Lista jogos por ID, com filtro de gênero sem diferenciar maiúsculas e minúsculas |
| GET | `/games/{game_id}` | Consulta um jogo persistido |
| POST | `/games` | Cria um jogo com ID gerado pelo banco e retorna 201 |
| PUT | `/games/{game_id}` | Substitui todos os campos do jogo |
| PATCH | `/games/{game_id}` | Atualiza somente campos enviados e não nulos |
| DELETE | `/games/{game_id}` | Remove o jogo e retorna 204 sem corpo |

GET por ID, PUT, PATCH e DELETE retornam 404 se o jogo não existir.
Os modelos validam `titulo`, `genero`, `ano`, `plataforma` e `preco`.
O ID deve ser positivo; `limite` aceita valores de 1 a 100. Entradas
inválidas retornam 422. As rotas `/` e `/hello/{name}` continuam disponíveis.

Exemplo de cadastro:

```sh
curl -X POST http://localhost:8000/games \
  -H 'Content-Type: application/json' \
  -d '{"titulo":"Reinos de Aurora","genero":"RPG","ano":2020,"plataforma":"PC","preco":199.90}'
```

## Migrations

A migration inicial cria a tabela `games`, com chave primária e restrições
de ano e preço. O ORM não cria tabelas automaticamente. Alembic controla
a estrutura e consegue reproduzi-la em um banco vazio.

```sh
make db-upgrade
make db-current
make db-history
make db-migration msg="descrição da alteração"
```

Revise o arquivo gerado em `backend/alembic/versions` antes de aplicar
uma nova migration. Com o backend no Compose, use `make docker-db-upgrade`
para aplicar migrations dentro do container.

## Verificar a persistência

1. Cadastre um jogo pelo POST e anote o ID retornado.
2. Consulte `GET /games/{game_id}`.
3. Execute `docker compose restart backend`.
4. Consulte o mesmo ID e confirme que os dados continuam disponíveis.
5. Atualize e remova o registro pelos endpoints correspondentes.

## Testes e qualidade

```sh
make test
make test-unit
make test-integration
make lint
```

Os testes unitários verificam os schemas, a configuração e os services
com repository simulado. Os testes de integração aplicam migrations em
um SQLite temporário por teste, executam o CRUD e verificam leitura por
uma nova conexão e um novo cliente HTTP. Também cobrem IDs inexistentes,
validação de entradas e reversão e reaplicação da migration.

Para executar a mesma suíte contra PostgreSQL, configure:

```sh
export TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/c216_test
make test-integration
```

Crie o banco `c216_test` previamente e use uma conta com permissão para
criar schemas. Cada teste cria um schema com nome aleatório e o remove
ao terminar. Não use credenciais de produção. Sem `TEST_DATABASE_URL`,
os testes não acessam o banco da aplicação.

O CI sobe PostgreSQL 16, aplica e confere as migrations, executa o lint
e roda as suítes unitária e de integração em etapas separadas.
