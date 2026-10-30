import io
from typing import List, Tuple, Optional
from dataclasses import dataclass
from PIL import Image
import pymupdf
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.logging import logger


@dataclass
class ProcessedFileResult:
    file_type: str  # "image" or "pdf"
    mime_type: str
    extracted_text: str
    images: List[Image.Image]  # PIL images ready for Gemini multimodal input
    page_count: int
    raw_bytes: bytes


def detect_file_signature(header: bytes) -> Optional[Tuple[str, str]]:
    """
    Inspects magic bytes to detect actual file type.
    Does NOT trust file extension or Content-Type headers.
    Returns (category, mime_type) or None if unsupported.
    """
    if len(header) < 12:
        return None

    # JPEG signature: FF D8 FF
    if header.startswith(b"\xff\xd8\xff"):
        return ("image", "image/jpeg")

    # PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return ("image", "image/png")

    # WEBP signature: RIFF....WEBP
    if header.startswith(b"RIFF") and header[8:12] == b"WEBP":
        return ("image", "image/webp")

    # PDF signature: %PDF-
    if header.startswith(b"%PDF-"):
        return ("pdf", "application/pdf")

    return None


class FileProcessingService:
    @staticmethod
    def validate_and_process(file_bytes: bytes, original_filename: str) -> ProcessedFileResult:
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE if hasattr(status, "HTTP_413_CONTENT_TOO_LARGE") else 413,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
            )

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        sig = detect_file_signature(file_bytes[:16])
        if not sig:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. The file signature does not match supported formats (JPEG, PNG, WEBP, PDF)."
            )

        category, mime_type = sig

        if category == "image":
            return FileProcessingService._process_image(file_bytes, mime_type)
        elif category == "pdf":
            return FileProcessingService._process_pdf(file_bytes, original_filename)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format."
            )

    @staticmethod
    def _process_image(file_bytes: bytes, mime_type: str) -> ProcessedFileResult:
        try:
            # Verify file integrity using Pillow
            with Image.open(io.BytesIO(file_bytes)) as img_check:
                img_check.verify()

            # Reopen for actual processing (verify closes stream)
            image = Image.open(io.BytesIO(file_bytes))
            # Convert palette/RGBA to RGB for compatibility if needed
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            return ProcessedFileResult(
                file_type="image",
                mime_type=mime_type,
                extracted_text="",
                images=[image],
                page_count=1,
                raw_bytes=file_bytes
            )
        except Exception as e:
            logger.error(f"Image integrity verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or malformed image file. Please upload a valid image."
            )

    @staticmethod
    def _process_pdf(file_bytes: bytes, original_filename: str) -> ProcessedFileResult:
        try:
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            logger.error(f"PDF parsing failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or encrypted PDF. Please upload an unencrypted, valid PDF."
            )

        try:
            page_count = doc.page_count
            if page_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PDF contains no pages."
                )

            if page_count > settings.MAX_PDF_PAGES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"PDF has {page_count} pages, which exceeds the limit of {settings.MAX_PDF_PAGES} pages."
                )

            extracted_text_parts = []
            rendered_images: List[Image.Image] = []

            for page_index in range(page_count):
                page = doc.load_page(page_index)
                page_text = page.get_text()
                if page_text.strip():
                    extracted_text_parts.append(f"--- Page {page_index + 1} ---\n{page_text.strip()}")

                # Render page at 150 DPI for Gemini multimodal OCR
                pix = page.get_pixmap(dpi=150)
                img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
                rendered_images.append(img)

            full_text = "\n\n".join(extracted_text_parts)

            return ProcessedFileResult(
                file_type="pdf",
                mime_type="application/pdf",
                extracted_text=full_text,
                images=rendered_images,
                page_count=page_count,
                raw_bytes=file_bytes
            )
        finally:
            doc.close()
