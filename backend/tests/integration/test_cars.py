import pytest


def test_listar_carros(client):
    response = client.get("/cars")
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_filtrar_e_limitar_carros(client):
    response = client.get("/cars", params={"marca": "toyota", "limite": 1})
    assert response.status_code == 200
    assert [c["modelo"] for c in response.json()] == ["Corolla"]


def test_obter_carro(client):
    response = client.get("/cars/7")
    assert response.status_code == 200
    assert response.json()["id"] == 7


def test_criar_carro(client, car_data):
    response = client.post("/cars", json=car_data)
    assert response.status_code == 201
    assert response.json() == {"id": 1, **car_data}


def test_substituir_carro(client, car_data):
    response = client.put("/cars/7", json=car_data)
    assert response.status_code == 200
    assert response.json() == {"id": 7, **car_data}


def test_atualizar_carro(client):
    response = client.patch("/cars/7", json={"cor": "Azul"})
    assert response.status_code == 200
    assert response.json() == {
        "id": 7,
        "marca": "Toyota",
        "modelo": "Corolla",
        "ano": 2024,
        "cor": "Azul",
        "preco": 150000,
    }


def test_remover_carro(client):
    response = client.delete("/cars/7")
    assert response.status_code == 204
    assert response.content == b""


@pytest.mark.parametrize("method", ["get", "put", "patch", "delete"])
@pytest.mark.parametrize("car_id", [0, -1, "invalido"])
def test_rejeita_id_invalido(client, method, car_id, car_data):
    response = client.request(method, f"/cars/{car_id}", json=car_data)
    assert response.status_code == 422


@pytest.mark.parametrize("params", [{"limite": 0}, {"limite": 101}, {"marca": ""}])
def test_rejeita_query_invalida(client, params):
    assert client.get("/cars", params=params).status_code == 422


@pytest.mark.parametrize(("method", "path"), [("post", "/cars"), ("put", "/cars/1")])
def test_rejeita_corpo_incompleto(client, method, path):
    assert client.request(method, path, json={"marca": "Ford"}).status_code == 422


@pytest.mark.parametrize("dados", [{"preco": -1}, {"ano": 1800}, {"extra": "valor"}])
def test_patch_rejeita_dados_invalidos(client, dados):
    assert client.patch("/cars/1", json=dados).status_code == 422


def test_patch_vazio_preserva_resposta(client):
    atual = client.get("/cars/1").json()
    response = client.patch("/cars/1", json={})
    assert response.status_code == 200
    assert response.json() == atual
