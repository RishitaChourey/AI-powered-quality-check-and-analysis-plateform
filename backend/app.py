from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import auth, ppe, machine,google_auth
from db.database import init_db
# -------------------------------
app = FastAPI(title="PPE Detection + Auth API", version="1.0")

# -------------------------------
#Initialize db
init_db()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(google_auth.router, prefix="/api", tags=["google-auth"]) 
app.include_router(ppe.router, prefix="/predict", tags=["ppe"])
app.include_router(machine.router, prefix="/predict_machine", tags=["machine"])

@app.get("/")
def root():
    return {"message": "API running"}