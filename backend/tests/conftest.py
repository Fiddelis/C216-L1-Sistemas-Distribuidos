import pytest


@pytest.fixture
def game_data():
    return {
        "genero": "RPG",
        "titulo": "Reinos de Aurora",
        "ano": 2020,
        "plataforma": "PC",
        "preco": 199.90,
    }
