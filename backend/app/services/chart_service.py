import os
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi import HTTPException, status

from app.models.chart import Chart
from app.models.placement import Placement
from app.schemas.chart import ExtractedChartSchema, ChartUpdateSchema, ChartConfirmRequest
from app.core.config import settings
from app.core.logging import logger


class ChartService:
    @staticmethod
    async def create_from_extraction(
        db: AsyncSession,
        user_id: str,
        extracted: ExtractedChartSchema,
        original_filename: Optional[str] = None,
        stored_path: Optional[str] = None
    ) -> Chart:
        chart = Chart(
            user_id=user_id,
            title=f"Kundli - {extracted.ascendant_sign or 'Birth Chart'}",
            chart_type=extracted.chart_type,
            ascendant_sign=extracted.ascendant_sign,
            ascendant_degree=extracted.ascendant_degree,
            detected_language=extracted.detected_language,
            raw_evidence=extracted.readable_evidence,
            uncertain_fields=extracted.uncertain_fields,
            review_flags=extracted.review_flags,
            is_confirmed=False,
            calculation_engine="gemini_multimodal_extracted",
            original_filename=original_filename,
            stored_file_path=stored_path
        )
        db.add(chart)
        await db.flush()

        # Add placements
        for p in extracted.placements:
            placement = Placement(
                chart_id=chart.id,
                planet=p.planet,
                sign=p.sign,
                house=p.house,
                degree=p.degree,
                nakshatra=p.nakshatra,
                nakshatra_pada=p.nakshatra_pada,
                is_retrograde=p.is_retrograde,
                is_combust=p.is_combust,
                notes=p.notes
            )
            db.add(placement)

        await db.commit()
        await db.refresh(chart)
        logger.info(f"Created chart {chart.id} for user {user_id} with {len(extracted.placements)} placements.")
        return chart

    @staticmethod
    async def get_chart(db: AsyncSession, chart_id: str, user_id: str) -> Chart:
        stmt = select(Chart).where(Chart.id == chart_id, Chart.user_id == user_id)
        result = await db.execute(stmt)
        chart = result.scalar_one_or_none()
        if not chart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chart not found or you do not have permission to access it."
            )
        return chart

    @staticmethod
    async def list_user_charts(db: AsyncSession, user_id: str) -> List[Chart]:
        stmt = select(Chart).where(Chart.user_id == user_id).order_by(Chart.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_chart(
        db: AsyncSession,
        chart_id: str,
        user_id: str,
        update_data: ChartUpdateSchema
    ) -> Chart:
        chart = await ChartService.get_chart(db, chart_id, user_id)

        if update_data.title is not None:
            chart.title = update_data.title
        if update_data.chart_type is not None:
            chart.chart_type = update_data.chart_type
        if update_data.ascendant_sign is not None:
            chart.ascendant_sign = update_data.ascendant_sign
        if update_data.ascendant_degree is not None:
            chart.ascendant_degree = update_data.ascendant_degree

        if update_data.placements is not None:
            # Replace existing placements with the user-corrected list
            await db.execute(delete(Placement).where(Placement.chart_id == chart.id))
            for p in update_data.placements:
                new_placement = Placement(
                    chart_id=chart.id,
                    planet=p.planet,
                    sign=p.sign,
                    house=p.house,
                    degree=p.degree,
                    nakshatra=p.nakshatra,
                    nakshatra_pada=p.nakshatra_pada,
                    is_retrograde=p.is_retrograde,
                    is_combust=p.is_combust,
                    notes=p.notes
                )
                db.add(new_placement)

        chart.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(chart)
        logger.info(f"Updated chart {chart.id} fields by user {user_id}.")
        return chart

    @staticmethod
    async def confirm_chart(
        db: AsyncSession,
        chart_id: str,
        user_id: str,
        confirm_req: ChartConfirmRequest
    ) -> Chart:
        chart = await ChartService.get_chart(db, chart_id, user_id)
        chart.is_confirmed = confirm_req.confirmed
        chart.confirmed_at = datetime.now(timezone.utc) if confirm_req.confirmed else None

        # Add confirmation flag notes if provided
        if confirm_req.user_notes:
            flags = list(chart.review_flags or [])
            flags.append(f"User confirmation note: {confirm_req.user_notes}")
            chart.review_flags = flags

        chart.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(chart)
        logger.info(f"Chart {chart.id} confirmation status set to {chart.is_confirmed} by user {user_id}.")
        return chart

    @staticmethod
    async def delete_chart(db: AsyncSession, chart_id: str, user_id: str) -> bool:
        chart = await ChartService.get_chart(db, chart_id, user_id)

        # File cleanup if stored
        if chart.stored_file_path and os.path.exists(chart.stored_file_path):
            try:
                os.remove(chart.stored_file_path)
            except Exception as e:
                logger.warning(f"Could not delete stored file {chart.stored_file_path}: {e}")

        await db.delete(chart)
        await db.commit()
        logger.info(f"Deleted chart {chart.id} by user {user_id}.")
        return True
