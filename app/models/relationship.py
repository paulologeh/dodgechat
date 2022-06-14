from sqlalchemy import true
from app import db
from datetime import datetime
from enum import Enum


class RelationshipType(Enum):
    FRIEND = "FRIEND"
    BLOCK = "BLOCK"


class Relationship(db.Model):
    __tablename__ = "relationships"
    from_id = db.Column(db.Integer, db.ForeignKey("users.id"))  # requester
    to_id = db.Column(db.Integer, index=True)  # requestee
    user = db.relationship("User")
    relationship_type = db.Column(db.Enum(RelationshipType))
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)

    __table_args__ = (
        db.PrimaryKeyConstraint(
            from_id,
            to_id,
        ),
    )
