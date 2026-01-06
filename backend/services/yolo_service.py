from ultralytics import YOLO
import os
from insightface.app import FaceAnalysis

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
WEIGHTS_DIR = os.path.join(BASE_DIR, "weights")

ppe_model = YOLO(os.path.join(WEIGHTS_DIR, "ppe_model.pt"))
machine_model = YOLO(os.path.join(WEIGHTS_DIR, "machine_model.pt"))
person_model = YOLO(os.path.join(WEIGHTS_DIR, "yolov8s.pt"))
face_model = YOLO(os.path.join(WEIGHTS_DIR, "yolo_face.pt"))

# ================= FACE RECOGNITION MODEL ================= #
face_app = FaceAnalysis(
    name="buffalo_l",
    providers=["CPUExecutionProvider"]
)
face_app.prepare(ctx_id=0, det_size=(640, 640))

def run_ppe_detection(path: str):
    return ppe_model.predict(source=path, save=True, conf=0.25,iou=0.55, project="static", name="detections", exist_ok=True)

def run_machine_detection(path: str):
    return machine_model.predict(source=path, save=True, conf=0.50, project="static", name="machine", exist_ok=True)