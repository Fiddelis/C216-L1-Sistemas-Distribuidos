import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_home_http(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Olá, Sistemas Distribuídos"}


def test_hello_http(client):
    response = client.get("/hello/Ana")
    assert response.status_code == 200
    assert response.json() == {"message": "Olá, Ana"}
