"""set user id to null in conversation and message on delete

Revision ID: b61d57e7155a
Revises: 6441f6a4ee7c
Create Date: 2022-12-24 22:53:00.375898

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b61d57e7155a"
down_revision = "6441f6a4ee7c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "conversations_recipient_id_fkey", "conversations", type_="foreignkey"
    )
    op.drop_constraint(
        "conversations_sender_id_fkey", "conversations", type_="foreignkey"
    )
    op.create_foreign_key(
        None, "conversations", "users", ["sender_id"], ["id"], ondelete="SET NULL"
    )
    op.create_foreign_key(
        None, "conversations", "users", ["recipient_id"], ["id"], ondelete="SET NULL"
    )
    op.drop_constraint("messages_sender_id_fkey", "messages", type_="foreignkey")
    op.create_foreign_key(
        None, "messages", "users", ["sender_id"], ["id"], ondelete="SET NULL"
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "messages", type_="foreignkey")
    op.create_foreign_key(
        "messages_sender_id_fkey", "messages", "users", ["sender_id"], ["id"]
    )
    op.drop_constraint(None, "conversations", type_="foreignkey")
    op.drop_constraint(None, "conversations", type_="foreignkey")
    op.create_foreign_key(
        "conversations_sender_id_fkey", "conversations", "users", ["sender_id"], ["id"]
    )
    op.create_foreign_key(
        "conversations_recipient_id_fkey",
        "conversations",
        "users",
        ["recipient_id"],
        ["id"],
    )
    # ### end Alembic commands ###