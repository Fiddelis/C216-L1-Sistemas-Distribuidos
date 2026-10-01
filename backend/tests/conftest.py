import pytest


@pytest.fixture
def car_data():
    return {
        "marca": "Ford",
        "modelo": "Focus",
        "ano": 2020,
        "cor": "Azul",
        "preco": 80000,
    }
