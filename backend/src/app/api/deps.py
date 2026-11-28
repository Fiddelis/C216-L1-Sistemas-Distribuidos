from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories import user as user_repo
from app.services.ticket import Actor, UnauthorizedActor


def get_actor(
    session: Annotated[Session, Depends(get_session)],
    x_actor_id: Annotated[str | None, Header(alias="X-Actor-Id")] = None,
) -> Actor:
    if not x_actor_id:
        raise UnauthorizedActor()
    user = user_repo.get_by_id(session, x_actor_id)
    if user is None:
        raise UnauthorizedActor()
    return Actor(id=user.id, name=user.name, role=user.role)
