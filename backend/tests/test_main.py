import pytest

from app.main import hello, home, soma


@pytest.mark.parametrize(
    ("a", "b", "expected"),
    [(2, 2, 4), (-2, 3, 1), (0, 7, 7)],
)
def test_soma(a, b, expected):
    assert soma(a, b) == expected


def test_soma_com_decimal():
    assert soma(1.5, 2.5) == 4.0


def test_soma_com_entrada_invalida():
    with pytest.raises(TypeError):
        soma("2", 2)


def test_home():
    assert home() == {"message": "Olá, Sistemas Distribuídos"}


@pytest.mark.parametrize("name", ["Ana", "João"])
def test_hello(name):
    assert hello(name) == {"message": f"Olá, {name}"}


def test_hello_com_nome_vazio():
    assert hello("") == {"message": "Olá, "}
