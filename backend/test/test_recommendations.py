from app.services.request_parser import Criteria
from app.services.room_recommender import EligibleRoom, rank_rooms


def room(room_id: str, capacity: int) -> EligibleRoom:
    return EligibleRoom(room_id, f"Room {room_id}", capacity, "classroom", "Block A", (), 0.2)


CRITERIA = Criteria(student_count=35)


def test_one_ranked_room_per_input_with_unique_ranks():
    ranked = rank_rooms([room("B1", 60), room("A1", 40), room("C1", 40)], CRITERIA)
    assert [r.room_id for r in ranked] == ["A1", "C1", "B1"]
    assert [r.rank for r in ranked] == [1, 2, 3]


def test_no_rooms_gives_an_empty_list():
    assert rank_rooms([], CRITERIA) == []


def test_unknown_language_falls_back_to_english():
    ranked = rank_rooms([room("A1", 40)], CRITERIA, lang="de")
    assert ranked[0].reasons[0].text == "Free for the whole requested time."
