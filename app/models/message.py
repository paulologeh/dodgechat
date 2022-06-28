from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid


from app import db


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), index=True)
    conversation_id = db.Column(UUID(as_uuid=True), index=True)
    body = db.Column(db.Text())
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)
    delivered_at = db.Column(db.DateTime(), default=datetime.utcnow)

