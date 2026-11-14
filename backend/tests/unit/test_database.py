from app.database.session import get_database_url


def test_conexao_padrao_de_desenvolvimento(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_database_url() == (
        "postgresql+psycopg://postgres:postgres@localhost:5432/c216"
    )


def test_normaliza_driver_psycopg(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@db:5432/example")
    assert get_database_url() == "postgresql+psycopg://user:password@db:5432/example"


def test_preserva_url_configurada(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:password@db/example")
    assert get_database_url() == "postgresql+psycopg://user:password@db/example"
