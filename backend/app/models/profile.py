import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, ForeignKey, Boolean, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import db



def utcnow():
    return datetime.now(timezone.utc)

class Profile(db.Model):
    __tablename__ = "profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(16), nullable=False)
    height_cm: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    weight_cm: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    activity_level: Mapped[str] = mapped_column(String(32), nullable=False)
    goal: Mapped[str] = mapped_column(String(16), nullable=False)
    bmr: Mapped[int] = mapped_column(Integer, nullable=False)
    tdee: Mapped[int] = mapped_column(Integer, nullable=False)
    target_calorie: Mapped[int] = mapped_column(Integer, nullable=False)
    target_protein_g: Mapped[int] = mapped_column(Integer, nullable=False)
    target_carbs_g: Mapped[int] = mapped_column(Integer, nullable=False)
    target_fat_g: Mapped[int] = mapped_column(Integer, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    user = relationship("User", back_populates="profile")