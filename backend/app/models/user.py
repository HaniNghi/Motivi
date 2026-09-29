import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import db

def utcnow():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False) #if there is google_sub then str | None and nullable=True
    # google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    profile = relationship("Profile", back_populates="user", uselist=False)
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    diary_entries = relationship("DiaryEntry", back_populates="user")
    custom_foods = relationship("Food", back_populates="creator")