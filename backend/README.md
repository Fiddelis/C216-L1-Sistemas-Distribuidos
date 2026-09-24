# Backend

API FastAPI com testes unitários e HTTP.

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

Os testes unitários exercitam as funções diretamente, com casos parametrizados
e uma entrada inválida. Os testes HTTP usam uma fixture `TestClient` para
verificar as rotas sem iniciar um servidor externo.
