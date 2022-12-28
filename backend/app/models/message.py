import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID


from app import db


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    sender_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    user = db.relationship("User", back_populates="messages")
    conversation_id = db.Column(
        UUID(as_uuid=True), db.ForeignKey("conversations.id", ondelete="CASCADE")
    )
    conversation = db.relationship("Conversation", back_populates="messages")
    body = db.Column(db.Text(), nullable=False)
    read = db.Column(db.DateTime())
    created_at = db.Column(db.DateTime(), default=datetime.utcnow, index=True)
    deleted_by = db.Column(
        db.Integer, index=True
    )  # if deleted by both, the message will not exist
