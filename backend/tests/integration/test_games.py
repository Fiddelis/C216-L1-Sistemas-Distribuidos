import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.main import app


def test_lista_inicial_vazia(client):
    response = client.get("/games")
    assert response.status_code == 200
    assert response.json() == []


def test_criar_e_consultar_jogo(client, game_data):
    response = client.post("/games", json=game_data)
    assert response.status_code == 201
    jogo = response.json()
    assert jogo["id"] > 0
    assert jogo == {"id": jogo["id"], **game_data}
    assert client.get(f"/games/{jogo['id']}").json() == jogo
    assert client.get("/games").json() == [jogo]


def test_ids_gerados_pelo_banco(client, game_data):
    primeiro = client.post("/games", json=game_data).json()
    segundo = client.post("/games", json=game_data).json()
    assert primeiro["id"] != segundo["id"]


def test_filtrar_e_limitar_jogos(client, game_data):
    for genero in ["RPG", "Corrida", "RPG"]:
        assert (
            client.post("/games", json=game_data | {"genero": genero}).status_code
            == 201
        )
    response = client.get("/games", params={"genero": "rpg", "limite": 1})
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["genero"] == "RPG"
    assert client.get("/games", params={"genero": "Inexistente"}).json() == []


def test_substituir_jogo(client, saved_game, game_data):
    novo = game_data | {
        "titulo": "Ilhas Perdidas",
        "plataforma": "Switch",
        "preco": 299.90,
    }
    path = f"/games/{saved_game['id']}"
    response = client.put(path, json=novo)
    assert response.status_code == 200
    assert response.json() == {"id": saved_game["id"], **novo}
    assert client.get(path).json() == response.json()


def test_atualizar_jogo(client, saved_game):
    path = f"/games/{saved_game['id']}"
    response = client.patch(path, json={"plataforma": "Switch", "titulo": None})
    assert response.status_code == 200
    assert response.json() == saved_game | {"plataforma": "Switch"}
    assert client.get(path).json() == response.json()


def test_remover_jogo(client, saved_game):
    path = f"/games/{saved_game['id']}"
    response = client.delete(path)
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(path).status_code == 404
    assert client.get("/games").json() == []


@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
def test_retorna_404_para_id_inexistente(client, method, game_data):
    response = client.request(method, "/games/999999", json=game_data)
    assert response.status_code == 404
    assert response.json() == {"detail": "Jogo não encontrado"}


@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
@pytest.mark.parametrize("game_id", [0, -1, "invalido"])
def test_rejeita_id_invalido(client, method, game_id, game_data):
    response = client.request(method, f"/games/{game_id}", json=game_data)
    assert response.status_code == 422


@pytest.mark.parametrize("params", [{"limite": 0}, {"limite": 101}, {"genero": ""}])
def test_rejeita_query_invalida(client, params):
    assert client.get("/games", params=params).status_code == 422


@pytest.mark.parametrize(("method", "path"), [("post", "/games"), ("put", "/games/1")])
def test_rejeita_corpo_incompleto(client, method, path):
    assert client.request(method, path, json={"genero": "RPG"}).status_code == 422


@pytest.mark.parametrize("dados", [{"preco": -1}, {"ano": 1800}, {"extra": "valor"}])
def test_patch_rejeita_dados_invalidos(client, dados):
    assert client.patch("/games/1", json=dados).status_code == 422


def test_patch_vazio_preserva_registro(client, saved_game):
    response = client.patch(f"/games/{saved_game['id']}", json={})
    assert response.status_code == 200
    assert response.json() == saved_game


def test_persiste_apos_reabrir_conexao_e_cliente(client, saved_game, db_engine):
    # Fecha o pool e cria outro engine: o registro deve continuar no banco.
    db_engine.dispose()
    # Preserva o schema isolado configurado na fixture para PostgreSQL.
    with db_engine.connect() as connection:
        schema = inspect(connection).default_schema_name

    connect_args = {}
    if db_engine.dialect.name == "postgresql":
        connect_args = {"options": f"-csearch_path={schema}"}
    novo_engine = create_engine(db_engine.url, connect_args=connect_args)

    def nova_sessao():
        with Session(novo_engine) as session:
            yield session

    anterior = app.dependency_overrides[get_session]
    app.dependency_overrides[get_session] = nova_sessao
    try:
        with TestClient(app) as novo_cliente:
            response = novo_cliente.get(f"/games/{saved_game['id']}")
            assert response.status_code == 200
            assert response.json() == saved_game
    finally:
        app.dependency_overrides[get_session] = anterior
        novo_engine.dispose()
