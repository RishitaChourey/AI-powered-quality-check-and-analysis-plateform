from fastapi import APIRouter, UploadFile, File, Form
import os, shutil
from services.add_face_service import add_face_embedding

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/add_face/")
async def add_face(
    name: str = Form(...),
    image: UploadFile = File(...)
):
    file_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    result = add_face_embedding(file_path, name)
    return result