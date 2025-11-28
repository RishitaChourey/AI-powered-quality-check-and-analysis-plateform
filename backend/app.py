from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from collections import Counter
from moviepy import VideoFileClip
import sqlite3, shutil, os, glob, re, sys
from deep_sort_realtime.deepsort_tracker import DeepSort
from collections import defaultdict
import cv2
from deepface import DeepFace

# Email utils
from email_utils import send_detection_email

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
# Add YOLOv12 folder to path if needed
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'yolov12'))

# -------------------------------
# SQLite DB Setup
DB_FILE = "users.db"
if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
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
        return JSONResponse({"message": "User created successfully!"}, status_code=201)
    except sqlite3.IntegrityError:
        return JSONResponse({"message": "Email already exists."}, status_code=400)
    except Exception as e:
        return JSONResponse({"message": f"Server error: {e}"}, status_code=500)

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
            return JSONResponse({"message": "Login successful!"}, status_code=200)
        else:
            return JSONResponse({"message": "Invalid email or password."}, status_code=401)
    except Exception as e:
        return JSONResponse({"message": f"Server error: {e}"}, status_code=500)

# -------------------------------
# Load YOLO models
ppe_model = YOLO("weights/ppe_model.pt")
machine_model = YOLO("weights/machine_model.pt")

# tracker for deepsort
tracker = DeepSort(
                        max_age=30, 
                        n_init=3, 
                        nms_max_overlap=1.0
                    )
        
# PPE class groups
PPE_POSITIVE = {"helmet", "goggles", "gloves", "vest", "boots", "shoes", "person"}
PPE_NEGATIVE = {"no_helmet", "no_goggles", "no_glove", "no_shoes"}

# All trackable classes
TRACKABLE_CLASSES = [
    "person", "helmet", "no_helmet", "vest", "no_vest",
    "gloves", "no_glove", "goggles", "no_goggles",
    "boots", "no_shoes"
]
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
# PPE Detection + DeepSORT Tracking + Auto Email
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

        # Holds all face names encountered
        all_face_results = []
        if is_video:
            cap = cv2.VideoCapture(upload_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            base_name = os.path.splitext(safe_filename)[0]
            output_path = f"static/detections/{base_name}.mp4"
           
            out = cv2.VideoWriter(
                output_path,
                cv2.VideoWriter_fourcc(*'mp4v'),
                fps,
                (width, height)
            )

            # Tracking dict for all persons
            person_summary = defaultdict(lambda: {
                "helmet": False,
                "vest": False,
                "gloves": False,
                "goggles": False,
                "boots": False,
                "shoes": False,
                "violations": set(),
                "name": "unknown"
            })

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                # YOLO detection
                results = ppe_model(frame, conf=0.55)[0]

                detections = []
                for box in results.boxes:
                    coords = box.xyxy[0].cpu().numpy().astype(float)
                    x1, y1, x2, y2 = coords
                    w, h = (x2 - x1), (y2 - y1)

                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    label = ppe_model.names[cls_id]

                    if label in TRACKABLE_CLASSES:
                        detections.append(([x1, y1, w, h], conf, label))

                # DeepSORT tracking
                tracks = tracker.update_tracks(
                    detections if detections else [], frame=frame
                )

                # Draw tracking results
                for track in tracks:
                    if not track.is_confirmed():
                        continue

                    track_id = track.track_id
                    label = track.get_det_class()
                    x1, y1, x2, y2 = map(int, track.to_ltrb())

                    # Update PPE usage & violations
                    if label in PPE_POSITIVE:
                        person_summary[track_id][label] = True
                    if label in PPE_NEGATIVE:
                        person_summary[track_id]["violations"].add(label)
                    person_name = "unknown"
                    # Face recognition using DeepFace face detector on the frame
                    try:
                        faces = DeepFace.extract_faces(img_path=frame, enforce_detection=False)
                        if faces:
                            for det in faces:
                                x, y, w, h = det["facial_area"].values()
                                face_img = frame[y:y+h, x:x+w]

                                result = DeepFace.find(
                                    img_path=face_img,
                                    db_path="backend/known_faces",
                                    enforce_detection=False
                                )
                                if len(result) > 0 and not result.empty:
                                    person_name = os.path.splitext(
                                        os.path.basename(result.iloc[0]['identity'])
                                    )[0]
                                else:
                                    person_name = "unknown"

                                person_summary[track_id]["name"] = person_name
                                all_face_results.append(person_name)
                        else:
                            person_summary[track_id]["name"] = "unknown"
                    except Exception:
                        person_summary[track_id]["name"] = "unknown"
                        person_summary[track_id]["name"] = person_name
                        all_face_results.append(person_name)

                    color = (0, 255, 0) if label not in PPE_NEGATIVE else (0, 0, 255)

                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    # Get the recognized name (default "unknown")
                    person_name = person_summary[track_id].get("name", "unknown")

                    # Draw label + name on bounding box
                    cv2.putText(frame, f"ID {track_id}: {label} ({person_name})",
                                (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                    out.write(frame)

            cap.release()
            out.release()
            # Flatten all classes detected during tracking
            all_labels = []

            for person_id, data in person_summary.items():
                # add worn PPE items as labels
                for item, worn in data.items():
                    if item != "violations" and worn:
                        all_labels.append(item)

                # add violations
                for v in data["violations"]:
                    all_labels.append(v)
                if "name" in data:
                    all_labels.append(data["name"])

            # Final flat Counter summary
            summary = dict(Counter(all_labels))
            
        else:
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
              # Face recognition on image using DeepFace detector
            try:
                faces = DeepFace.extract_faces(img_path=upload_path, enforce_detection=False)
                if faces:
                    # Take the first detected face
                    det = faces[0]
                    x, y, w, h = det["facial_area"].values()
                    face_img = cv2.imread(upload_path)[y:y+h, x:x+w]

                    result = DeepFace.find(
                        img_path=face_img,
                        db_path="backend/known_faces",
                        enforce_detection=False
                    )
                    if len(result) > 0 and not result.empty:
                        person_name = os.path.splitext(
                            os.path.basename(result.iloc[0]['identity'])
                        )[0]
                    else:
                        person_name = "unknown"
                else:
                    person_name = "unknown"
            except Exception:
                person_name = "unknown"

            # Summary
            summary = dict(Counter([d["class"] for d in detections] + [person_name]))

        # Find annotated file
        base_name = os.path.splitext(safe_filename)[0]
        detected_files = glob.glob(f"static/detections/{base_name}*.*")
        if detected_files:
            annotated_path = detected_files[0].replace("\\", "/")
            if annotated_path.endswith(".avi"):
                annotated_path = convert_avi_to_mp4(annotated_path)
            annotated_path = "/" + annotated_path
            
        # Send Email in background
        if background_tasks:
            email_body = f"PPE Detection Completed\nSummary: {summary}"
            background_tasks.add_task(
                send_detection_email,
                to=["industryproject87@gmail.com"],
                subject="PPE Detection Result",
                body=email_body
            )

        print("Annotated path being returned:", annotated_path)
        return JSONResponse({
            "detections": detections,
            "summary": summary,
            "original_image": f"/static/uploads/{safe_filename}",
            "annotated_image": annotated_path,
            "is_video": is_video
        })

    except Exception as e:
        return JSONResponse({"error": str(e)})

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
