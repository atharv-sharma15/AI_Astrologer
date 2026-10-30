import pytest
from httpx import AsyncClient
import io
from PIL import Image


def create_test_image_file():
    buf = io.BytesIO()
    img = Image.new("RGB", (50, 50), color=(240, 240, 240))
    img.save(buf, format="PNG")
    buf.seek(0)
    return ("chart_user_a.png", buf, "image/png")


@pytest.mark.asyncio
async def test_access_control_isolation(client: AsyncClient, user_a: dict, user_b: dict):
    # User A uploads a chart
    files = {"file": create_test_image_file()}
    upload_res = await client.post("/api/charts/upload", files=files, headers=user_a["headers"])
    assert upload_res.status_code == 201
    chart_id = upload_res.json()["id"]

    # User B tries to view User A's chart -> 404
    get_res = await client.get(f"/api/charts/{chart_id}", headers=user_b["headers"])
    assert get_res.status_code == 404

    # User B tries to update User A's chart -> 404
    patch_res = await client.patch(
        f"/api/charts/{chart_id}",
        json={"title": "Hacked Title"},
        headers=user_b["headers"]
    )
    assert patch_res.status_code == 404

    # User B tries to confirm User A's chart -> 404
    confirm_res = await client.post(
        f"/api/charts/{chart_id}/confirm",
        json={"confirmed": True},
        headers=user_b["headers"]
    )
    assert confirm_res.status_code == 404

    # User B tries to delete User A's chart -> 404
    del_res = await client.delete(f"/api/charts/{chart_id}", headers=user_b["headers"])
    assert del_res.status_code == 404

    # User A creates a conversation linked to their chart
    conv_res = await client.post(
        "/api/chats",
        json={"chart_id": chart_id, "title": "Secret Consultation"},
        headers=user_a["headers"]
    )
    assert conv_res.status_code == 201
    conv_id = conv_res.json()["id"]

    # User B tries to link User A's chart to their conversation -> 404
    conv_b_res = await client.post(
        "/api/chats",
        json={"chart_id": chart_id, "title": "Illicit Linked Chat"},
        headers=user_b["headers"]
    )
    assert conv_b_res.status_code == 404

    # User B tries to read User A's conversation -> 404
    conv_get_b = await client.get(f"/api/chats/{conv_id}", headers=user_b["headers"])
    assert conv_get_b.status_code == 404

    # User B tries to post a message into User A's conversation -> 404
    msg_post_b = await client.post(
        f"/api/chats/{conv_id}/messages",
        json={"content": "Can I read this chart?"},
        headers=user_b["headers"]
    )
    assert msg_post_b.status_code == 404
