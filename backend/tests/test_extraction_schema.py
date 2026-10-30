import pytest
from pydantic import ValidationError
from app.schemas.chart import ExtractedChartSchema, PlacementBase


def test_placement_normalization():
    # Test Surya -> Sun and Mesha -> Aries normalization
    p = PlacementBase(
        planet="Surya",
        sign="Mesha",
        house=1,
        degree=15.5
    )
    assert p.planet == "Sun"
    assert p.sign == "Aries"
    assert p.house == 1
    assert p.degree == 15.5
    assert p.is_retrograde is False


def test_invalid_house_number():
    with pytest.raises(ValidationError):
        PlacementBase(
            planet="Moon",
            sign="Taurus",
            house=13  # Invalid house
        )


def test_preserve_unknown_fields_and_flags():
    chart_data = {
        "chart_type": "north_indian",
        "ascendant_sign": "Cancer",
        "ascendant_degree": None,
        "detected_language": "sa",
        "readable_evidence": "Found Mo in 4th house",
        "uncertain_fields": ["Lagna degree unreadable", "Venus combust state uncertain"],
        "review_flags": ["Missing Sun position in document"],
        "placements": [
            {
                "planet": "Chandra",
                "sign": "Karka",
                "house": 4,
                "degree": 12.0
            }
        ]
    }

    schema = ExtractedChartSchema.model_validate(chart_data)
    assert schema.chart_type == "north_indian"
    assert schema.ascendant_sign == "Cancer"
    assert len(schema.uncertain_fields) == 2
    assert "Missing Sun position in document" in schema.review_flags
    assert len(schema.placements) == 1
    assert schema.placements[0].planet == "Moon"
    assert schema.placements[0].sign == "Cancer"
