import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import db



def utcnow():
    return datetime.now(timezone.utc)

class Food(db.Model):
    __tablename__ = "foods"

    id: Mapped[uuid.UUID] = mapped_column(
        db.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    off_code: Mapped[str | None] = mapped_column(String(64), unique=True ,nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(255), nullable=True)
    calories_per_100g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    calories_per_100ml: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    protein_per_100g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    carbs_per_100g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    fat_per_100g: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    source: Mapped[str] = mapped_column(String(16), nullable=False)
    created_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        db.Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
 

    creator = relationship("User", back_populates="custom_foods")
    diary_entries = relationship("DiaryEntry", back_populates="food")
