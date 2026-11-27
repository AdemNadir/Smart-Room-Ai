from fastapi import APIRouter, HTTPException
from datetime import date, time
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database import Database

router = APIRouter(prefix="/api/bookings", tags=["bookings"])
db = Database()


class BookingCreate(BaseModel):
    room_id: str
    professor_id: str
    session_date: str  # ISO date
    start_time: str    # HH:MM
    end_time: str      # HH:MM
    course: str
    group_code: Optional[str] = None
    student_count: int
    status: str = "confirmed"


class BookingCancel(BaseModel):
    booking_id: str
    professor_id: str


@router.post("/")
def create_booking(req: BookingCreate):
    session_date = date.fromisoformat(req.session_date)
    start_time = time.fromisoformat(req.start_time)
    end_time = time.fromisoformat(req.end_time)

    booking_id = str(uuid.uuid4())[:8]

    try:
        created_id = db.create_booking(
            booking_id=booking_id,
            room_id=req.room_id,
            professor_id=req.professor_id,
            session_date=session_date,
            start_time=start_time,
            end_time=end_time,
            course=req.course,
            group_code=req.group_code,
            student_count=req.student_count,
            status=req.status,
        )
        return {"booking_id": created_id, "status": "confirmed"}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/")
def cancel_booking(req: BookingCancel):
    success = db.cancel_booking(req.booking_id, req.professor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found or already cancelled")
    return {"status": "cancelled"}


@router.get("/my")
def get_my_bookings(professor_id: str):
    bookings = db.get_bookings_by_professor(professor_id)
    return {"bookings": bookings}


@router.get("/room/{room_id}")
def get_room_bookings(room_id: str, session_date: str):
    d = date.fromisoformat(session_date)
    bookings = db.get_confirmed_bookings_for_room(room_id, d)
    return {"bookings": bookings}