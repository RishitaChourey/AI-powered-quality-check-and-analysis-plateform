from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import shutil, os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
model = YOLO("best.pt")

# Mount static directories
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ensure directories exist
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Save original upload permanently
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run YOLO on the saved original image
        results = model.predict(
            source=upload_path,
            save=True,
            project="static",   # results go here
            name="detections",  # subfolder
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

        # Annotated image path — YOLO saves as 'image0.jpg'
        annotated_path = "static/detections/image0.jpg"

        return JSONResponse({
            "detections": detections,
            "original_image": f"/static/uploads/{file.filename}",
            "annotated_image": f"/{annotated_path.replace(os.sep, '/')}"
        })

    except Exception as e:
        return JSONResponse({"error": str(e)})

@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
