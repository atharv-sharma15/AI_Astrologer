import pytest
from httpx import AsyncClient
import io
from PIL import Image


def create_test_image_file():
    buf = io.BytesIO()
    img = Image.new("RGB", (50, 50), color=(240, 240, 240))
    img.save(buf, format="PNG")
    buf.seek(0)
    return ("test_chart.png", buf, "image/png")


@pytest.mark.asyncio
async def test_chart_upload_review_confirm_workflow(client: AsyncClient, user_a: dict):
    # 1. Upload chart
    files = {"file": create_test_image_file()}
    res = await client.post("/api/charts/upload", files=files, headers=user_a["headers"])
    assert res.status_code == 201
    data = res.json()
    chart_id = data["id"]
    assert data["is_confirmed"] is False
    assert len(data["placements"]) > 0

    # 2. Patch/correct fields during review
    patch_payload = {
        "title": "My Corrected Kundli",
        "ascendant_sign": "Leo",
        "ascendant_degree": 18.0
    }
    patch_res = await client.patch(f"/api/charts/{chart_id}", json=patch_payload, headers=user_a["headers"])
    assert patch_res.status_code == 200
    patched_data = patch_res.json()
    assert patched_data["title"] == "My Corrected Kundli"
    assert patched_data["ascendant_sign"] == "Leo"
    assert patched_data["ascendant_degree"] == 18.0

    # 3. Explicitly confirm chart
    confirm_payload = {"confirmed": True, "user_notes": "Placements reviewed and verified against family birth record."}
    confirm_res = await client.post(f"/api/charts/{chart_id}/confirm", json=confirm_payload, headers=user_a["headers"])
    assert confirm_res.status_code == 200
    confirmed_data = confirm_res.json()
    assert confirmed_data["is_confirmed"] is True
    assert confirmed_data["confirmed_at"] is not None
    assert any("family birth record" in flag for flag in confirmed_data["review_flags"])
