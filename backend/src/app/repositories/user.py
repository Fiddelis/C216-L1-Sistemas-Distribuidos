from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_id(session: Session, user_id: str) -> User | None:
    return session.get(User, user_id)


def list_all(session: Session) -> list[User]:
    return list(session.scalars(select(User).order_by(User.id)).all())
