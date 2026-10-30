import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_file = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    chunk_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
