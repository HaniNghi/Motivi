import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, ForeignKey, Boolean, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import db



def utcnow():
    return datetime.now(timezone.utc)

class RefreshToken(db.Model):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
            db.Uuid(as_uuid=True),ForeignKey("users.id"), nullable=False, index=True
        )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    user = relationship("User", back_populates="refresh_tokens")