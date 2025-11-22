from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from collections import Counter
from moviepy.editor import VideoFileClip
import sqlite3, shutil, os, glob, sys, re

# Email utils
from email_utils import DetectionEmail, send_detection_email

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
# Add YOLOv12 folder to path (if needed)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# -------------------------------
# SQLite DB Setup for Users
DB_FILE = "users.db"
if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

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
        conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                  (user.name, user.email, user.password))
        conn.commit()
        conn.close()
        return JSONResponse(content={"message": "User created successfully!"}, status_code=201)
    except sqlite3.IntegrityError:
        return JSONResponse(content={"message": "Email already exists."}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"message": f"Server error: {e}"}, status_code=500)

# -------------------------------
# Login Route
@app.post("/api/login")
async def login(user: User):
    try:
        conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email=? AND password=?", (user.email, user.password))
        row = c.fetchone()
        conn.close()

        if row:
            return JSONResponse(content={"message": "Login successful!"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Invalid email or password."}, status_code=401)
    except Exception as e:
        return JSONResponse(content={"message": f"Server error: {e}"}, status_code=500)

# -------------------------------
# Load YOLO model
model = YOLO("weights/best(3).pt")

# -------------------------------
# Mount static directories
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/detections", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# -------------------------------
# Convert .avi → .mp4
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
@app.post("/predict/")
async def predict(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    try:
        # ------------------- Sanitize filename
        safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', file.filename)
        upload_path = f"static/uploads/{safe_filename}"
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not os.path.exists(upload_path):
            return JSONResponse({"error": "File not saved properly."})

        # ------------------- Detect video
        is_video = file.content_type.startswith("video/")

        # ------------------- YOLO prediction
        results = model.predict(
            source=upload_path,
            save=True,
            conf=0.60,
            project="static",
            name="detections",
            exist_ok=True
        )

        # ------------------- Extract detections
        detections = []
        for r in results:
            for box in r.boxes:
                detections.append({
                    "class": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })

        # ------------------- Find annotated file
        base_name = os.path.splitext(safe_filename)[0]
        detected_files = glob.glob(f"static/detections/{base_name}*")
        annotated_path = detected_files[0].replace("\\", "/") if detected_files else None

        if annotated_path and annotated_path.endswith(".avi"):
            annotated_path = convert_avi_to_mp4(annotated_path)

        # ------------------- Summary
        summary = Counter([d["class"] for d in detections])

        # ------------------- Send Email in background (no attachment for now)
        if background_tasks:
            email_body = f"PPE Detection Completed\nSummary: {summary}"
            background_tasks.add_task(
                send_detection_email,
                to=["industryproject87@gmail.com"],  # Replace with actual recipient
                subject="PPE Detection Result",
                body=email_body
            )

        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{safe_filename}",
            "annotated_image": "/" + annotated_path if annotated_path else None,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)})

# -------------------------------
@app.get("/")
def root():
    return {"message": "PPE detection API running!"}
