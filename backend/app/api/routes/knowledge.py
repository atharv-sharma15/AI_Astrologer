from typing import List
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.rag_service import rag_service
from app.schemas.chat import SourceReference

router = APIRouter(prefix="/knowledge", tags=["Vedic Knowledge Base & RAG"])


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=500)
    top_k: int = Field(3, ge=1, le=10)


@router.get("/status")
async def get_knowledge_status():
    """
    Returns current RAG vector database status, chunk count, and readiness.
    """
    return rag_service.get_status()


@router.post("/search", response_model=List[SourceReference])
async def search_knowledge(search_req: KnowledgeSearchRequest):
    """
    Directly queries the curated astrology knowledge base using ChromaDB.
    """
    passages = rag_service.retrieve_relevant_passages(
        query=search_req.query,
        top_k=search_req.top_k
    )
    return passages
