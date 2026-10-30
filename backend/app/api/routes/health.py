from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings
from app.services.gemini_service import gemini_service
from app.services.rag_service import rag_service
from app.services.calculation_service import ephemeris_service
from app.services.chart_service import ChartService
from app.services.chat_service import ChatService
from app.schemas.chart import ExtractedChartSchema, PlacementBase, ChartConfirmRequest
from app.schemas.chat import ConversationCreate
from app.models.user import User

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Comprehensive health check verifying DB connectivity, Gemini AI configuration,
    and ChromaDB RAG vector store state.
    """
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    rag_status = rag_service.get_status()

    return {
        "status": "healthy" if db_ok else "degraded",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "database_connected": db_ok,
        "gemini_ai": {
            "configured": gemini_service.is_configured,
            "model": settings.GEMINI_MODEL,
            "mode": "live_gemini" if gemini_service.is_configured else "development_fallback"
        },
        "rag_vector_db": rag_status,
        "ephemeris_engine": {
            "configured": ephemeris_service.enabled,
            "provenance_mode": "strict_unverified_unless_calculated"
        }
    }


from app.api.deps import get_current_user
from app.core.security import create_access_token

@router.post("/api/health/seed-demo")
async def seed_demo_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Seeds a sample verified Aries Lagna chart with rich placements (exalted Sun, exalted Mars in 10th house,
    exalted Saturn in 7th house, Venus & Moon in 2nd house) and a consultation conversation for the active user.
    """
    sample_extracted = ExtractedChartSchema(
        chart_type="north_indian",
        ascendant_sign="Aries",
        ascendant_degree=14.2,
        detected_language="en",
        readable_evidence="Verified Kundli with Mesha Lagna, exalted Sun in 1st house, exalted Mars in 10th house",
        uncertain_fields=[],
        review_flags=["Pre-verified sample chart for testing"],
        placements=[
            PlacementBase(planet="Sun", sign="Aries", house=1, degree=19.4, nakshatra="Bharani", nakshatra_pada=2),
            PlacementBase(planet="Moon", sign="Taurus", house=2, degree=11.1, nakshatra="Rohini", nakshatra_pada=1),
            PlacementBase(planet="Mars", sign="Capricorn", house=10, degree=28.0, nakshatra="Dhanishta", nakshatra_pada=2),
            PlacementBase(planet="Mercury", sign="Pisces", house=12, degree=3.2, is_retrograde=True),
            PlacementBase(planet="Jupiter", sign="Cancer", house=4, degree=5.0, nakshatra="Pushya", nakshatra_pada=1),
            PlacementBase(planet="Venus", sign="Taurus", house=2, degree=22.8, nakshatra="Rohini", nakshatra_pada=4),
            PlacementBase(planet="Saturn", sign="Libra", house=7, degree=20.5, nakshatra="Vishakha", nakshatra_pada=1),
            PlacementBase(planet="Rahu", sign="Gemini", house=3, degree=14.0, is_retrograde=True),
            PlacementBase(planet="Ketu", sign="Sagittarius", house=9, degree=14.0, is_retrograde=True),
        ]
    )

    chart = await ChartService.create_from_extraction(
        db, current_user.id, sample_extracted, original_filename="demo_kundli.png"
    )
    # Confirm chart
    await ChartService.confirm_chart(db, chart.id, current_user.id, ChartConfirmRequest(confirmed=True, user_notes="Verified demo Kundli"))

    # Create demo conversation
    conv = await ChatService.create_conversation(
        db, current_user.id, ConversationCreate(
            chart_id=chart.id,
            title="Aries Lagna Kundli Reading",
            preferred_language="en"
        )
    )

    token = create_access_token({"sub": current_user.id, "is_guest": current_user.is_guest})

    return {
        "status": "seeded",
        "user_id": current_user.id,
        "access_token": token,
        "chart_id": chart.id,
        "conversation_id": conv.id
    }
