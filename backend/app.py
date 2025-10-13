from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import sqlite3
import io
import os
import sys
import shutil

# -------------------------------
# Add YOLOv12 folder to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# -------------------------------
# FastAPI App
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
# YOLOv12 Model
MODEL_PATH = "weights/best.pt"
model = None

@app.on_event("startup")
async def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model weights not found at {MODEL_PATH}.")
    try:
        model = YOLO(MODEL_PATH)
        print(f"INFO: Successfully loaded custom YOLOv12 model from {MODEL_PATH}")
    except Exception as e:
        raise RuntimeError(f"YOLOv12 Load Error: {e}") from e

# -------------------------------
# SQLite DB Setup for Users
DB_FILE = "users.db"
if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
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
        conn = sqlite3.connect(DB_FILE)
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
        conn = sqlite3.connect(DB_FILE)
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
# PPE Image Check Endpoint
@app.post("/api/check_ppe_image/")
async def check_ppe_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG).")
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not initialized.")

    content = await file.read()
    image_stream = io.BytesIO(content)
    temp_run_dir = os.path.join("temp_runs", os.urandom(8).hex())

    try:
        input_image = Image.open(image_stream).convert("RGB")
        results = model.predict(
            source=input_image,
            save=True,
            project="temp_runs",
            name=os.urandom(8).hex(),
            exist_ok=True,
            verbose=False
        )

        if results and len(results) > 0:
            result = results[0]
            result_path = os.path.join(result.save_dir, result.path)

            if not os.path.exists(result_path):
                raise FileNotFoundError(f"YOLO output not found: {result_path}")

            processed_image = Image.open(result_path)
            output_stream = io.BytesIO()
            processed_image.save(output_stream, format="JPEG", quality=90)
            output_stream.seek(0)

            return StreamingResponse(
                output_stream,
                media_type="image/jpeg",
                headers={"Content-Disposition": f"attachment; filename=result_{file.filename}.jpeg"}
            )
        else:
            raise HTTPException(status_code=500, detail="YOLO inference produced no results.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {e}")
    finally:
        if os.path.exists(temp_run_dir):
            try:
                shutil.rmtree(temp_run_dir)
                print(f"INFO: Cleaned up temporary directory: {temp_run_dir}")
            except OSError as e:
                print(f"WARNING: Could not remove temp dir {temp_run_dir}: {e}")
