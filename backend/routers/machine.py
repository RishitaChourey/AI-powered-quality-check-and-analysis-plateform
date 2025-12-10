from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
import shutil, os, glob
from collections import Counter

from services.yolo_service import run_machine_detection, machine_model
from services.video_utils import convert_avi_to_mp4
from services.email_utils.machine_email import send_machine_email_sync  # <- updated

router = APIRouter()

@router.post("/")
async def predict_machine(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    try:
        # Save uploaded file
        os.makedirs("static/uploads", exist_ok=True)
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run YOLO detection
        results = run_machine_detection(upload_path)

        # Extract detections
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": machine_model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        # Find annotated output
        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/machine"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        # Convert .avi → .mp4
        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        # Summary & checkpoints
        expected_classes = list(machine_model.names.values())
        summary = dict(Counter([d["class"] for d in detections]))
        checkpoints = [
            {"name": cls_name, "passed": summary.get(cls_name, 0) > 0}
            for cls_name in expected_classes
        ]

        # Auto Email if any checkpoint failed
        if background_tasks:
            failed_checkpoints = [cp["name"] for cp in checkpoints if not cp["passed"]]
            if failed_checkpoints:
                background_tasks.add_task(
                    send_machine_email_sync,
                    ["industryproject87@gmail.com"],
                    "Machine Quality Alert",
                    summary
                )

        return JSONResponse({
            "checkpoints": checkpoints,
            "original": f"/static/uploads/{file.filename}",
            "annotated": "/" + annotated_path if annotated_path else None,
            "detections": detections
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
