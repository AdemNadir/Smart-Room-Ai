import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.rooms import router as rooms_router
from app.api.bookings import router as bookings_router
from app.api.admin import router as admin_router
from .database import Database
from .config import DATA_DIR
import os

# Initialize database
db = Database()

# Initialize app
app = FastAPI(title="SMART ROOM AI - Backend")

# CORS for local network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to university LAN IPs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(rooms_router)
app.include_router(bookings_router)
app.include_router(admin_router)

@app.on_event("startup")
def startup_event():
    print(f"SMART ROOM AI starting on port 8000")
    print(f"Database path: {db.path}")

@app.get("/")
def root():
    return {"message": "SMART ROOM AI backend running", "database": str(db.path)}

if __name__ == "__main__":
    # Check if we need to install dependencies
    try:
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
    except Exception as e:
        print(f"Error starting server: {e}")