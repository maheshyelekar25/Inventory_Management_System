"""Create the inventory management schema.

Revision ID: 20260722_0001
Revises:
Create Date: 2026-07-22 00:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260722_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("full_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.String(length=20), server_default="admin", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_categories_name", "categories", ["name"], unique=False)

    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("quantity", sa.Integer(), server_default="0", nullable=False),
        sa.Column("low_stock_threshold", sa.Integer(), server_default="10", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("price >= 0", name="ck_products_product_price_nonnegative"),
        sa.CheckConstraint("quantity >= 0", name="ck_products_product_quantity_nonnegative"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("ix_products_category_id", "products", ["category_id"], unique=False)
    op.create_index("ix_products_name", "products", ["name"], unique=False)
    op.create_index("ix_products_sku", "products", ["sku"], unique=False)

    movement_type = postgresql.ENUM(
        "IN",
        "OUT",
        name="movement_type",
        create_type=False,
    )
    movement_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "stock_movements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("movement_type", movement_type, nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_stock_movements_stock_movement_quantity_positive"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_stock_movements_product_id", "stock_movements", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_stock_movements_product_id", table_name="stock_movements")
    op.drop_table("stock_movements")

    postgresql.ENUM(
        "IN",
        "OUT",
        name="movement_type",
    ).drop(op.get_bind(), checkfirst=True)

    op.drop_index("ix_products_sku", table_name="products")
    op.drop_index("ix_products_name", table_name="products")
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_table("products")

    op.drop_index("ix_categories_name", table_name="categories")
    op.drop_table("categories")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")