import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.logging import logger
from app.services.rag_service import rag_service

CATEGORY_MAP = {
    "01_navagrahas.md": ("The Navagrahas", "graha"),
    "02_bhavas_houses.md": ("The Twelve Bhavas", "bhava"),
    "03_rashis_zodiac.md": ("The Twelve Rashis", "rashi"),
    "04_nakshatras.md": ("The 27 Nakshatras", "nakshatra"),
    "05_vedic_principles.md": ("Core Vedic Principles", "principles"),
}


def ingest_knowledge_base():
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    if not os.path.isabs(kb_dir):
        kb_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", kb_dir))

    if not os.path.exists(kb_dir):
        logger.error(f"Knowledge base directory not found: {kb_dir}")
        return

    logger.info(f"Scanning knowledge base directory: {kb_dir}")
    files = sorted(os.listdir(kb_dir))
    total_indexed_chunks = 0

    for fname in files:
        if not fname.endswith(".md"):
            continue

        fpath = os.path.join(kb_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        title, category = CATEGORY_MAP.get(fname, (fname.replace(".md", "").title(), "general"))
        doc_prefix = fname.replace(".md", "")

        chunks = rag_service.index_document(
            doc_id_prefix=doc_prefix,
            title=title,
            category=category,
            content=content,
            chunk_size=500,
            chunk_overlap=80
        )
        total_indexed_chunks += chunks
        logger.info(f"-> Successfully ingested '{fname}': {chunks} chunks")

    status = rag_service.get_status()
    logger.info(f"Ingestion complete! Total collection count: {status.get('indexed_chunks', 0)}")


if __name__ == "__main__":
    ingest_knowledge_base()
