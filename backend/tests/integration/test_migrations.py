from sqlalchemy import inspect

from alembic import command


def test_migration_reproduz_estrutura_e_permite_reversao(db_engine, migration_config):
    with db_engine.begin() as connection:
        migration_config.attributes["connection"] = connection
        assert inspect(connection).has_table("games")
        command.check(migration_config)
        command.downgrade(migration_config, "base")
        assert not inspect(connection).has_table("games")
        command.upgrade(migration_config, "head")
        assert inspect(connection).has_table("games")
        command.check(migration_config)
