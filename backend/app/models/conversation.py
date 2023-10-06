import uuid
import logging
from datetime import datetime

from sqlalchemy import and_, or_
from sqlalchemy.dialects.postgresql import UUID

from typing import Optional
from app import db
from app.models.message import Message
from app.models.relationship import Relationship


logger = logging.getLogger(__name__)


class UniqueConstraint(Exception):
    pass


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    _sender_id = db.Column(
        "sender_id",
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    recipient_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)
    messages = db.relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete",
        passive_deletes=True,
    )
    sender = db.relationship("User", foreign_keys=[_sender_id])
    recipient = db.relationship("User", foreign_keys=[recipient_id])

    def get_messages(
        self, requester_id: int, limit: int = 10, timestamp: Optional[datetime] = None
    ):
        if timestamp:
            msgs = [
                message
                for message in db.session.query(Message)
                .filter(Message.conversation_id == self.id)
                .filter(Message.created_at < timestamp)
                .filter(or_(Message.deleted_by.is_(None), Message.deleted_by != 1))
                .order_by(Message.created_at.desc())
                .limit(limit)
                .all()
            ]

        else:
            maximum_limit = (
                db.session.query(Message)
                .filter(
                    Message.conversation_id == self.id,
                )
                .count()
            )
            msgs = [
                message
                for message in db.session.query(Message)
                .filter(Message.conversation_id == self.id)
                .filter(or_(Message.deleted_by.is_(None), Message.deleted_by != 1))
                .order_by(Message.created_at.desc())
                .limit(limit)
                .all()
            ]

            while limit <= maximum_limit and all(
                [msg.read is None for msg in msgs if msg.sender_id != requester_id]
            ):
                limit += limit
                logger.info(
                    "Fetching additional messages for user_id: %d limit: %d"
                    % (requester_id, limit)
                )

                msgs = [
                    message
                    for message in db.session.query(Message)
                    .filter(Message.conversation_id == self.id)
                    .filter(or_(Message.deleted_by.is_(None), Message.deleted_by != 1))
                    .order_by(Message.created_at.desc())
                    .limit(limit)
                    .all()
                ]

        return sorted(msgs, key=lambda x: x.created_at)

    def are_friends(self) -> bool:
        relationship_1 = Relationship.query.filter_by(
            requester_id=self.sender_id, addressee_id=self.recipient_id
        ).first()
        relationship_2 = Relationship.query.filter_by(
            requester_id=self.recipient_id, addressee_id=self.sender_id
        ).first()

        if relationship_1 and relationship_2:
            return True
        else:
            return False

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
