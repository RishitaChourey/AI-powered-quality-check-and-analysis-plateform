from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil, os, glob, cv2
from fastapi.middleware.cors import CORSMiddleware
from moviepy import VideoFileClip
import os

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Range"],
)

model = YOLO("best(3).pt")

# Mount static directories
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ensure directories exist
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)


# 🔄 Convert YOLO .avi outputs to .mp4 (browser compatible)
def convert_avi_to_mp4(input_path: str) -> str:
    """Convert YOLO output .avi to .mp4 for browser playback using MoviePy."""
    if not input_path.lower().endswith(".avi"):
        return input_path  # already mp4 or other format

    output_path = input_path.replace(".avi", ".mp4")

    # Load and convert the video
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(
            output_path,
            codec='libx264',       # widely supported for browsers
            audio_codec='aac',     # ensure audio track compatibility
            fps=clip.fps or 20     # preserve original or fallback fps
        )

    # Clean up original file
    os.remove(input_path)
    return output_path

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Detect if input is a video
        is_video = file.content_type.startswith("video/")

        # Run YOLO detection
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        # Extract detections
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        # Find annotated output file
        base_name = os.path.splitext(file.filename)[0]
        output_dir = "static/detections"
        detected_files = glob.glob(f"{output_dir}/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        # Convert .avi to .mp4 if necessary
        if annotated_path and annotated_path.endswith(".avi"):
             annotated_path = convert_avi_to_mp4(annotated_path)


        return JSONResponse({
            "detections": detections,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)})

@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
