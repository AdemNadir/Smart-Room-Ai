from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.database import Database
from app.services.request_parser import RequestParser, SearchCriteria
from app.services.room_recommender import RoomRecommender
from app.config import DATA_DIR
from app.services.ollama_provider import OllamaProvider

router = APIRouter(prefix="/api/rooms", tags=["rooms"])
db = Database()
llm = OllamaProvider()
parser = RequestParser(ollama_provider=llm)
recommender = RoomRecommender()


class Room(BaseModel):
    room_id: str
    room_name: str
    capacity: int
    room_type: str
    building: str
    equipment: List[str]
    active: bool


class SearchRequest(BaseModel):
    date: str
    start_time: str
    end_time: str
    student_count: int
    required_equipment: List[str] = []
    preferred_room_type: Optional[str] = None


class AIParseRequest(BaseModel):
    text: str


class AIParseResponse(BaseModel):
    extracted: dict
    ready: bool


@router.get("/")
def list_rooms():
    return {"rooms": db.get_all_rooms()}


@router.get("/{room_id}")
def get_room(room_id: str):
    room = db.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.post("/search")
def search_rooms(req: SearchRequest):
    from datetime import date, time
    session_date = date.fromisoformat(req.date)
    start_time = time.fromisoformat(req.start_time)
    end_time = time.fromisoformat(req.end_time)

    available = db.search_available_rooms(
        session_date=session_date,
        start_time=start_time,
        end_time=end_time,
        min_capacity=req.student_count,
        required_equipment=req.required_equipment,
        preferred_room_type=req.preferred_room_type,
    )

    ranked = recommender.recommend(
        available_rooms=available,
        student_count=req.student_count,
        required_equipment=req.required_equipment,
        preferred_room_type=req.preferred_room_type,
        session_date=session_date,
        start_time=start_time,
        end_time=end_time,
        database=db,
    )

    results = []
    for item in ranked[:5]:
        room = item["room"]
        results.append({
            "room_id": room["room_id"],
            "room_name": room["room_name"],
            "capacity": room["capacity"],
            "room_type": room["room_type"],
            "building": room["building"],
            "equipment": room["equipment"],
            "score": item["score"],
            "reasons": item["reasons"],
        })

    return {"available_rooms": results}


@router.post("/ai-parse")
def ai_parse(req: AIParseRequest):
    criteria = parser.parse(req.text)
    ready = bool(criteria.session_date and criteria.start_time and criteria.end_time and criteria.student_count)
    return {
        "extracted": criteria.to_dict(),
        "ready": ready,
    }


@router.post("/ai-search")
def ai_search(req: AIParseRequest):
    from datetime import date, time
    criteria = parser.parse(req.text)
    if not criteria.session_date:
        raise HTTPException(status_code=400, detail="Could not resolve date")

    available = db.search_available_rooms(
        session_date=criteria.session_date,
        start_time=criteria.start_time or time(9, 0),
        end_time=criteria.end_time or time(17, 0),
        min_capacity=criteria.student_count or 0,
        required_equipment=criteria.required_equipment,
        preferred_room_type=criteria.room_type,
    )

    ranked = recommender.recommend(
        available_rooms=available,
        student_count=criteria.student_count or 0,
        required_equipment=criteria.required_equipment,
        preferred_room_type=criteria.room_type,
        session_date=criteria.session_date,
        start_time=criteria.start_time or time(9, 0),
        end_time=criteria.end_time or time(17, 0),
        database=db,
    )

    results = []
    for item in ranked[:5]:
        room = item["room"]
        results.append({
            "room_id": room["room_id"],
            "room_name": room["room_name"],
            "capacity": room["capacity"],
            "room_type": room["room_type"],
            "building": room["building"],
            "equipment": room["equipment"],
            "score": item["score"],
            "reasons": item["reasons"],
        })

    return {
        "criteria": criteria.to_dict(),
        "available_rooms": results,
    }