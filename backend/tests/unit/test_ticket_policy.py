from app.models.ticket import Ticket
from app.services.ticket import Actor, allowed_patch_fields


def _ticket(status: str, owner: str = "stu-ana") -> Ticket:
    return Ticket(
        id=1,
        title="t",
        description="d",
        category="rede",
        priority="media",
        status=status,
        owner_user_id=owner,
    )


def test_student_patch_aberto():
    actor = Actor(id="stu-ana", name="Ana", role="student")
    fields = set(allowed_patch_fields(actor, _ticket("Aberto")))
    assert fields == {"title", "description", "category"}


def test_student_patch_aguardando():
    actor = Actor(id="stu-ana", name="Ana", role="student")
    fields = set(allowed_patch_fields(actor, _ticket("Aguardando aluno")))
    assert fields == {"title", "description"}


def test_it_patch_priority_category():
    actor = Actor(id="it-carla", name="Carla", role="it")
    fields = set(allowed_patch_fields(actor, _ticket("Em andamento")))
    assert fields == {"category", "priority"}


def test_it_cannot_patch_fechado():
    actor = Actor(id="it-carla", name="Carla", role="it")
    assert allowed_patch_fields(actor, _ticket("Fechado")) == []


def test_student_non_owner_no_fields():
    actor = Actor(id="stu-bruno", name="Bruno", role="student")
    assert allowed_patch_fields(actor, _ticket("Aberto")) == []
