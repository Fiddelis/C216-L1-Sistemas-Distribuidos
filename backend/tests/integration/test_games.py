import pytest


def test_listar_jogos(client):
    response = client.get("/games")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_filtrar_e_limitar_jogos(client):
    response = client.get("/games", params={"genero": "aventura", "limite": 1})
    assert response.status_code == 200
    assert [jogo["titulo"] for jogo in response.json()] == ["Ilhas Perdidas"]


def test_obter_jogo(client):
    response = client.get("/games/7")
    assert response.status_code == 200
    assert response.json()["id"] == 7


def test_criar_jogo(client, game_data):
    response = client.post("/games", json=game_data)
    assert response.status_code == 201
    assert response.json() == {"id": 1, **game_data}


def test_substituir_jogo(client, game_data):
    response = client.put("/games/7", json=game_data)
    assert response.status_code == 200
    assert response.json() == {"id": 7, **game_data}


def test_atualizar_jogo(client):
    response = client.patch("/games/7", json={"plataforma": "PC"})
    assert response.status_code == 200
    assert response.json() == {
        "id": 7,
        "genero": "Aventura",
        "titulo": "Ilhas Perdidas",
        "ano": 2024,
        "plataforma": "PC",
        "preco": 299.90,
    }


def test_remover_jogo(client):
    response = client.delete("/games/7")
    assert response.status_code == 204
    assert response.content == b""


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


def test_patch_vazio_preserva_resposta(client):
    atual = client.get("/games/1").json()
    response = client.patch("/games/1", json={})
    assert response.status_code == 200
    assert response.json() == atual
