from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.chart import ChartResponse


class SourceReference(BaseModel):
    title: str = Field(..., description="Title of the reference document or chapter")
    category: str = Field(..., description="Vedic category (graha, bhava, rashi, nakshatra, principles)")
    excerpt: str = Field(..., description="Relevant passage retrieved from knowledge base")
    relevance_score: Optional[float] = Field(None, description="Similarity score from vector search")


class ConversationCreate(BaseModel):
    chart_id: Optional[str] = None
    title: Optional[str] = "Astrology Consultation"
    preferred_language: Optional[str] = "en"  # en or hi


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="User question or inquiry")
    language: Optional[str] = Field(None, description="Optional override for language ('en' or 'hi')")


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    sources: List[SourceReference] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    chart_id: Optional[str] = None
    title: str
    preferred_language: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    chart: Optional[ChartResponse] = None

    class Config:
        from_attributes = True
