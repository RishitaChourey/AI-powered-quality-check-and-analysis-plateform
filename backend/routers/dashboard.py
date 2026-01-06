# backend/routers/dashboard.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sqlite3, os, json

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_FILE = os.path.join(BASE_DIR, "users.db")

router = APIRouter()

@router.get("/api/dashboard")
async def dashboard_summary():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # --- PPE Class summary (cumulative counts) ---
    c.execute("SELECT class_name, count FROM class_summary")
    class_rows = [{"class_name": r[0], "count": r[1]} for r in c.fetchall()]

    # --- PPE Detection summary (last 10 runs) ---
    c.execute("SELECT filename, summary, created_at FROM detection_summary ORDER BY created_at DESC LIMIT 10")
    detection_rows = []
    for r in c.fetchall():
        detection_rows.append({
            "filename": r[0],
            "summary": json.loads(r[1]) if r[1] else {},
            "created_at": r[2]
        })

    # --- Machine checkpoint summary (cumulative pass/fail counts) ---
    c.execute("SELECT checkpoint_name, passed_count, failed_count FROM checkpoint_summary")
    checkpoint_rows = [
        {"checkpoint_name": r[0], "passed_count": r[1], "failed_count": r[2]}
        for r in c.fetchall()
    ]

    # --- Machine summary (per-run stats, last 10 runs) ---
    c.execute("SELECT machine_type, filename, passed_checkpoints, failed_checkpoints, created_at FROM machine_summary ORDER BY created_at DESC LIMIT 10")
    machine_rows = []
    for r in c.fetchall():
        machine_rows.append({
            "machine_type": r[0],
            "filename": r[1],
            "passed_checkpoints": r[2],
            "failed_checkpoints": r[3],
            "created_at": r[4]
        })

    conn.close()

    # --- PPE Compliance calculation ---
    total = sum(r["count"] for r in class_rows)
    # Define violation keywords
    NEGATIVE_TOKENS = ["no", "missing", "without", "incorrect"]
    violations = sum(
    int(r["count"])  # ensure integer
    for r in class_rows
    if r.get("class_name") and  # make sure not None
       any(token in r["class_name"].lower() for token in NEGATIVE_TOKENS))
    compliance = round(((total - violations) / total) * 100, 2) if total > 0 else 100

    # --- Machine Compliance calculation ---
    machine_total = sum(cp["passed_count"] + cp["failed_count"] for cp in checkpoint_rows)
    machine_failed = sum(cp["failed_count"] for cp in checkpoint_rows)
    machine_compliance = round(((machine_total - machine_failed) / machine_total) * 100, 2) if machine_total > 0 else 100

    return JSONResponse({
        # PPE data
        "class_summary": class_rows,
        "detection_summary": detection_rows,
        "compliance": compliance,
        "violations": violations,
        "total": total,

        # Machine data
        "checkpoint_summary": checkpoint_rows,
        "machine_summary": machine_rows,
        "machine_compliance": machine_compliance,
        "machine_failed": machine_failed,
        "machine_total": machine_total
    })