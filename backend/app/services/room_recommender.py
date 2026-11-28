from typing import List, Dict, Any
from datetime import date, time


class RoomRecommender:
    """
    Explainable weighted room recommendation.
    Only ranks rooms that passed hard availability filters.
    """

    def __init__(self):
        self.weights = {
            "capacity_fit": 0.25,
            "equipment": 0.15,
            "room_type": 0.10,
            "location": 0.05,
            "utilization": 0.45,
        }

    def recommend(self, available_rooms: List[Dict[str, Any]],
                  student_count: int,
                  required_equipment: List[str],
                  preferred_room_type: str = None,
                  preferred_building: str = None,
                  session_date: date = None,
                  start_time: time = None,
                  end_time: time = None,
                  database=None) -> List[Dict[str, Any]]:
        """
        Rank available rooms with explainable scores.
        database is used to fetch official session utilization for secondary preference.
        """
        scored = []

        for room in available_rooms:
            score = 0.0
            reasons = []

            # Capacity fit: score higher when usage is closer to optimal (e.g., >= 0.9 fill)
            capacity_ratio = room["capacity"] / max(student_count, 1) if student_count else 0
            if room["capacity"] >= student_count:
                # Score: more filled = better fit, not more empty space
                fill_ratio = min(1.0, (student_count / room["capacity"]) * 1.5)
                cap_score = min(1.0, fill_ratio)
                score += self.weights["capacity_fit"] * cap_score
                if capacity_ratio <= 1.5:
                    reasons.append(f"sufficient capacity ({room['capacity']} seats for {student_count} students)")

            # Equipment match
            equipment_score = 0.0
            if required_equipment:
                matched = set(required_equipment).issubset(set(room["equipment"]))
                equipment_score = 1.0 if matched else 0.0
                score += self.weights["equipment"] * equipment_score
                if matched:
                    reasons.append(f"has required equipment: {', '.join(required_equipment)}")

            # Room type match
            type_score = 0.0
            if preferred_room_type:
                if room["room_type"] == preferred_room_type:
                    type_score = 1.0
                    score += self.weights["room_type"]
                    reasons.append(f"matches requested room type: {room['room_type']}")

            # Location preference
            location_score = 0.0
            if preferred_building and room["building"] == preferred_building:
                location_score = 1.0
                score += self.weights["location"]
                reasons.append(f"in preferred building: {room['building']}")

            # Utilization (secondary preference)
            utilization_score = 0.5
            if database and session_date and start_time and end_time:
                scheduled_hours = database.get_utilization(room["room_id"], session_date, start_time, end_time)
                if scheduled_hours is not None:
                    # Duration in hours: difference between end and start times
                    start_minutes = start_time.hour * 60 + start_time.minute
                    end_minutes = end_time.hour * 60 + end_time.minute
                    if end_minutes < start_minutes:  # overnight session
                        total_hours = 24.0 - (start_minutes - end_minutes) / 60.0
                    else:
                        total_hours = (end_minutes - start_minutes) / 60.0
                    if total_hours > 0:
                        util = scheduled_hours / total_hours
                        # Lower utilization = more unused = better for additional session
                        utilization_score = max(0.0, 1.0 - util)
                        if util < 0.5:
                            reasons.append("low scheduled utilization")

            score += self.weights["utilization"] * utilization_score

            scored.append({
                "room": room,
                "score": round(score, 3),
                "reasons": reasons or ["available room matching criteria"],
            })

        # Sort by score descending, then by capacity ascending (better fit)
        scored.sort(key=lambda x: (-x["score"], x["room"]["capacity"], x["room"]["room_id"]))

        return scored

    def get_recommendations(self, criteria: Any, available_rooms: List[Dict[str, Any]],
                            database=None) -> Dict[str, Any]:
        """Get top recommendations for parsed criteria."""
        top_result = self.recommend(
            available_rooms=available_rooms,
            student_count=criteria.student_count or 0,
            required_equipment=criteria.required_equipment or [],
            preferred_room_type=criteria.room_type,
            preferred_building=None,
            session_date=criteria.session_date,
            start_time=criteria.start_time,
            end_time=criteria.end_time,
            database=database,
        )

        recommendations = []
        for item in top_result[:3]:
            room = item["room"]
            recommendations.append({
                "room_id": room["room_id"],
                "room_name": room["room_name"],
                "capacity": room["capacity"],
                "building": room["building"],
                "room_type": room["room_type"],
                "equipment": room["equipment"],
                "score": item["score"],
                "reasons": item["reasons"],
                "available": True,
            })

        return {
            "recommendations": recommendations,
            "method": "weighted_explainable_ranking",
        }
