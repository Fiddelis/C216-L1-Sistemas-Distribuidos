from sqlalchemy import inspect, text


def test_helpdesk_tables_and_seed(db_engine):
    inspector = inspect(db_engine)
    tables = set(inspector.get_table_names())
    assert "users" in tables
    assert "tickets" in tables
    assert "ticket_events" in tables
    assert "games" not in tables

    with db_engine.connect() as connection:
        rows = connection.execute(text("SELECT id FROM users ORDER BY id")).fetchall()
    ids = [row[0] for row in rows]
    assert ids == ["it-carla", "stu-ana", "stu-bruno"]
