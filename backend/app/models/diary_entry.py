import uuid
from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, String, ForeignKey, Boolean, Integer, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import db



def utcnow():
    return datetime.now(timezone.utc)

class DiaryEntry(db.Model):
    __tablename__ = "diary_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    food_id: Mapped[uuid.UUID] = mapped_column(
            db.Uuid(as_uuid=True), ForeignKey("foods.id"), primary_key=True
        )
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    amount_g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    carbs_g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    fat_g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )

    user = relationship("User", back_populates="diary_entries")
    food = relationship("Food", back_populates="diary_entries")
