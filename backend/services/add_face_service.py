import os
import cv2
import numpy as np
import json
from services.yolo_service import face_app

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
EMBED_DIR = os.path.join(BASE_DIR, "face_embeddings")
os.makedirs(EMBED_DIR, exist_ok=True)

def add_face_embedding(image_path: str, name: str) -> dict:
    """
    Extracts a face embedding from the given image and saves it to disk
    using the provided name directly (no UUID).
    """
    img = cv2.imread(image_path)
    if img is None:
        return {"success": False, "error": "Invalid image file"}

    faces = face_app.get(img)
    if not faces:
        return {"success": False, "error": "No face detected"}

    embedding = faces[0].embedding

    # Use the entered name directly
    emb_file = f"{name}.npy"
    emb_path = os.path.join(EMBED_DIR, emb_file)

    # Save embedding
    np.save(emb_path, embedding)

    # Save metadata
    record = {"name": name, "embedding_file": emb_file}
    meta_file = f"{name}.json"
    meta_path = os.path.join(EMBED_DIR, meta_file)
    with open(meta_path, "w") as f:
        json.dump(record, f)

    return {"success": True, "embedding_file": emb_file, "metadata_file": meta_file}