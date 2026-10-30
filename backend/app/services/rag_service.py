import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings
from app.core.logging import logger
from app.schemas.chat import SourceReference

COLLECTION_NAME = "vedic_astrology_knowledge"


class RAGService:
    def __init__(self):
        self.enabled = settings.RAG_ENABLED
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        self._client = None
        self._collection = None

        if self.enabled:
            try:
                os.makedirs(self.persist_dir, exist_ok=True)
                self._client = chromadb.PersistentClient(
                    path=self.persist_dir,
                    settings=ChromaSettings(anonymized_telemetry=False)
                )
                self._collection = self._client.get_or_create_collection(
                    name=COLLECTION_NAME,
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info(f"ChromaDB initialized at {self.persist_dir} (Collection: {COLLECTION_NAME})")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                self._client = None
                self._collection = None

    @property
    def is_configured(self) -> bool:
        if not self.enabled or not self._collection:
            return False
        try:
            return self._collection.count() > 0
        except Exception:
            return False

    def get_status(self) -> Dict[str, Any]:
        count = 0
        if self._collection:
            try:
                count = self._collection.count()
            except Exception:
                count = 0
        return {
            "rag_enabled": self.enabled,
            "is_configured": self.is_configured,
            "indexed_chunks": count,
            "storage_path": self.persist_dir
        }

    def retrieve_relevant_passages(self, query: str, top_k: int = 3) -> List[SourceReference]:
        """
        Retrieves relevant passages from ChromaDB.
        Returns an empty list if RAG is unconfigured, disabled, or no matches are found.
        """
        if not self.is_configured or not query.strip():
            return []

        try:
            results = self._collection.query(
                query_texts=[query],
                n_results=min(top_k, self._collection.count())
            )

            passages: List[SourceReference] = []
            if not results or not results.get("documents") or not results["documents"][0]:
                return passages

            docs = results["documents"][0]
            metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

            for doc, meta, dist in zip(docs, metas, distances):
                # Cosine distance to similarity score
                similarity = round(max(0.0, 1.0 - dist), 3) if dist is not None else None
                meta = meta or {}
                passages.append(
                    SourceReference(
                        title=meta.get("title", "Traditional Reference"),
                        category=meta.get("category", "General"),
                        excerpt=doc.strip(),
                        relevance_score=similarity
                    )
                )

            return passages

        except Exception as e:
            logger.error(f"Error querying ChromaDB RAG: {e}")
            return []

    def index_document(
        self,
        doc_id_prefix: str,
        title: str,
        category: str,
        content: str,
        chunk_size: int = 600,
        chunk_overlap: int = 100
    ) -> int:
        """
        Chunks and indexes a reference text document into ChromaDB.
        """
        if not self._collection:
            logger.warning("Cannot index document: ChromaDB is not initialized.")
            return 0

        chunks = self._chunk_text(content, chunk_size, chunk_overlap)
        if not chunks:
            return 0

        ids = [f"{doc_id_prefix}_{i}" for i in range(len(chunks))]
        documents = chunks
        metadatas = [
            {
                "title": title,
                "category": category,
                "chunk_index": i,
                "total_chunks": len(chunks)
            }
            for i in range(len(chunks))
        ]

        try:
            self._collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            logger.info(f"Indexed {len(chunks)} chunks for '{title}' (Category: {category})")
            return len(chunks)
        except Exception as e:
            logger.error(f"Failed to upsert chunks into ChromaDB: {e}")
            return 0

    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        # Split by double newlines or headings first for semantic coherence
        sections = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for section in sections:
            section = section.strip()
            if not section:
                continue

            if len(current_chunk) + len(section) <= chunk_size:
                current_chunk += ("\n\n" + section if current_chunk else section)
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = section

        if current_chunk:
            chunks.append(current_chunk)

        return chunks


rag_service = RAGService()
