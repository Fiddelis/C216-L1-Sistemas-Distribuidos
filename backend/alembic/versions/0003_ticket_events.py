"""histórico de status do ticket

Revision ID: 0003_events
Revises: 0002_messages
Create Date: 2026-11-25
"""

from collections.abc import Sequence
from datetime import datetime

import sqlalchemy as sa
from alembic import op

revision: str = "0003_events"
down_revision: str | Sequence[str] | None = "0002_messages"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_STATUS_LIST = (
    "'Aberto', 'Em andamento', 'Aguardando aluno', 'Resolvido', 'Fechado'"
)


def _as_datetime(value: datetime | str) -> datetime:
    if isinstance(value, datetime):
        return value
    text = value.replace("Z", "+00:00")
    for fmt in (
        "%Y-%m-%d %H:%M:%S.%f%z",
        "%Y-%m-%d %H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
    ):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return datetime.fromisoformat(text)


def upgrade() -> None:
    events = op.create_table(
        "ticket_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("actor_user_id", sa.String(length=32), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=True),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            f"from_status IS NULL OR from_status IN ({_STATUS_LIST})",
            name="ck_ticket_events_from_status",
        ),
        sa.CheckConstraint(
            f"to_status IN ({_STATUS_LIST})",
            name="ck_ticket_events_to_status",
        ),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]),
    )

    bind = op.get_bind()
    rows = bind.execute(
        sa.text("SELECT id, owner_user_id, created_at FROM tickets")
    ).mappings()
    seeded = [
        {
            "ticket_id": row["id"],
            "actor_user_id": row["owner_user_id"],
            "from_status": None,
            "to_status": "Aberto",
            "created_at": _as_datetime(row["created_at"]),
        }
        for row in rows
    ]
    if seeded:
        op.bulk_insert(events, seeded)


def downgrade() -> None:
    op.drop_table("ticket_events")
