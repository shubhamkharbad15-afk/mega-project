"""Initial AI Road Quality schema."""

from alembic import op
import sqlalchemy as sa

from geoalchemy2 import Geometry


revision = "0001_initial_schema"

down_revision = None

branch_labels = None

depends_on = None


def upgrade() -> None:

    op.execute(
        "CREATE EXTENSION IF NOT EXISTS postgis"
    )

    op.create_table(

        "users",

        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
        ),

        sa.Column(
            "name",
            sa.String(100),
            nullable=False,
        ),

        sa.Column(
            "email",
            sa.String(255),
            nullable=False,
            unique=True,
        ),

        sa.Column(
            "password_hash",
            sa.String(255),
            nullable=False,
        ),

        sa.Column(
            "phone",
            sa.String(20),
        ),

        sa.Column(
            "role",
            sa.String(20),
            nullable=False,
            server_default="user",
        ),

        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )


    op.create_table(

        "detections",

        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
        ),

        sa.Column(
            "image_path",
            sa.String(500),
            nullable=False,
        ),

        sa.Column(
            "result_image_path",
            sa.String(500),
        ),

        sa.Column(
            "model_version",
            sa.String(100),
            nullable=False,
        ),

        sa.Column(
            "confidence",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "severity",
            sa.String(20),
            nullable=False,
        ),

        sa.Column(
            "risk_score",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "latitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "longitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "location",
            Geometry(
                "POINT",
                srid=4326,
            ),
        ),

        sa.Column(
            "detections_json",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "created_by",
            sa.UUID(),
            sa.ForeignKey(
                "users.id"
            ),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


    op.create_table(

        "road_reports",

        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
        ),

        sa.Column(
            "title",
            sa.String(150),
            nullable=False,
        ),

        sa.Column(
            "description",
            sa.Text(),
        ),

        sa.Column(
            "status",
            sa.String(30),
            nullable=False,
            server_default="confirmed",
        ),

        sa.Column(
            "severity",
            sa.String(20),
            nullable=False,
        ),

        sa.Column(
            "latitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "longitude",
            sa.Float(),
            nullable=False,
        ),

        sa.Column(
            "location",
            Geometry(
                "POINT",
                srid=4326,
            ),
        ),

        sa.Column(
            "evidence",
            sa.JSON(),
            nullable=False,
        ),

        sa.Column(
            "detection_id",
            sa.UUID(),
            sa.ForeignKey(
                "detections.id"
            ),
        ),

        sa.Column(
            "citizen_id",
            sa.UUID(),
            sa.ForeignKey(
                "users.id"
            ),
            nullable=False,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


    op.create_table(

        "notifications",

        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
        ),

        sa.Column(
            "user_id",
            sa.UUID(),
            sa.ForeignKey(
                "users.id"
            ),
            nullable=False,
        ),

        sa.Column(
            "title",
            sa.String(150),
            nullable=False,
        ),

        sa.Column(
            "message",
            sa.Text(),
            nullable=False,
        ),

        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:

    op.drop_table(
        "notifications"
    )

    op.drop_table(
        "road_reports"
    )

    op.drop_table(
        "detections"
    )

    op.drop_index(
        "ix_users_email",
        table_name="users",
    )

    op.drop_table(
        "users"
    )