# C216 L1 - Sistemas Distribuídos

Repositório para as práticas da disciplina de Sistemas Distribuídos.

## Frontend

O [Checkpoint](frontend/README.md) é a interface da biblioteca de jogos.
Use `make front-install` e `make front-dev` para abrir o site na porta 5173.
Na Prática 6, o catálogo funciona em memória, sem integração com a API.

## Backend

Os comandos do projeto estão disponíveis em `Makefile` e executam as tarefas
do backend dentro de `backend/`.

Consulte [a documentação do backend](backend/README.md) para a estrutura da API,
os endpoints de jogos, a persistência no PostgreSQL, as migrations e os comandos
dos testes unitários e de integração.
