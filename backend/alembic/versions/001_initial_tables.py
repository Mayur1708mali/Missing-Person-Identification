"""create initial tables with pgvector extension

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(255), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("google_id", sa.String(255), unique=True, nullable=False),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column(
            "role",
            sa.Enum("admin", "user", name="userrole"),
            nullable=False,
            server_default="user",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Create missing_persons table
    op.create_table(
        "missing_persons",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("full_name", sa.String(255), nullable=False, index=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column(
            "gender",
            sa.Enum("male", "female", "other", name="gender"),
            nullable=False,
        ),
        sa.Column("photo_url", sa.String(512), nullable=False),
        sa.Column("last_seen_location", sa.String(500), nullable=False),
        sa.Column("last_seen_date", sa.Date(), nullable=False),
        sa.Column("height", sa.String(50), nullable=True),
        sa.Column("weight", sa.String(50), nullable=True),
        sa.Column("distinguishing_marks", sa.Text(), nullable=True),
        sa.Column("reporter_contact", sa.String(255), nullable=False),
        sa.Column(
            "case_status",
            sa.Enum("missing", "found", "under_investigation", name="casestatus"),
            nullable=False,
            server_default="missing",
        ),
        sa.Column("reported_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Create face_embeddings table
    op.create_table(
        "face_embeddings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "missing_person_id",
            sa.Integer(),
            sa.ForeignKey("missing_persons.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("embedding", Vector(128), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("face_embeddings")
    op.drop_table("missing_persons")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS casestatus")
    op.execute("DROP TYPE IF EXISTS gender")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP EXTENSION IF EXISTS vector")
