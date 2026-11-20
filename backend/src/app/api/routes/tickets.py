from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_actor
from app.database.session import get_session
from app.schemas.ticket import (
    ActorRead,
    TicketCreate,
    TicketRead,
    TicketUpdate,
    TransitionRequest,
)
from app.services import ticket as ticket_service
from app.services.ticket import Actor

router = APIRouter(tags=["tickets"])


@router.get("/actors", response_model=list[ActorRead])
def list_actors(session: Annotated[Session, Depends(get_session)]):
    return ticket_service.list_actors(session)


@router.get("/tickets", response_model=list[TicketRead])
def list_tickets(
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    return ticket_service.list_tickets(session, actor)


@router.post(
    "/tickets",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    payload: TicketCreate,
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    return ticket_service.create_ticket(session, actor, payload)


@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(
    ticket_id: int,
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    return ticket_service.get_ticket(session, actor, ticket_id)


@router.patch("/tickets/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    return ticket_service.update_ticket(session, actor, ticket_id, payload)


@router.post("/tickets/{ticket_id}/transitions", response_model=TicketRead)
def transition_ticket(
    ticket_id: int,
    payload: TransitionRequest,
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    return ticket_service.transition_ticket(
        session, actor, ticket_id, payload.to_status.value
    )


@router.delete("/tickets/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    session: Annotated[Session, Depends(get_session)],
    actor: Annotated[Actor, Depends(get_actor)],
):
    ticket_service.delete_ticket(session, actor, ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
