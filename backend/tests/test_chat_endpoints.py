import pytest
from httpx import AsyncClient
import io
from PIL import Image


def create_test_image_file():
    buf = io.BytesIO()
    img = Image.new("RGB", (50, 50), color=(240, 240, 240))
    img.save(buf, format="PNG")
    buf.seek(0)
    return ("chart.png", buf, "image/png")


@pytest.mark.asyncio
async def test_chat_lifecycle_with_unconfirmed_and_confirmed_chart(client: AsyncClient, user_a: dict):
    # 1. Upload chart
    files = {"file": create_test_image_file()}
    upload_res = await client.post("/api/charts/upload", files=files, headers=user_a["headers"])
    chart_id = upload_res.json()["id"]

    # 2. Start conversation linked to unconfirmed chart
    conv_res = await client.post(
        "/api/chats",
        json={"chart_id": chart_id, "title": "My Vedic Reading", "preferred_language": "en"},
        headers=user_a["headers"]
    )
    assert conv_res.status_code == 201
    conv_id = conv_res.json()["id"]

    # 3. Ask question before confirmation -> Should contain prompt to verify chart first
    msg_res = await client.post(
        f"/api/chats/{conv_id}/messages",
        json={"content": "What is my Lagna and what does it indicate?"},
        headers=user_a["headers"]
    )
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert "confirm" in msg_data["content"].lower()

    # 4. Now confirm the chart
    confirm_res = await client.post(
        f"/api/charts/{chart_id}/confirm",
        json={"confirmed": True},
        headers=user_a["headers"]
    )
    assert confirm_res.status_code == 200

    # 5. Ask question after confirmation -> Returns verified chart interpretation
    msg2_res = await client.post(
        f"/api/chats/{conv_id}/messages",
        json={"content": "Tell me about my verified chart placements."},
        headers=user_a["headers"]
    )
    assert msg2_res.status_code == 200
    msg2_data = msg2_res.json()
    assert "verified" in msg2_data["content"].lower() or "lagna" in msg2_data["content"].lower()

    # 6. Ask question in Hindi
    hindi_msg_res = await client.post(
        f"/api/chats/{conv_id}/messages",
        json={"content": "मेरे लग्न और ग्रहों के बारे में बताएं", "language": "hi"},
        headers=user_a["headers"]
    )
    assert hindi_msg_res.status_code == 200
    hindi_data = hindi_msg_res.json()
    assert "लग्न" in hindi_data["content"] or "कुंडली" in hindi_data["content"]


@pytest.mark.asyncio
async def test_general_chat_without_chart(client: AsyncClient, user_a: dict):
    # Start conversation without chart
    conv_res = await client.post(
        "/api/chats",
        json={"title": "General Jyotish Questions", "preferred_language": "en"},
        headers=user_a["headers"]
    )
    assert conv_res.status_code == 201
    conv_id = conv_res.json()["id"]

    msg_res = await client.post(
        f"/api/chats/{conv_id}/messages",
        json={"content": "What are the 12 Bhavas in Vedic astrology?"},
        headers=user_a["headers"]
    )
    assert msg_res.status_code == 200
    msg_data = msg_res.json()
    assert len(msg_data["content"]) > 20
