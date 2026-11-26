"""conversa entre aluno e TI

Revision ID: 0002_messages
Revises: 0001_helpdesk
Create Date: 2026-11-25
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_messages"
down_revision: Union[str, Sequence[str], None] = "0001_helpdesk"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    messages = op.create_table(
        "ticket_messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("author_user_id", sa.String(length=32), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"]),
    )
    op.create_table(
        "ticket_reads",
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.String(length=32), nullable=False),
        sa.Column("last_read_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("ticket_id", "user_id"),
    )

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id, title FROM tickets")).mappings()
    by_title = {row["title"]: row["id"] for row in rows}
    seeded = []
    wifi = by_title.get("Wi-Fi do laboratório 3")
    matlab = by_title.get("Licença do MATLAB")
    if wifi is not None:
        seeded.append(
            {
                "ticket_id": wifi,
                "author_user_id": "it-carla",
                "body": "Testei o ponto do fundo e o sinal ainda cai. Consegue confirmar o horário da aula?",
            }
        )
    if matlab is not None:
        seeded.append(
            {
                "ticket_id": matlab,
                "author_user_id": "stu-ana",
                "body": "A licença voltou no laboratório 2, mas no 1 ainda pede ativação.",
            }
        )
    if seeded:
        op.bulk_insert(messages, seeded)


def downgrade() -> None:
    op.drop_table("ticket_reads")
    op.drop_table("ticket_messages")
