from fastapi import APIRouter
from fastapi.responses import JSONResponse
import mysql.connector, json
from db.database import get_connection

router = APIRouter()

@router.get("/api/notifications")
async def get_notifications():
    """Fetch all notifications, newest first."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT id, type, title, message, summary, failed_items, created_at, is_read
        FROM notifications
        ORDER BY created_at DESC
    """)
    rows = []
    for r in c.fetchall():
        rows.append({
            "id": r[0],
            "type": r[1],
            "title": r[2],
            "message": r[3],
            "summary": json.loads(r[4]) if r[4] else None,
            "failed_items": json.loads(r[5]) if r[5] else None,
            "time": str(r[6]),
            "read": bool(r[7])
        })
    conn.close()
    return JSONResponse(rows)

@router.post("/api/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int):
    """Mark a notification as read by ID."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE notifications SET is_read = 1 WHERE id = %s", (notif_id,))
    conn.commit()
    conn.close()
    return {"status": "ok"}