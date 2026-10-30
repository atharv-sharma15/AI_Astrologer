import pytest
from app.services.rag_service import rag_service


def test_rag_status():
    status = rag_service.get_status()
    assert "rag_enabled" in status
    assert "indexed_chunks" in status
    assert status["rag_enabled"] is True


def test_rag_retrieval_with_keywords():
    # Knowledge base was ingested with 33 chunks
    passages = rag_service.retrieve_relevant_passages("Surya Sun father atman vitality", top_k=2)
    assert len(passages) > 0
    first = passages[0]
    assert first.title is not None
    assert first.category is not None
    assert len(first.excerpt) > 10


def test_rag_empty_query():
    passages = rag_service.retrieve_relevant_passages("", top_k=3)
    assert passages == []
