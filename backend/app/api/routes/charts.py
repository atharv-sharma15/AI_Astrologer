import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chart import ChartResponse, ChartUpdateSchema, ChartConfirmRequest
from app.services.file_processing import FileProcessingService
from app.services.gemini_service import gemini_service
from app.services.chart_service import ChartService
from app.core.logging import logger

router = APIRouter(prefix="/charts", tags=["Charts (Kundli)"])


@router.post("/upload", response_model=ChartResponse, status_code=status.HTTP_201_CREATED)
async def upload_kundli(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a Kundli image or PDF (JPG, JPEG, PNG, WEBP, PDF).
    Performs content magic-byte verification, page limits, PyMuPDF page rendering,
    and Gemini multimodal extraction.
    Creates an unconfirmed chart record requiring explicit human user review.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    # Read uploaded bytes
    file_bytes = await file.read()

    # 1. Validate magic bytes, size, and extract text / images
    processed = FileProcessingService.validate_and_process(file_bytes, file.filename)

    # 2. File retention logic
    stored_path = None
    if not settings.DELETE_UPLOAD_AFTER_EXTRACTION:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        safe_ext = processed.mime_type.split("/")[-1].replace("jpeg", "jpg")
        stored_filename = f"{uuid.uuid4().hex}.{safe_ext}"
        stored_path = os.path.join(settings.UPLOAD_DIR, stored_filename)
        try:
            with open(stored_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            logger.warning(f"Could not persist upload file: {e}")
            stored_path = None

    # 3. Multimodal extraction with Gemini
    extracted_data = await gemini_service.extract_chart_multimodal(
        images=processed.images,
        extracted_text=processed.extracted_text
    )

    # 4. Save to database
    chart = await ChartService.create_from_extraction(
        db=db,
        user_id=current_user.id,
        extracted=extracted_data,
        original_filename=file.filename,
        stored_path=stored_path
    )

    return ChartResponse.model_validate(chart)


@router.get("", response_model=List[ChartResponse])
async def list_charts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all charts owned by the current user.
    """
    charts = await ChartService.list_user_charts(db, current_user.id)
    return [ChartResponse.model_validate(c) for c in charts]


@router.get("/{chart_id}", response_model=ChartResponse)
async def get_chart(
    chart_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves chart by ID. Strictly validates user ownership.
    """
    chart = await ChartService.get_chart(db, chart_id, current_user.id)
    return ChartResponse.model_validate(chart)


@router.patch("/{chart_id}", response_model=ChartResponse)
async def update_chart(
    chart_id: str,
    update_data: ChartUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Allows user to correct extracted fields (Lagna, chart type, placements)
    during the review phase.
    """
    updated_chart = await ChartService.update_chart(
        db, chart_id, current_user.id, update_data
    )
    return ChartResponse.model_validate(updated_chart)


@router.post("/{chart_id}/confirm", response_model=ChartResponse)
async def confirm_chart(
    chart_id: str,
    confirm_data: ChartConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    User explicitly confirms that the extracted data matches their chart.
    Enables chart-specific astrological readings.
    """
    confirmed_chart = await ChartService.confirm_chart(
        db, chart_id, current_user.id, confirm_data
    )
    return ChartResponse.model_validate(confirmed_chart)


@router.delete("/{chart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chart(
    chart_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes user-owned chart and any stored file assets.
    """
    await ChartService.delete_chart(db, chart_id, current_user.id)
    return None
