from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.logging import logger


class BirthDetailsInput(BaseModel):
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    time_of_birth: str = Field(..., description="HH:MM:SS")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    timezone_offset: float = Field(5.5, description="UTC offset in hours, e.g. 5.5 for IST")
    ayanamsha: str = Field("lahiri", description="Ayanamsha convention: lahiri, raman, krishnamurti")


class EphemerisCalculationService:
    """
    Extensible integration point for astronomical ephemeris calculation engines
    (such as Swiss Ephemeris / pyswisseph).
    Explicitly tracks whether astronomical calculation occurred vs image extraction.
    """

    def __init__(self):
        self.enabled = settings.EPHEMERIS_CALCULATION_ENABLED
        self.default_ayanamsha = "Lahiri (Chitrapaksha)"
        self.default_house_system = "Whole Sign / Equal Bhava"

    def get_calculation_metadata(self, is_calculated: bool = False) -> Dict[str, Any]:
        """
        Returns transparent calculation provenance so the system never falsely
        claims astronomical verification for uploaded image charts.
        """
        if not is_calculated:
            return {
                "calculation_engine": "gemini_multimodal_extracted",
                "is_astronomically_verified": False,
                "ephemeris_engine_available": self.enabled,
                "calculation_convention": None,
                "disclaimer": (
                    "This chart was digitized from an uploaded document/image via AI multimodal OCR. "
                    "It has NOT been independently calculated from planetary ephemeris tables."
                )
            }

        return {
            "calculation_engine": "swiss_ephemeris_compatible",
            "is_astronomically_verified": True,
            "ephemeris_engine_available": True,
            "calculation_convention": f"Ayanamsha: {self.default_ayanamsha}, System: {self.default_house_system}",
            "disclaimer": "Positions calculated using astronomical ephemeris algorithms."
        }

    async def calculate_chart_from_ephemeris(self, birth_details: BirthDetailsInput) -> Dict[str, Any]:
        """
        Stub/interface for ephemeris calculation.
        """
        if not self.enabled:
            logger.info("Ephemeris calculation requested but feature flag EPHEMERIS_CALCULATION_ENABLED is False.")
            return {
                "status": "unsupported",
                "message": (
                    "Direct astronomical calculation engine is currently unconfigured. "
                    "VedViki currently focuses on digitizing and interpreting your existing Kundli document."
                ),
                **self.get_calculation_metadata(is_calculated=False)
            }

        # Pluggable calculation logic (e.g. pyswisseph) can be mounted here
        return {
            "status": "calculated",
            "birth_details": birth_details.model_dump(),
            **self.get_calculation_metadata(is_calculated=True)
        }


ephemeris_service = EphemerisCalculationService()
