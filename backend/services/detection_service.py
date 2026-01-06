import cv2
import os
import numpy as np
from numpy.linalg import norm
from typing import Dict, List

from services.video_utils import convert_avi_to_mp4
from services.yolo_service import (
    person_model,
    ppe_model,
    face_model,
    face_app
)

# ================= CONFIG ================= #
FACE_THRESHOLD = 0.30
FRAME_INTERVAL = 100
EMBED_DIR = "face_embeddings"

DETECTIONS_DIR = "static/detections"
os.makedirs(DETECTIONS_DIR, exist_ok=True)

# =========================================================
# CORE FRAME ANALYSIS (USED BY IMAGE + VIDEO)
# =========================================================
def analyze_frame(frame: np.ndarray) -> List[Dict]:
    persons = []

    # ---------------- PERSON DETECTION ---------------- #
    person_results = person_model(frame, classes=[0])[0]
    for box in person_results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        persons.append({
            "bbox": (x1, y1, x2, y2),
            "name": "Unknown",
            "ppe": []
        })

    # ---------------- FACE DETECTION ---------------- #
    face_results = face_model(frame)[0]
    h, w, _ = frame.shape

    for box in face_results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        bw, bh = x2 - x1, y2 - y1
        pad_x = int(0.7 * bw)
        pad_y = int(0.8 * bh)

        x1e = max(0, x1 - pad_x)
        y1e = max(0, y1 - pad_y)
        x2e = min(w, x2 + pad_x)
        y2e = min(h, y2 + pad_y)

        face_crop = frame[y1e:y2e, x1e:x2e]
        if face_crop.size == 0 or face_crop.shape[0] < 80:
            continue

        faces = face_app.get(face_crop)
        best_name = "Unknown"
        best_score = 0.0

        if faces:
            test_emb = faces[0].embedding

            for file in os.listdir(EMBED_DIR):
                if file.endswith(".npy"):
                    known_emb = np.load(os.path.join(EMBED_DIR, file))
                    sim = np.dot(test_emb, known_emb) / (
                        norm(test_emb) * norm(known_emb)
                    )
                    if sim > best_score:
                        best_score = sim
                        best_name = file.replace(".npy", "")

            if best_score < FACE_THRESHOLD:
                best_name = "Unknown"

        face_center = ((x1 + x2) // 2, (y1 + y2) // 2)

        for person in persons:
            px1, py1, px2, py2 = person["bbox"]
            if px1 <= face_center[0] <= px2 and py1 <= face_center[1] <= py2:
                person["name"] = best_name

    # ---------------- PPE DETECTION ---------------- #
    ppe_results = ppe_model(frame)[0]

    for box in ppe_results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        label = ppe_model.names[int(box.cls[0])]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        for person in persons:
            px1, py1, px2, py2 = person["bbox"]
            if px1 <= cx <= px2 and py1 <= cy <= py2:
                person["ppe"].append(label)

    # Deduplicate PPE per person
    for person in persons:
        person["ppe"] = list(set(person["ppe"]))

    return persons


# =========================================================
# VIDEO PIPELINE
# =========================================================
def process_video_for_ppe(video_path: str) -> Dict:
    video_path = convert_avi_to_mp4(video_path)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Video could not be opened")

    frame_count = 0
    per_frame_results = []
    global_ppe_summary = {}
    saved_frames = []
    unknown_count = 0
    unknown_ppe_summary = set()
    violation_tracker = {}   # ppe_label -> set(person_name)
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % FRAME_INTERVAL != 0:
            continue

        persons = analyze_frame(frame)
        annotated = frame.copy()
        for person in persons:
            x1, y1, x2, y2 = person["bbox"]
            name = person["name"]

            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            cv2.putText(
                annotated,
                name,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

            for i, ppe in enumerate(person["ppe"]):
                cv2.putText(
                    annotated,
                    ppe,
                    (x1, y2 + 20 + i * 18),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 0, 255),
                    1
                )
        # save frame
        frame_name = f"frame_{frame_count}.jpg"
        frame_path = os.path.join(DETECTIONS_DIR, frame_name)
        cv2.imwrite(frame_path, annotated)
        saved_frames.append(f"/static/detections/{frame_name}")

        # -------- SUMMARY -------- #
        for person in persons:
            name = person["name"]
            if name == "Unknown":
                unknown_count += 1
                for ppe in person["ppe"]:
                  unknown_ppe_summary.add(ppe)
                continue

            global_ppe_summary.setdefault(name, set())
            for ppe in person["ppe"]:
                global_ppe_summary[name].add(ppe)
                # -------- GLOBAL PER-PPE PER-PERSON COUNT -------- #
                violation_tracker.setdefault(ppe, set())
                violation_tracker[ppe].add(name)

        per_frame_results.append({
            "frame": frame_count,
            "persons": persons
        })
    final_ppe_counts = {
        ppe: len(person_set)
        for ppe, person_set in violation_tracker.items()
    }


    cap.release()

    return {
        "success": True,
        "is_video": True,
        "frames": saved_frames,
        "total_frames_processed": len(saved_frames),
        "final_ppe_summary": {
            k: list(v) for k, v in global_ppe_summary.items()
        },
        "unknowns_summary": {
            "total_unknown_detections": unknown_count,
            "ppe_detected": list(unknown_ppe_summary)
        },
        "ppe_counts_per_person": final_ppe_counts
    }



# =========================================================
# IMAGE / WEBCAM PIPELINE
# =========================================================

def process_image_for_ppe(image_path: str) -> Dict:
    frame = cv2.imread(image_path)
    if frame is None:
        raise RuntimeError("Image could not be read")

    persons = analyze_frame(frame)
    annotated = frame.copy()

    for person in persons:
        x1, y1, x2, y2 = person["bbox"]
        name = person["name"]

        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            annotated,
            name,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

        for i, ppe in enumerate(person["ppe"]):
            cv2.putText(
                annotated,
                ppe,
                (x1, y2 + 20 + i * 18),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                1
            )

    img_name = f"image_{os.path.basename(image_path)}"
    img_path = os.path.join(DETECTIONS_DIR, img_name)
    cv2.imwrite(img_path, annotated)

    return {
        "success": True,
        "is_video": False,
        "frames": [f"/static/detections/{img_name}"],
        "persons": persons
    }