from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import or_, and_
import uuid


from app import db


class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    sender_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"))
    recipient_id = db.Column(UUID(as_uuid=True), db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime(), default=datetime.utcnow)

    @classmethod
    def conversation_exists(cls, sender_id: UUID, recipient_id: UUID) -> bool:
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
        else:
            return False
