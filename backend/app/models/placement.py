import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Placement(Base):
    __tablename__ = "placements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    chart_id = Column(String(36), ForeignKey("charts.id", ondelete="CASCADE"), nullable=False, index=True)
    planet = Column(String(50), nullable=False)  # Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, etc.
    sign = Column(String(50), nullable=False)    # Aries, Taurus, etc.
    house = Column(Integer, nullable=False)      # 1 to 12
    degree = Column(Float, nullable=True)        # 0.0 to 30.0
    nakshatra = Column(String(100), nullable=True)
    nakshatra_pada = Column(Integer, nullable=True)  # 1 to 4
    is_retrograde = Column(Boolean, default=False, nullable=False)
    is_combust = Column(Boolean, default=False, nullable=False)
    notes = Column(String(255), nullable=True)

    chart = relationship("Chart", back_populates="placements")
