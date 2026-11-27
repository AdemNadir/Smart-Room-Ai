from fastapi import APIRouter, HTTPException
from datetime import date
from typing import Optional

from app.database import Database
from app.services.insight_generator import InsightGenerator
from app.services.ollama_provider import OllamaProvider

router = APIRouter(prefix="/api/admin", tags=["admin"])
db = Database()
llm = OllamaProvider()
insight_gen = InsightGenerator(ollama_provider=llm)


@router.get("/metrics")
def get_metrics(start_date: Optional[str] = None, end_date: Optional[str] = None):
    if start_date and end_date:
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
    else:
        start = date(2026, 1, 1)
        end = date(2026, 12, 31)

    metrics = db.get_admin_metrics(start, end)
    insights = insight_gen.generate_insights(metrics)

    return {
        "metrics": metrics,
        "insights": insights,
    }


@router.get("/rooms")
def list_rooms():
    return {"rooms": db.get_all_rooms()}


@router.post("/rooms")
def create_room(room_data: dict):
    room_id = room_data.get("room_id")
    room_name = room_data.get("room_name")
    capacity = int(room_data.get("capacity") or 0)
    room_type = room_data.get("room_type") or "classroom"
    building = room_data.get("building") or ""
    equipment = room_data.get("equipment") or []
    active = room_data.get("active", True)

    if not room_id or not room_name:
        raise HTTPException(status_code=400, detail="room_id and room_name required")

    db.upsert_room(room_id, room_name, capacity, room_type, building, equipment, active)
    return {"status": "created", "room_id": room_id}


@router.delete("/rooms/{room_id}")
def deactivate_room(room_id: str):
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.deactivate_room(room_id)
    return {"status": "deactivated"}


@router.get("/bookings")
def get_bookings(status: Optional[str] = None):
    return {"bookings": db.get_all_bookings(status=status)}


@router.get("/insights")
def generate_insights(start_date: Optional[str] = None, end_date: Optional[str] = None):
    if start_date and end_date:
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
    else:
        start = date(2026, 1, 1)
        end = date(2026, 12, 31)

    metrics = db.get_admin_metrics(start, end)
    insights = insight_gen.generate_insights(metrics)
    return insights