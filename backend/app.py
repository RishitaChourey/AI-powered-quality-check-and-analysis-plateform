from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
# import sqlite3
import io
import shutil, os, glob, cv2, sys 
from moviepy import VideoFileClip
from collections import Counter
import mysql.connector

app = FastAPI()
# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Range"],
)

# -------------------------------
# Add YOLOv12 folder to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# -------------------------------
app = FastAPI(title="PPE Detection + Auth API", version="1.0")

# -------------------------------
# CORS
origins = ["*", "http://localhost:3000", "http://127.0.0.1:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# SQLite DB Setup for Users
# DB_FILE = "users.db"
MYSQL_CONFIG = {
    "host": "localhost",       # change if remote
    "user": "root",   # replace with your MySQL user
    "password": "root",
    "database": "ppe_detection"
}
# -------------------------------
# User Model
class User(BaseModel):
    name: str = None
    email: str
    password: str

# -------------------------------
# Signup Route
@app.post("/api/signup")
async def signup(user: User):
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                  (user.name, user.email, user.password))
        conn.commit()
        conn.close()
        return JSONResponse(content={"message": "User created successfully!"}, status_code=201)
    except mysql.connector.errors.IntegrityError:
        return JSONResponse(content={"message": "Email already exists."}, status_code=400)
    except Exception as e:
        return JSONResponse({"message": f"Server error: {e}"}, status_code=500)

# -------------------------------
# Login Route
@app.post("/api/login")
async def login(user: User):
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email=%s AND password=%s", (user.email, user.password))
        row = c.fetchone()
        conn.close()
        if row:
            return JSONResponse({"message": "Login successful!"}, status_code=200)
        else:
            return JSONResponse({"message": "Invalid email or password."}, status_code=401)
    except Exception as e:
        return JSONResponse({"message": f"Server error: {e}"}, status_code=500)

# -------------------------------
# Load YOLO models
ppe_model = YOLO("weights/best(3).pt")
machine_model = YOLO("weights/machine_model.pt")

# -------------------------------
# Mount static directories
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)
os.makedirs("static/machine", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# -------------------------------
# Convert .avi → .mp4 for browser
def convert_avi_to_mp4(input_path: str) -> str:
    if not input_path.lower().endswith(".avi"):
        return input_path
    output_path = input_path.replace(".avi", ".mp4")
    with VideoFileClip(input_path) as clip:
        clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=clip.fps or 20)
    os.remove(input_path)
    return output_path

# -------------------------------
# PPE Detection + Auto Email
def update_class_summary(summary):
    conn = mysql.connector.connect(**MYSQL_CONFIG)
    cursor = conn.cursor()

    for class_name, count in summary.items():
        # Try to update existing row
        cursor.execute(
            "UPDATE class_summary SET count = count + %s WHERE class_name = %s",
            (count, class_name)
        )
        if cursor.rowcount == 0:
            # If no row was updated, insert new one
            cursor.execute(
                "INSERT INTO class_summary (class_name, count) VALUES (%s, %s)",
                (class_name, count)
            )

    conn.commit()
    conn.close()

@app.post("/predict/")
async def predict(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    try:
        # Sanitize filename
        safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
        upload_path = f"static/uploads/{safe_filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Detect if video
        is_video = file.content_type.startswith("video/")

        # YOLO prediction
        results = ppe_model.predict(
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
                    "class": ppe_model.names[int(box.cls)],
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


        summary = Counter([d["class"] for d in detections])
        update_class_summary(summary)

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{safe_filename}",
            "annotated_image": annotated_path,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)})

@app.get("/api/dashboard")
async def dashboard_summary():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT class_name, count FROM class_summary")
        rows = cursor.fetchall()
        conn.close()

        return JSONResponse(content={"summary": rows}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
# -------------------------------
# Machine Detection + Auto Email
@app.post("/predict_machine/")
async def predict_machine(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    try:
        # Save uploaded file
        upload_path = f"static/uploads/{file.filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run detection
        results = machine_model.predict(
            source=upload_path,
            save=True,
            conf=0.50,
            project="static",
            name="machine",
            exist_ok=True,
            stream=False,
            vid_stride=5
        )

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
        summary = Counter([d["class"] for d in detections])
        checkpoints = [
            {"name": cls_name, "passed": summary.get(cls_name, 0) > 0}
            for cls_name in expected_classes
        ]

        # Auto Email if any checkpoint failed
        if background_tasks:
            failed_checkpoints = [cp["name"] for cp in checkpoints if not cp["passed"]]
            if failed_checkpoints:
                subject = "Machine Quality Alert"
                body = f"The following checkpoints failed: {failed_checkpoints}\n\nSummary: {summary}"
                background_tasks.add_task(
                    send_detection_email,
                    to=["industryproject87@gmail.com"],
                    subject=subject,
                    body=body
                )

        return JSONResponse({
            "checkpoints": checkpoints,
            "original": f"/static/uploads/{file.filename}",
            "annotated": "/" + annotated_path if annotated_path else None,
            "detections": detections
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# -------------------------------
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
