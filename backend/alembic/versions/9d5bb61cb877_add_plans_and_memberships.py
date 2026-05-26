"""add_plans_and_memberships

Revision ID: 9d5bb61cb877
Revises: 001
Create Date: 2026-05-26 13:56:59.370336

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '9d5bb61cb877'
down_revision: Union[str, Sequence[str], None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'plans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('duration_days', sa.Integer(), nullable=False),
        sa.Column('features', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('active', 'inactive', name='planstatus'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )
    op.create_table(
        'memberships',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('member_id', sa.Integer(), nullable=False),
        sa.Column('plan_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.Enum('active', 'expired', 'cancelled', name='membershipstatus'), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], name='fk_memberships_member'),
        sa.ForeignKeyConstraint(['plan_id'], ['plans.id'], name='fk_memberships_plan'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('memberships')
    op.drop_table('plans')
    op.execute('DROP TYPE IF EXISTS planstatus')
    op.execute('DROP TYPE IF EXISTS membershipstatus')
