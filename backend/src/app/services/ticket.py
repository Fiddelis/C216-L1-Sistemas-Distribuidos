from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.event import TicketEvent
from app.models.message import TicketMessage
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


def _message_dict(message: TicketMessage) -> dict:
    author = message.author
    return {
        "id": message.id,
        "author_user_id": message.author_user_id,
        "author_name": author.name if author is not None else message.author_user_id,
        "author_role": author.role if author is not None else "student",
        "body": message.body,
        "created_at": message.created_at,
    }


def _is_unread(message: TicketMessage, actor: Actor, last_read) -> bool:
    if message.author_user_id == actor.id:
        return False
    if last_read is None:
        return True
    created = message.created_at
    read_at = last_read
    if created.tzinfo is None and read_at.tzinfo is not None:
        read_at = read_at.replace(tzinfo=None)
    if created.tzinfo is not None and read_at.tzinfo is None:
        created = created.replace(tzinfo=None)
    return created > read_at


def _event_dict(event: TicketEvent) -> dict:
    actor = event.actor
    return {
        "id": event.id,
        "actor_user_id": event.actor_user_id,
        "actor_name": actor.name if actor is not None else event.actor_user_id,
        "actor_role": actor.role if actor is not None else "student",
        "from_status": event.from_status,
        "to_status": event.to_status,
        "created_at": event.created_at,
    }


def enrich(
    actor: Actor,
    ticket: Ticket,
    messages: list[TicketMessage] | None = None,
    last_read=None,
    events: list[TicketEvent] | None = None,
) -> dict:
    thread = messages or []
    unread = [item for item in thread if _is_unread(item, actor, last_read)]
    latest = unread[-1] if unread else None
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
        "messages": [_message_dict(item) for item in thread],
        "unread_message": _message_dict(latest) if latest else None,
        "events": [_event_dict(item) for item in (events or [])],
    }


def _bundle(session: Session, actor: Actor, tickets: list[Ticket]) -> list[dict]:
    ids = [ticket.id for ticket in tickets]
    grouped: dict[int, list[TicketMessage]] = {ticket_id: [] for ticket_id in ids}
    for message in ticket_repo.list_messages(session, ids):
        grouped.setdefault(message.ticket_id, []).append(message)
    reads = ticket_repo.list_reads(session, actor.id, ids)
    history: dict[int, list[TicketEvent]] = {ticket_id: [] for ticket_id in ids}
    for event in ticket_repo.list_events(session, ids):
        history.setdefault(event.ticket_id, []).append(event)
    return [
        enrich(
            actor,
            ticket,
            grouped.get(ticket.id, []),
            reads.get(ticket.id),
            history.get(ticket.id, []),
        )
        for ticket in tickets
    ]


def list_tickets(session: Session, actor: Actor) -> list[dict]:
    owner_id = actor.id if actor.role == "student" else None
    tickets = ticket_repo.list_tickets(session, owner_user_id=owner_id)
    return _bundle(session, actor, tickets)


def get_ticket(session: Session, actor: Actor, ticket_id: int) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    ticket_repo.mark_read(session, ticket_id=ticket.id, user_id=actor.id)
    return _bundle(session, actor, [ticket])[0]


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
    return _bundle(session, actor, [ticket])[0]


def update_ticket(
    session: Session, actor: Actor, ticket_id: int, data: TicketUpdate
) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    allowed = set(allowed_patch_fields(actor, ticket))
    payload = data.model_dump(exclude_unset=True)
    if not payload:
        return _bundle(session, actor, [ticket])[0]
    for field in payload:
        if field not in allowed:
            raise Forbidden()
    values = {
        key: (value.value if hasattr(value, "value") else value)
        for key, value in payload.items()
    }
    ticket = ticket_repo.update_fields(session, ticket, values)
    return _bundle(session, actor, [ticket])[0]


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
    ticket = ticket_repo.update_status(
        session, ticket, to_status, actor_user_id=actor.id
    )
    return _bundle(session, actor, [ticket])[0]


def delete_ticket(session: Session, actor: Actor, ticket_id: int) -> None:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    if actor.role == "it" or _is_owner(actor, ticket):
        ticket_repo.delete_ticket(session, ticket)
        return
    raise Forbidden()


def add_message(session: Session, actor: Actor, ticket_id: int, body: str) -> dict:
    ticket = _ensure_visible(actor, ticket_repo.get_ticket(session, ticket_id))
    if actor.role == "student" and not _is_owner(actor, ticket):
        raise TicketNotFound()
    if actor.role not in {"student", "it"}:
        raise Forbidden()
    if ticket.status == "Fechado":
        raise Forbidden()
    ticket_repo.add_message(
        session,
        ticket_id=ticket.id,
        author_user_id=actor.id,
        body=body.strip(),
    )
    ticket_repo.mark_read(session, ticket_id=ticket.id, user_id=actor.id)
    return _bundle(session, actor, [ticket])[0]


def list_actors(session: Session) -> list[User]:
    from app.repositories import user as user_repo

    return user_repo.list_all(session)
