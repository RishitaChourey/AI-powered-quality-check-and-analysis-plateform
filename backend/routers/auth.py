from fastapi import APIRouter
from fastapi.responses import JSONResponse
from models.users import User
from db.database import get_connection

router = APIRouter()

@router.post("/signup")
async def signup(user: User):
    try:
        conn = get_connection()
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                  (user.name, user.email, user.password))
        conn.commit()
        conn.close()
        return JSONResponse({"message": "User created successfully!"}, status_code=201)
    except Exception as e:
        return JSONResponse({"message": str(e)}, status_code=400)

@router.post("/login")
async def login(user: User):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=? AND password=?", (user.email, user.password))
    row = c.fetchone()
    conn.close()
    if row:
        return JSONResponse({"message": "Login successful!"}, status_code=200)
    return JSONResponse({"message": "Invalid email or password."}, status_code=401)