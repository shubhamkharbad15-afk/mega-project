"""Persist municipal work-order assignment and resolution details."""
from alembic import op
import sqlalchemy as sa

revision = "0002_report_workflow"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("road_reports", sa.Column("assigned_contractor", sa.String(length=150), nullable=True))
    op.add_column("road_reports", sa.Column("budget_allocated", sa.Integer(), nullable=True))
    op.add_column("road_reports", sa.Column("resolution_note", sa.Text(), nullable=True))
    op.add_column("road_reports", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))


def downgrade() -> None:
    op.drop_column("road_reports", "updated_at")
    op.drop_column("road_reports", "resolution_note")
    op.drop_column("road_reports", "budget_allocated")
    op.drop_column("road_reports", "assigned_contractor")
