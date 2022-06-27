from datetime import datetime
from enum import Enum
from sqlalchemy.dialects.postgresql import UUID


from app import db


class FriendState(Enum):
    REQUESTEE = "REQUESTEE"
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    BLOCKED = "BLOCKED"


class RelationshipType(Enum):
    FRIEND = "FRIEND"
    BLOCK = "BLOCK"


class Relationship(db.Model):
    __tablename__ = "relationships"
    requester_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"))  # requester
    addressee_id = db.Column(UUID(as_uuid=True), index=True)  # requestee
    user = db.relationship("User")
    relationship_type = db.Column(db.Enum(RelationshipType))
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)

    __table_args__ = (
        db.PrimaryKeyConstraint(
            requester_id,
            addressee_id,
        ),
    )
