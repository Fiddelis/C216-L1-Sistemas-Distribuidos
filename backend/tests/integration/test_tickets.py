from tests.integration.conftest import actor_headers


def _create(client, actor="stu-ana", **overrides):
    payload = {
        "title": "Wi-Fi do lab",
        "description": "Sem sinal no bloco A",
        "category": "rede",
        **overrides,
    }
    return client.post("/tickets", json=payload, headers=actor_headers(actor))


def test_actors_public_no_header(client):
    response = client.get("/actors")
    assert response.status_code == 200
    ids = {row["id"] for row in response.json()}
    assert ids == {"stu-ana", "stu-bruno", "it-carla"}


def test_missing_actor_header_401(client):
    response = client.get("/tickets")
    assert response.status_code == 401
    assert response.json()["code"] == "unauthorized_actor"


def test_student_isolation(client):
    created = _create(client, "stu-ana")
    assert created.status_code == 201
    ticket_id = created.json()["id"]

    ana_list = client.get("/tickets", headers=actor_headers("stu-ana"))
    ana_ids = {row["id"] for row in ana_list.json()}
    assert ticket_id in ana_ids

    bruno_list = client.get("/tickets", headers=actor_headers("stu-bruno"))
    bruno_ids = {row["id"] for row in bruno_list.json()}
    assert ticket_id not in bruno_ids

    bruno_get = client.get(
        f"/tickets/{ticket_id}", headers=actor_headers("stu-bruno")
    )
    assert bruno_get.status_code == 404


def test_it_lists_all_and_transitions(client):
    created = _create(client)
    ticket_id = created.json()["id"]

    it_list = client.get("/tickets", headers=actor_headers("it-carla"))
    it_ids = {row["id"] for row in it_list.json()}
    assert ticket_id in it_ids

    move = client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Em andamento"},
        headers=actor_headers("it-carla"),
    )
    assert move.status_code == 200
    assert move.json()["status"] == "Em andamento"


def test_invalid_transition_409(client):
    created = _create(client)
    ticket_id = created.json()["id"]
    bad = client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Fechado"},
        headers=actor_headers("it-carla"),
    )
    assert bad.status_code == 409
    assert bad.json()["code"] == "invalid_transition"


def test_student_cannot_it_transition(client):
    created = _create(client)
    ticket_id = created.json()["id"]
    denied = client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Em andamento"},
        headers=actor_headers("stu-ana"),
    )
    assert denied.status_code == 403


def test_responder_two_call(client):
    created = _create(client)
    ticket_id = created.json()["id"]
    client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Em andamento"},
        headers=actor_headers("it-carla"),
    )
    client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Aguardando aluno"},
        headers=actor_headers("it-carla"),
    )
    patch = client.patch(
        f"/tickets/{ticket_id}",
        json={"description": "Reiniciei o notebook"},
        headers=actor_headers("stu-ana"),
    )
    assert patch.status_code == 200
    back = client.post(
        f"/tickets/{ticket_id}/transitions",
        json={"to_status": "Em andamento"},
        headers=actor_headers("stu-ana"),
    )
    assert back.status_code == 200
    assert back.json()["status"] == "Em andamento"


def test_delete_owner_and_forbid_other_student(client):
    created = _create(client)
    ticket_id = created.json()["id"]
    forbidden = client.delete(
        f"/tickets/{ticket_id}", headers=actor_headers("stu-bruno")
    )
    assert forbidden.status_code == 404
    deleted = client.delete(
        f"/tickets/{ticket_id}", headers=actor_headers("stu-ana")
    )
    assert deleted.status_code == 204


def test_cors_allows_actor_header(client):
    response = client.options(
        "/tickets",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-actor-id,content-type",
        },
    )
    assert response.status_code == 200
    allow = response.headers.get("access-control-allow-headers", "").lower()
    assert "x-actor-id" in allow
