import os
from pathlib import Path
from uuid import uuid4

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from alembic import command
from app.database.session import get_session
from app.main import app


@pytest.fixture
def migration_config():
    return Config(str(Path(__file__).parents[2] / "alembic.ini"))


@pytest.fixture
def db_engine(tmp_path, migration_config):
    url = os.getenv("TEST_DATABASE_URL")
    admin_engine = None
    schema = None
    if url:
        # Cada teste recebe um schema próprio, sem apagar tabelas existentes.
        admin_engine = create_engine(url)
        if admin_engine.dialect.name != "postgresql":
            raise ValueError("TEST_DATABASE_URL deve apontar para PostgreSQL")
        schema = f"test_{uuid4().hex}"
        with admin_engine.begin() as connection:
            connection.execute(text(f'CREATE SCHEMA "{schema}"'))
        engine = create_engine(url, connect_args={"options": f"-csearch_path={schema}"})
    else:
        engine = create_engine(f"sqlite:///{tmp_path / 'games.db'}")

    try:
        with engine.begin() as connection:
            migration_config.attributes["connection"] = connection
            command.upgrade(migration_config, "head")
        migration_config.attributes.pop("connection")
        yield engine
    finally:
        engine.dispose()
        if admin_engine is not None:
            with admin_engine.begin() as connection:
                connection.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
            admin_engine.dispose()


@pytest.fixture
def client(db_engine):
    def session_override():
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = session_override
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.pop(get_session, None)


@pytest.fixture
def saved_game(client, game_data):
    response = client.post("/games", json=game_data)
    assert response.status_code == 201
    return response.json()
