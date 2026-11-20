from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

STATUS_VALUES = (
    "Aberto",
    "Em andamento",
    "Aguardando aluno",
    "Resolvido",
    "Fechado",
)
CATEGORY_VALUES = ("rede", "software", "hardware", "conta")
PRIORITY_VALUES = ("baixa", "media", "alta")


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (
        CheckConstraint(
            "category IN ('rede', 'software', 'hardware', 'conta')",
            name="ck_tickets_category",
        ),
        CheckConstraint(
            "priority IN ('baixa', 'media', 'alta')",
            name="ck_tickets_priority",
        ),
        CheckConstraint(
            "status IN ("
            "'Aberto', 'Em andamento', 'Aguardando aluno', 'Resolvido', 'Fechado')",
            name="ck_tickets_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    priority: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Aberto")
    owner_user_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner = relationship("User", back_populates="tickets")
