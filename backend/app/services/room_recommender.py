from collections.abc import Sequence
from dataclasses import dataclass

from app.services.request_parser import Criteria

REASON_TEXT = {
    "en": {"available_full_interval": "Free for the whole requested time."},
    "fr": {"available_full_interval": "Libre pendant tout le créneau demandé."},
    "ar": {"available_full_interval": "متاحة طوال الفترة المطلوبة."},
}


@dataclass(frozen=True)
class EligibleRoom:
    room_id: str
    room_name: str
    capacity: int
    room_type: str
    building: str
    equipment: tuple[str, ...]
    utilization: float  # 0..1, computed by the backend for the requested date


@dataclass(frozen=True)
class Reason:
    code: str
    text: str  # already translated


@dataclass(frozen=True)
class RankedRoom:
    room_id: str
    rank: int  # 1..n, unique
    score: float  # 0..1, rounded to 2 decimals
    reasons: tuple[Reason, ...]


# Step 1 stub: smallest room first, flat score. The weighted score arrives in Step 6,
# which is when criteria starts to be used.
def rank_rooms(
    rooms: Sequence[EligibleRoom], criteria: Criteria, lang: str = "en"
) -> list[RankedRoom]:
    texts = REASON_TEXT.get(lang, REASON_TEXT["en"])
    reason = Reason("available_full_interval", texts["available_full_interval"])
    ordered = sorted(rooms, key=lambda room: (room.capacity, room.room_id))
    return [
        RankedRoom(room.room_id, rank, 0.5, (reason,))
        for rank, room in enumerate(ordered, start=1)
    ]
