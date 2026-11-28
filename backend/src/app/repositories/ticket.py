from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.event import TicketEvent
from app.models.message import TicketMessage, TicketRead
from app.models.ticket import Ticket


def create_ticket(
    session: Session,
    *,
    title: str,
    description: str,
    category: str,
    priority: str,
    owner_user_id: str,
) -> Ticket:
    ticket = Ticket(
        title=title,
        description=description,
        category=category,
        priority=priority,
        status="Aberto",
        owner_user_id=owner_user_id,
    )
    session.add(ticket)
    session.flush()
    session.add(
        TicketEvent(
            ticket_id=ticket.id,
            actor_user_id=owner_user_id,
            from_status=None,
            to_status="Aberto",
        )
    )
    session.commit()
    session.refresh(ticket)
    return ticket


def get_ticket(session: Session, ticket_id: int) -> Ticket | None:
    return session.get(Ticket, ticket_id)


def list_tickets(
    session: Session, *, owner_user_id: str | None = None
) -> list[Ticket]:
    stmt = select(Ticket)
    if owner_user_id is not None:
        stmt = stmt.where(Ticket.owner_user_id == owner_user_id)
    stmt = stmt.order_by(Ticket.updated_at.desc(), Ticket.id.desc())
    return list(session.scalars(stmt).all())


def update_fields(session: Session, ticket: Ticket, values: dict) -> Ticket:
    for key, value in values.items():
        setattr(ticket, key, value)
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


def update_status(
    session: Session, ticket: Ticket, status: str, *, actor_user_id: str
) -> Ticket:
    previous = ticket.status
    ticket.status = status
    session.add(ticket)
    session.add(
        TicketEvent(
            ticket_id=ticket.id,
            actor_user_id=actor_user_id,
            from_status=previous,
            to_status=status,
        )
    )
    session.commit()
    session.refresh(ticket)
    return ticket


def delete_ticket(session: Session, ticket: Ticket) -> None:
    session.delete(ticket)
    session.commit()


def list_events(session: Session, ticket_ids: list[int]) -> list[TicketEvent]:
    if not ticket_ids:
        return []
    stmt = (
        select(TicketEvent)
        .where(TicketEvent.ticket_id.in_(ticket_ids))
        .options(selectinload(TicketEvent.actor))
        .order_by(TicketEvent.created_at.asc(), TicketEvent.id.asc())
    )
    return list(session.scalars(stmt).all())


def list_messages(session: Session, ticket_ids: list[int]) -> list[TicketMessage]:
    if not ticket_ids:
        return []
    stmt = (
        select(TicketMessage)
        .where(TicketMessage.ticket_id.in_(ticket_ids))
        .options(selectinload(TicketMessage.author))
        .order_by(TicketMessage.created_at.asc(), TicketMessage.id.asc())
    )
    return list(session.scalars(stmt).all())


def list_reads(
    session: Session, user_id: str, ticket_ids: list[int]
) -> dict[int, datetime]:
    if not ticket_ids:
        return {}
    stmt = select(TicketRead).where(
        TicketRead.user_id == user_id,
        TicketRead.ticket_id.in_(ticket_ids),
    )
    return {row.ticket_id: row.last_read_at for row in session.scalars(stmt)}


def add_message(
    session: Session, *, ticket_id: int, author_user_id: str, body: str
) -> TicketMessage:
    message = TicketMessage(
        ticket_id=ticket_id,
        author_user_id=author_user_id,
        body=body,
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def mark_read(session: Session, *, ticket_id: int, user_id: str) -> None:
    now = datetime.now(UTC)
    row = session.get(TicketRead, (ticket_id, user_id))
    if row is None:
        session.add(
            TicketRead(ticket_id=ticket_id, user_id=user_id, last_read_at=now)
        )
    else:
        row.last_read_at = now
        session.add(row)
    session.commit()
