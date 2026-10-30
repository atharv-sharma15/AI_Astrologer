import pytest
import io
from PIL import Image
from fastapi import HTTPException
from app.services.file_processing import FileProcessingService, detect_file_signature


def create_test_image_bytes(fmt="PNG") -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    img.save(buf, format=fmt)
    return buf.getvalue()


def test_detect_file_signature():
    # PNG
    png_bytes = create_test_image_bytes("PNG")
    sig = detect_file_signature(png_bytes[:16])
    assert sig == ("image", "image/png")

    # JPEG
    jpeg_bytes = create_test_image_bytes("JPEG")
    sig = detect_file_signature(jpeg_bytes[:16])
    assert sig == ("image", "image/jpeg")

    # PDF header
    pdf_header = b"%PDF-1.4\n%test"
    sig = detect_file_signature(pdf_header)
    assert sig == ("pdf", "application/pdf")

    # Malicious or spoofed text file
    fake_header = b"Hello, this is just a plain text file pretending to be an image."
    sig = detect_file_signature(fake_header)
    assert sig is None


def test_valid_image_processing():
    png_bytes = create_test_image_bytes("PNG")
    result = FileProcessingService.validate_and_process(png_bytes, "chart.png")
    assert result.file_type == "image"
    assert result.mime_type == "image/png"
    assert len(result.images) == 1
    assert result.images[0].size == (100, 100)


def test_reject_spoofed_file():
    fake_bytes = b"This is not a real PNG file, even if named chart.png"
    with pytest.raises(HTTPException) as exc_info:
        FileProcessingService.validate_and_process(fake_bytes, "chart.png")
    assert exc_info.value.status_code == 400
    assert "signature does not match" in exc_info.value.detail


def test_reject_empty_file():
    with pytest.raises(HTTPException) as exc_info:
        FileProcessingService.validate_and_process(b"", "empty.png")
    assert exc_info.value.status_code == 400
    assert "empty" in exc_info.value.detail.lower()


def test_reject_oversized_file():
    huge_bytes = b"\x89PNG\r\n\x1a\n" + b"0" * (11 * 1024 * 1024)
    with pytest.raises(HTTPException) as exc_info:
        FileProcessingService.validate_and_process(huge_bytes, "huge.png")
    assert exc_info.value.status_code == 413
