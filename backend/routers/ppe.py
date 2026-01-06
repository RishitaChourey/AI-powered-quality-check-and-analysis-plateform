from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import shutil, os, re, json
from collections import Counter

# New detection services
from services.detection_service import (
    process_video_for_ppe,
    process_image_for_ppe
)

# Email utility
from services.email_utils.ppe_email import send_ppe_email

# Database utilities (kept from old version)
from db.database import update_class_summary, get_connection

router = APIRouter()

# PPE classes considered as violations
PPE_NEGATIVE = {
    "no-helmet",
    "no-vest",
    "no-goggles",
    "no-gloves",
    "no-shoes"
}


@router.post("/")
async def predict(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    try:
        # ---------------- SAVE FILE ---------------- #
        safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
        os.makedirs("static/uploads", exist_ok=True)

        upload_path = os.path.join("static/uploads", safe_filename)
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        is_video = file.content_type.startswith("video/")

        # ---------------- RUN DETECTION ---------------- #
        if is_video:
            result = process_video_for_ppe(upload_path)
            summary_source = result.get("final_ppe_summary", {})
            unknowns_summary = result.get("unknowns_summary", {})
        else:
            result = process_image_for_ppe(upload_path)
            summary_source = {}
            unknown_ppe = set()
            # Build summary from image result
            for person in result.get("persons", []):
                name = person["name"]
                if name == "Unknown":
                    for ppe in person["ppe"]:
                        unknown_ppe.add(ppe)
                    continue
                summary_source.setdefault(name, [])
                summary_source[name].extend(person["ppe"])

            unknowns_summary = {
                "total_unknown_detections": len(unknown_ppe),
                "ppe_detected": list(unknown_ppe)
            }

        frames = result.get("frames", [])

        # ---------------- NEGATIVE PPE EXTRACTION ---------------- #
        violations = {}
        for name, ppe_list in summary_source.items():
            negative_items = [p for p in ppe_list if p in PPE_NEGATIVE]
            if negative_items:
                violations[name] = list(set(negative_items))

        # Unknown persons
        unknown_negative = [
            p for p in unknowns_summary.get("ppe_detected", [])
            if p in PPE_NEGATIVE
        ]
        if unknown_negative:
            violations["Unknown"] = list(set(unknown_negative))

        # ---------------- EMAIL (ASYNC) ---------------- #
        if violations and background_tasks:
            background_tasks.add_task(
                send_ppe_email,
                to=["industryproject87@gmail.com"],
                subject="🚨 PPE Violation Alert",
                violations=violations
            )

        # ---------------- DATABASE SUMMARY (OLD LOGIC) ---------------- #
        # Flatten detections for DB update
        detections = []
        if is_video:
            # Use per-person PPE list from video summary
            for person, ppe_list in summary_source.items():
                for ppe in ppe_list:
                    detections.append({"class": ppe})
        else:
            for person in result.get("persons", []):
                for ppe in person.get("ppe", []):
                    detections.append({"class": ppe})

        summary = dict(Counter([d["class"] for d in detections]))

        # Update class_summary in SQLite
        update_class_summary(summary)
        conn = get_connection()
        c = conn.cursor()
        c.execute(
            "INSERT INTO notifications (type, title, message, summary) VALUES (?, ?, ?, ?)",
            (
                "ppe",
                "PPE Detection Completed",
                "Please take immediate action to ensure workplace safety and compliance.",
                json.dumps(summary)
            )
        )
        conn.commit()
        conn.close()

        # ---------------- RESPONSE ---------------- #
        return JSONResponse({
            "success": True,
            "is_video": is_video,
            "uploaded_file": f"/static/uploads/{safe_filename}",
            "detected_frames": frames,
            "data": result,
            "summary": summary,              # flat counts for DB/dashboard
            "violations": violations,        # structured per-person
            "unknowns_summary": unknowns_summary,
            "original_image": None if is_video else f"/static/uploads/{safe_filename}"
        })

    except Exception as e:
        return JSONResponse(
            {"success": False, "error": str(e)},
            status_code=500
        )