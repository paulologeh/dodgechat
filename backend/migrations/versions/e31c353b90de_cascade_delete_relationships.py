"""cascade delete relationships

Revision ID: e31c353b90de
Revises: 
Create Date: 2022-11-29 23:01:06.704897

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e31c353b90de"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(
        "relationships_requester_id_fkey", "relationships", type_="foreignkey"
    )
    op.create_foreign_key(
        None, "relationships", "users", ["requester_id"], ["id"], ondelete="CASCADE"
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, "relationships", type_="foreignkey")
    op.create_foreign_key(
        "relationships_requester_id_fkey",
        "relationships",
        "users",
        ["requester_id"],
        ["id"],
    )
    # ### end Alembic commands ###
