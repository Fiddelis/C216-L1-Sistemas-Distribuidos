def test_cors_preflight_com_origem_explicita(client):
    response = client.options(
        "/games",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"


def test_cors_rejeita_origem_nao_listada(client):
    response = client.get("/games", headers={"Origin": "http://evil.test"})
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers
