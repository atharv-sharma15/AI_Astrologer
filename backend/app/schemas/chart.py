from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

VALID_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
    "Unknown"
]

SIGN_MAPPING = {
    "mesha": "Aries", "vrishabha": "Taurus", "mithuna": "Gemini", "karka": "Cancer",
    "simha": "Leo", "kanya": "Virgo", "tula": "Libra", "vrishchika": "Scorpio",
    "dhanu": "Sagittarius", "makara": "Capricorn", "kumbha": "Aquarius", "meena": "Pisces"
}


class PlacementBase(BaseModel):
    planet: str = Field(..., description="Name of the Graha/planet, e.g., Sun, Moon, Mars, Rahu, Ketu")
    sign: str = Field(..., description="Zodiac sign name, e.g. Aries, Leo, Mesha")
    house: int = Field(..., ge=1, le=12, description="Bhava/House number (1 to 12)")
    degree: Optional[float] = Field(None, ge=0.0, le=30.0, description="Degree within sign (0.0 to 30.0)")
    nakshatra: Optional[str] = Field(None, description="Nakshatra name if decipherable")
    nakshatra_pada: Optional[int] = Field(None, ge=1, le=4, description="Pada (1-4) if decipherable")
    is_retrograde: bool = Field(False, description="Whether the planet is retrograde (Vakri)")
    is_combust: bool = Field(False, description="Whether the planet is combust (Asta)")
    notes: Optional[str] = Field(None, description="Any extraction notes or uncertainty details")

    @field_validator("planet")
    @classmethod
    def clean_planet_name(cls, v: str) -> str:
        v_clean = v.strip().title()
        # Common aliases
        aliases = {
            "Surya": "Sun", "Chandra": "Moon", "Mangal": "Mars", "Mangala": "Mars",
            "Budh": "Mercury", "Budha": "Mercury", "Guru": "Jupiter", "Brihaspati": "Jupiter",
            "Shukra": "Venus", "Shani": "Saturn", "Asc": "Ascendant", "Lagna": "Ascendant"
        }
        return aliases.get(v_clean, v_clean)

    @field_validator("sign")
    @classmethod
    def normalize_sign(cls, v: str) -> str:
        s = v.strip().title()
        if s.lower() in SIGN_MAPPING:
            return SIGN_MAPPING[s.lower()]
        return s


class PlacementCreate(PlacementBase):
    pass


class PlacementResponse(PlacementBase):
    id: str
    chart_id: str

    class Config:
        from_attributes = True


class ExtractedChartSchema(BaseModel):
    chart_type: str = Field(
        default="north_indian",
        description="Identified chart format: 'north_indian', 'south_indian', 'east_indian', or 'unknown'"
    )
    ascendant_sign: Optional[str] = Field(
        None,
        description="Lagna / Ascendant sign name (e.g. Aries, Mesha) if visible"
    )
    ascendant_degree: Optional[float] = Field(
        None,
        ge=0.0,
        le=30.0,
        description="Lagna degree if visible"
    )
    detected_language: str = Field(
        default="en",
        description="Language detected in the chart labels (e.g. en, hi, sa)"
    )
    readable_evidence: str = Field(
        default="",
        description="Verbatim text and glyphs found in the image/PDF supporting the placements"
    )
    uncertain_fields: List[str] = Field(
        default_factory=list,
        description="Fields where reading is ambiguous or degraded"
    )
    review_flags: List[str] = Field(
        default_factory=list,
        description="Warnings for human review, e.g. 'Unknown Lagna', 'Planet sign inferred'"
    )
    placements: List[PlacementBase] = Field(
        default_factory=list,
        description="Extracted planetary placements. Do not invent or fabricate missing planets."
    )


class ChartUpdateSchema(BaseModel):
    title: Optional[str] = None
    chart_type: Optional[str] = None
    ascendant_sign: Optional[str] = None
    ascendant_degree: Optional[float] = None
    placements: Optional[List[PlacementBase]] = None


class ChartConfirmRequest(BaseModel):
    confirmed: bool = True
    user_notes: Optional[str] = None


class ChartResponse(BaseModel):
    id: str
    title: str
    chart_type: str
    ascendant_sign: Optional[str] = None
    ascendant_degree: Optional[float] = None
    detected_language: str
    raw_evidence: Optional[str] = None
    uncertain_fields: List[str]
    review_flags: List[str]
    is_confirmed: bool
    confirmed_at: Optional[datetime] = None
    calculation_engine: str
    original_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    placements: List[PlacementResponse] = []

    class Config:
        from_attributes = True
