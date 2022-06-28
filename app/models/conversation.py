from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid


from app import db


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    sender_id = db.Column(UUID(as_uuid=True),  db.ForeignKey("users.id"))
    recipient_id = db.Column(UUID(as_uuid=True),  db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)

