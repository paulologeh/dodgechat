import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TSVECTOR


class TSVector(sa.types.TypeDecorator):
    impl = TSVECTOR
