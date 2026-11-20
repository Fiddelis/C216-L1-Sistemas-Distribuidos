from sqlalchemy import select
from sqlalchemy.orm import Session

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


def update_status(session: Session, ticket: Ticket, status: str) -> Ticket:
    ticket.status = status
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


def delete_ticket(session: Session, ticket: Ticket) -> None:
    session.delete(ticket)
    session.commit()
