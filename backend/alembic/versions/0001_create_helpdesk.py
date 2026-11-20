"""create helpdesk users and tickets

Revision ID: 0001_helpdesk
Revises:
Create Date: 2026-11-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_helpdesk"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEED_USERS = (
    {"id": "stu-ana", "name": "Ana Silva", "role": "student"},
    {"id": "stu-bruno", "name": "Bruno Costa", "role": "student"},
    {"id": "it-carla", "name": "Carla Mendes", "role": "it"},
)


def upgrade() -> None:
    users = op.create_table(
        "users",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.CheckConstraint("role IN ('student', 'it')", name="ck_users_role"),
    )
    tickets = op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("owner_user_id", sa.String(length=32), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"]),
        sa.CheckConstraint(
            "category IN ('rede', 'software', 'hardware', 'conta')",
            name="ck_tickets_category",
        ),
        sa.CheckConstraint(
            "priority IN ('baixa', 'media', 'alta')",
            name="ck_tickets_priority",
        ),
        sa.CheckConstraint(
            "status IN ("
            "'Aberto', 'Em andamento', 'Aguardando aluno', 'Resolvido', 'Fechado')",
            name="ck_tickets_status",
        ),
    )
    op.bulk_insert(users, list(SEED_USERS))
    op.bulk_insert(
        tickets,
        [
            {
                "title": "Wi-Fi do laboratório 3",
                "description": "Sem sinal estável nas bancadas do fundo.",
                "category": "rede",
                "priority": "alta",
                "status": "Aberto",
                "owner_user_id": "stu-ana",
            },
            {
                "title": "Licença do MATLAB",
                "description": "Licença expirou no laboratório de sinais.",
                "category": "software",
                "priority": "media",
                "status": "Em andamento",
                "owner_user_id": "stu-ana",
            },
            {
                "title": "Projetor da sala 12",
                "description": "Projetor não liga após a manutenção.",
                "category": "hardware",
                "priority": "alta",
                "status": "Aguardando aluno",
                "owner_user_id": "stu-bruno",
            },
            {
                "title": "Reset de senha do e-mail",
                "description": "Não consigo acessar o webmail institucional.",
                "category": "conta",
                "priority": "media",
                "status": "Resolvido",
                "owner_user_id": "stu-bruno",
            },
            {
                "title": "VPN do estágio",
                "description": "VPN cai a cada poucos minutos.",
                "category": "rede",
                "priority": "baixa",
                "status": "Fechado",
                "owner_user_id": "stu-ana",
            },
            {
                "title": "Impressora do bloco B",
                "description": "Fila travada e trabalhos não saem.",
                "category": "hardware",
                "priority": "media",
                "status": "Aberto",
                "owner_user_id": "stu-bruno",
            },
            {
                "title": "Acesso ao Moodle",
                "description": "Turma nova sem permissão na disciplina.",
                "category": "conta",
                "priority": "alta",
                "status": "Fechado",
                "owner_user_id": "stu-bruno",
            },
            {
                "title": "IDE no notebook da biblioteca",
                "description": "VS Code não abre após update.",
                "category": "software",
                "priority": "baixa",
                "status": "Em andamento",
                "owner_user_id": "stu-ana",
            },
        ],
    )


def downgrade() -> None:
    op.drop_table("tickets")
    op.drop_table("users")
