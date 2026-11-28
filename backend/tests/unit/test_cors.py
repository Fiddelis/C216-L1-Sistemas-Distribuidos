from app.main import parse_cors_origins


def test_parse_cors_origins_default_includes_vite():
    origins = parse_cors_origins(
        "http://127.0.0.1:5173,http://localhost:5173"
    )
    assert "http://127.0.0.1:5173" in origins
    assert "http://localhost:5173" in origins
