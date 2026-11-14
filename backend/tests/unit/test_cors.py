from app.main import DEFAULT_CORS_ORIGINS, parse_cors_origins


def test_parse_cors_origins_default():
    origins = parse_cors_origins(DEFAULT_CORS_ORIGINS)
    assert "http://127.0.0.1:5173" in origins
    assert "http://localhost:5173" in origins
    assert "*" not in origins


def test_parse_cors_origins_custom():
    assert parse_cors_origins(" http://a.test ,http://b.test ") == [
        "http://a.test",
        "http://b.test",
    ]
