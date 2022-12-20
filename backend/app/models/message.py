import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import backref

from app import db


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", backref=backref("messages", uselist=False))
    conversation_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("conversations.id", ondelete="CASCADE")
    )
    conversation = db.relationship("Conversation", back_populates="message")
    body = db.Column(db.Text(), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
