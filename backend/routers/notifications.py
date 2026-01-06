# backend/routers/notifications.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sqlite3, os, json

# Path to your SQLite database
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DB_FILE = os.path.join(BASE_DIR, "users.db")

router = APIRouter()

@router.get("/api/notifications")
async def get_notifications():
    """Fetch all notifications, newest first."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""
        SELECT id, type, title, message, summary, failed_items, created_at, read
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
            "time": r[6],
            "read": bool(r[7])
        })
    conn.close()
    return JSONResponse(rows)

@router.post("/api/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: int):
    """Mark a notification as read by ID."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()
    return {"status": "ok"}