import uuid
from datetime import datetime

from sqlalchemy import and_, or_
from sqlalchemy.dialects.postgresql import UUID

from app import db


class UniqueConstraint(Exception):
    pass


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    _sender_id = db.Column("sender_id", db.Integer, db.ForeignKey("users.id"))
    recipient_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)
    message = db.relationship("Message")
    sender = db.relationship("User", foreign_keys=[_sender_id])
    recipient = db.relationship("User", foreign_keys=[recipient_id])

    @classmethod
    def conversation_exists(cls, sender_id: int, recipient_id: int) -> bool:
        results = (
            db.session.query(cls)
            .filter(
                or_(
                    and_(cls.sender_id == sender_id, cls.recipient_id == recipient_id),
                    and_(cls.sender_id == recipient_id, cls.recipient_id == sender_id),
                )
            )
            .all()
        )

        if results:
            return True

        return False

    @property
    def sender_id(self):
        return self._sender_id

    @sender_id.setter
    def sender_id(self, id: int):
        if not self.recipient_id:
            raise AttributeError("recipient_id is not set")

        if self.conversation_exists(id, self.recipient_id):
            raise UniqueConstraint("Conversation already exists")

        self._sender_id = id
