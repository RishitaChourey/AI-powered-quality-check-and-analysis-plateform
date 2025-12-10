from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os 
router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

class GoogleToken(BaseModel):
    id_token: str

@router.post("/google")
def google_auth(data: GoogleToken):
    try:
        payload = id_token.verify_oauth2_token(
            data.id_token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        return {
            "email": payload["email"],
            "name": payload.get("name", ""),
        }

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Google token")
