import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Chart(Base):
    __tablename__ = "charts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="My Kundli", nullable=False)
    chart_type = Column(String(50), default="north_indian", nullable=False)  # north_indian, south_indian, east_indian, unknown
    ascendant_sign = Column(String(50), nullable=True)  # e.g., Mesha / Aries
    ascendant_degree = Column(Float, nullable=True)
    detected_language = Column(String(20), default="en", nullable=False)
    raw_evidence = Column(Text, nullable=True)
    uncertain_fields = Column(JSON, default=list, nullable=False)
    review_flags = Column(JSON, default=list, nullable=False)
    is_confirmed = Column(Boolean, default=False, nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    calculation_engine = Column(String(100), default="gemini_multimodal_extracted", nullable=False)
    original_filename = Column(String(255), nullable=True)
    stored_file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="charts")
    placements = relationship("Placement", back_populates="chart", cascade="all, delete-orphan", lazy="selectin")
    conversations = relationship("Conversation", back_populates="chart", cascade="all, delete-orphan")
