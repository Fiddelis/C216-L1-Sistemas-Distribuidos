from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.user import User
from app.repositories import ticket as ticket_repo
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.services import transitions as transition_policy


class TicketNotFound(Exception):
    pass


class Forbidden(Exception):
    pass


class InvalidTransition(Exception):
    pass


class UnauthorizedActor(Exception):
    pass


@dataclass(frozen=True)
class Actor:
    id: str
    name: str
    role: str


STUDENT_PATCH: dict[str, set[str]] = {
    "Aberto": {"title", "description", "category"},
    "Aguardando aluno": {"title", "description"},
}

IT_PATCH_STATUSES = {
    "Aberto",
    "Em andamento",
    "Aguardando aluno",
    "Resolvido",
}
IT_PATCH_FIELDS = {"priority", "category"}


def _is_owner(actor: Actor, ticket: Ticket) -> bool:
    return ticket.owner_user_id == actor.id


def _ensure_visible(actor: Actor, ticket: Ticket | None) -> Ticket:
    if ticket is None:
        raise TicketNotFound()
    if actor.role == "student" and not _is_owner(actor, ticket):
        raise TicketNotFound()
    return ticket


def allowed_patch_fields(actor: Actor, ticket: Ticket) -> list[str]:
    if actor.role == "student":
        if not _is_owner(actor, ticket):
            return []
        return sorted(STUDENT_PATCH.get(ticket.status, set()))
    if actor.role == "it" and ticket.status in IT_PATCH_STATUSES:
        return sorted(IT_PATCH_FIELDS)
    return []


def enrich(actor: Actor, ticket: Ticket) -> dict:
    is_owner = _is_owner(actor, ticket)
    return {
        "id": ticket.id,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": ticket.status,
        "owner_user_id": ticket.owner_user_id,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "allowed_transitions": transition_policy.allowed_transitions_for(
            actor.role, is_owner, ticket.status
        ),
        "allowed_patch_fields": allowed_patch_fields(actor, ticket),
    }


def list_tickets(session: Session, actor: Actor) -> list[dict]:
    owner_id = actor.id if actor.role == "student" else None
    tickets = ticket_repo.list_tickets(session, owner_user_id=owner_id)
    return [enrich(actor, ticket) for ticket in tickets]


def get_ticket(session: Session, actor: Actor, ticket_id: int) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    return enrich(actor, ticket)


def create_ticket(session: Session, actor: Actor, data: TicketCreate) -> dict:
    if actor.role != "student":
        raise Forbidden()
    ticket = ticket_repo.create_ticket(
        session,
        title=data.title,
        description=data.description,
        category=data.category.value,
        priority="media",
        owner_user_id=actor.id,
    )
    return enrich(actor, ticket)


def update_ticket(
    session: Session, actor: Actor, ticket_id: int, data: TicketUpdate
) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    allowed = set(allowed_patch_fields(actor, ticket))
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        return enrich(actor, ticket)
    for field in payload:
        if field not in allowed:
            raise Forbidden()
    values = {
        key: (value.value if hasattr(value, "value") else value)
        for key, value in payload.items()
    }
    ticket = ticket_repo.update_fields(session, ticket, values)
    return enrich(actor, ticket)


def transition_ticket(
    session: Session, actor: Actor, ticket_id: int, to_status: str
) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    is_owner = _is_owner(actor, ticket)
    edge = transition_policy.TRANSITIONS.get((ticket.status, to_status))
    if edge is None:
        raise InvalidTransition()
    if not transition_policy.can_transition(
        actor.role, is_owner, ticket.status, to_status
    ):
        raise Forbidden()
    ticket = ticket_repo.update_status(session, ticket, to_status)
    return enrich(actor, ticket)


def delete_ticket(session: Session, actor: Actor, ticket_id: int) -> None:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    if actor.role == "it" or _is_owner(actor, ticket):
        ticket_repo.delete_ticket(session, ticket)
        return
    raise Forbidden()


def list_actors(session: Session) -> list[User]:
    from app.repositories import user as user_repo

    return user_repo.list_all(session)
