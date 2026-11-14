from sqlalchemy import CheckConstraint, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Game(Base):
    __tablename__ = "games"
    __table_args__ = (
        CheckConstraint("ano >= 1958 AND ano <= 2100", name="ck_games_ano"),
        CheckConstraint("preco > 0", name="ck_games_preco"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    genero: Mapped[str] = mapped_column(String(50))
    titulo: Mapped[str] = mapped_column(String(50))
    ano: Mapped[int]
    plataforma: Mapped[str] = mapped_column(String(30))
    preco: Mapped[float] = mapped_column(Float)
