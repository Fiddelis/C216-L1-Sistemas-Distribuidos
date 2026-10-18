"""Cria a tabela de jogos."""

import sqlalchemy as sa

from alembic import op

revision = "0001_create_games"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "games",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("genero", sa.String(50), nullable=False),
        sa.Column("titulo", sa.String(50), nullable=False),
        sa.Column("ano", sa.Integer(), nullable=False),
        sa.Column("plataforma", sa.String(30), nullable=False),
        sa.Column("preco", sa.Float(), nullable=False),
        sa.CheckConstraint("ano >= 1958 AND ano <= 2100", name="ck_games_ano"),
        sa.CheckConstraint("preco > 0", name="ck_games_preco"),
    )


def downgrade() -> None:
    op.drop_table("games")
