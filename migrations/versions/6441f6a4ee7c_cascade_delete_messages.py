"""cascade delete messages

Revision ID: 6441f6a4ee7c
Revises: 98ce5a07b0e0
Create Date: 2022-12-20 12:16:46.638253

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "6441f6a4ee7c"
down_revision = "98ce5a07b0e0"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("messages_conversation_id_fkey", "messages", type_="foreignkey")
    op.create_foreign_key(
        None,
        "messages",
        "conversations",
        ["conversation_id"],
        ["id"],
        ondelete="CASCADE",
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "messages", type_="foreignkey")
    op.create_foreign_key(
        "messages_conversation_id_fkey",
        "messages",
        "conversations",
        ["conversation_id"],
        ["id"],
    )
    # ### end Alembic commands ###