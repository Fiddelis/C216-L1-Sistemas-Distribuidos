"""Pure status transition matrix for the helpdesk."""

from __future__ import annotations

TRANSITIONS: dict[tuple[str, str], set[str]] = {
    ("Aberto", "Em andamento"): {"it"},
    ("Em andamento", "Aguardando aluno"): {"it"},
    ("Aguardando aluno", "Em andamento"): {"it", "owner_student"},
    ("Em andamento", "Resolvido"): {"it"},
    ("Resolvido", "Fechado"): {"it", "owner_student"},
}


def can_transition(
    actor_role: str,
    is_owner: bool,
    from_status: str,
    to_status: str,
) -> bool:
    allowed_roles = TRANSITIONS.get((from_status, to_status))
    if not allowed_roles:
        return False
    if actor_role == "it" and "it" in allowed_roles:
        return True
    if (
        actor_role == "student"
        and is_owner
        and "owner_student" in allowed_roles
    ):
        return True
    return False


def allowed_transitions_for(
    actor_role: str,
    is_owner: bool,
    from_status: str,
) -> list[str]:
    result: list[str] = []
    for (src, dst), _roles in TRANSITIONS.items():
        if src != from_status:
            continue
        if can_transition(actor_role, is_owner, src, dst):
            result.append(dst)
    return result
