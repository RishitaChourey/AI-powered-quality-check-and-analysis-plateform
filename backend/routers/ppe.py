from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import shutil, os, re, glob
from collections import Counter

from services.yolo_service import run_ppe_detection, ppe_model
from services.video_utils import convert_avi_to_mp4
from services.email_utils import send_detection_email

router = APIRouter()

@router.post("/")
async def predict(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    try:
        # Sanitize filename
        safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
        upload_path = f"static/uploads/{safe_filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Detect if video
        is_video = file.content_type.startswith("video/")

        # Run YOLO detection
        results = run_ppe_detection(upload_path)

        # Extract detections
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": ppe_model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        # Find annotated file
        base_name = os.path.splitext(safe_filename)[0]
        detected_files = glob.glob(f"static/detections/{base_name}*.*")
        annotated_path = None
        if detected_files:
            annotated_path = detected_files[0].replace("\\", "/")
            if annotated_path.endswith(".avi"):
                annotated_path = convert_avi_to_mp4(annotated_path)
            annotated_path = "/" + annotated_path

        # Summary
        summary = dict(Counter([d["class"] for d in detections]))

        # Send Email in background
        if background_tasks:
            email_body = f"PPE Detection Completed\nSummary: {summary}"
            background_tasks.add_task(
                send_detection_email,
                to=["industryproject87@gmail.com"],
                subject="PPE Detection Result",
                body=email_body
            )

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{safe_filename}",
            "annotated_image": annotated_path,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)