import sqlite3
import json
from datetime import date, time
from contextlib import contextmanager
from typing import Optional, List, Dict, Any

from app.config import DATA_DIR


class Database:
    """SQLite-backed database for the SMART ROOM AI prototype.

    Every public method opens its own short-lived connection so the class is
    safe to use from FastAPI's threadpool (multiple threads share one
    Database instance).
    """

    def __init__(self, path: Optional[str] = None):
        if path is None:
            path = str(DATA_DIR / "smart_room.db")
        self.path = path

    def _connect(self):
        conn = sqlite3.connect(self.path, check_same_thread=False)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        return conn

    @contextmanager
    def transaction(self):
        """Context manager for database transactions with proper locking."""
        conn = self._connect()
        try:
            conn.execute("BEGIN IMMEDIATE")
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _create_tables_once(self):
        conn = self._connect()
        try:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS rooms (
                    room_id TEXT PRIMARY KEY,
                    room_name TEXT NOT NULL,
                    capacity INTEGER NOT NULL,
                    room_type TEXT NOT NULL DEFAULT 'classroom',
                    building TEXT NOT NULL DEFAULT '',
                    equipment JSON NOT NULL DEFAULT '[]',
                    active BOOLEAN NOT NULL DEFAULT 1
                );

                CREATE TABLE IF NOT EXISTS official_sessions (
                    session_id TEXT PRIMARY KEY,
                    day DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    room_id TEXT NOT NULL,
                    course TEXT NOT NULL,
                    group_code TEXT,
                    student_count INTEGER NOT NULL,
                    session_type TEXT NOT NULL,
                    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
                );

                CREATE TABLE IF NOT EXISTS bookings (
                    booking_id TEXT PRIMARY KEY,
                    room_id TEXT NOT NULL,
                    professor_id TEXT NOT NULL,
                    session_date DATE NOT NULL,
                    start_time TIME NOT NULL,
                    end_time TIME NOT NULL,
                    course TEXT NOT NULL,
                    group_code TEXT,
                    student_count INTEGER NOT NULL,
                    status TEXT NOT NULL DEFAULT 'confirmed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (room_id) REFERENCES rooms(room_id)
                );

                CREATE TABLE IF NOT EXISTS system_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS booking_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    booking_id TEXT,
                    actor TEXT NOT NULL,
                    action TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reason TEXT,
                    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
                );
            """)
            conn.commit()
        finally:
            conn.close()

    def _initialize(self):
        self._create_tables_once()

    # Room methods

    def upsert_room(self, room_id: str, room_name: str, capacity: int,
                    room_type: str, building: str, equipment: List[str],
                    active: bool = True):
        """Insert or update a room."""
        conn = self._connect()
        try:
            conn.execute("""
                INSERT INTO rooms (room_id, room_name, capacity, room_type, building, equipment, active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(room_id) DO UPDATE SET
                    room_name=excluded.room_name,
                    capacity=excluded.capacity,
                    room_type=excluded.room_type,
                    building=excluded.building,
                    equipment=excluded.equipment,
                    active=excluded.active
            """, (room_id, room_name, capacity, room_type, building, json.dumps(equipment), active))
            conn.commit()
        finally:
            conn.close()

    def get_room(self, room_id: str) -> Optional[Dict[str, Any]]:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT room_id, room_name, capacity, room_type, building, equipment, active FROM rooms WHERE room_id=?",
                (room_id,)
            )
            row = cursor.fetchone()
            if row is None:
                return None
            return {
                "room_id": row[0],
                "room_name": row[1],
                "capacity": row[2],
                "room_type": row[3],
                "building": row[4],
                "equipment": json.loads(row[5]),
                "active": bool(row[6])
            }
        finally:
            conn.close()

    def deactivate_room(self, room_id: str) -> bool:
        conn = self._connect()
        try:
            cursor = conn.execute("UPDATE rooms SET active=0 WHERE room_id=?", (room_id,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def get_all_rooms(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT room_id, room_name, capacity, room_type, building, equipment, active FROM rooms WHERE active=1"
            )
            rooms = []
            for row in cursor:
                rooms.append({
                    "room_id": row[0],
                    "room_name": row[1],
                    "capacity": row[2],
                    "room_type": row[3],
                    "building": row[4],
                    "equipment": json.loads(row[5]),
                    "active": bool(row[6])
                })
            return rooms
        finally:
            conn.close()

    # Official sessions methods

    def upsert_official_session(self, session_id: str, day: date, start_time: time,
                                end_time: time, room_id: str, course: str,
                                group_code: Optional[str], student_count: int,
                                session_type: str):
        conn = self._connect()
        try:
            conn.execute("""
                INSERT INTO official_sessions (session_id, day, start_time, end_time, room_id, course, group_code, student_count, session_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    day=excluded.day, start_time=excluded.start_time, end_time=excluded.end_time,
                    room_id=excluded.room_id, course=excluded.course, group_code=excluded.group_code,
                    student_count=excluded.student_count, session_type=excluded.session_type
            """, (session_id, day.isoformat() if hasattr(day, 'isoformat') else str(day),
                  start_time.isoformat()[:5] if hasattr(start_time, 'isoformat') else str(start_time),
                  end_time.isoformat()[:5] if hasattr(end_time, 'isoformat') else str(end_time),
                  room_id, course, group_code, student_count, session_type))
            conn.commit()
        finally:
            conn.close()

    def get_official_sessions_by_room(self, room_id: str) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT session_id, day, start_time, end_time, room_id, course, group_code, student_count, session_type FROM official_sessions WHERE room_id=?",
                (room_id,)
            )
            return [
                {
                    "session_id": row[0], "day": row[1], "start_time": str(row[2]),
                    "end_time": str(row[3]), "room_id": row[4], "course": row[5],
                    "group_code": row[6], "student_count": row[7], "session_type": row[8]
                }
                for row in cursor
            ]
        finally:
            conn.close()

    # Booking methods

    def create_booking(self, booking_id: str, room_id: str, professor_id: str,
                       session_date: date, start_time: time, end_time: time,
                       course: str, group_code: Optional[str], student_count: int,
                       status: str = "confirmed") -> str:
        """Create a booking within a transaction - rechecks availability."""
        with self.transaction() as conn:
            if not self._is_room_available_with_conn(conn, room_id, session_date, start_time, end_time):
                raise ValueError("Room is not available at the requested time")

            conn.execute("""
                INSERT INTO bookings (booking_id, room_id, professor_id, session_date, start_time, end_time, course, group_code, student_count, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (booking_id, room_id, professor_id,
                  session_date.isoformat() if hasattr(session_date, 'isoformat') else str(session_date),
                  start_time.isoformat()[:5] if hasattr(start_time, 'isoformat') else str(start_time),
                  end_time.isoformat()[:5] if hasattr(end_time, 'isoformat') else str(end_time),
                  course, group_code, student_count, status))

            conn.execute("""
                INSERT INTO booking_history (booking_id, actor, action, reason)
                VALUES (?, ?, 'created', NULL)
            """, (booking_id, professor_id))

            return booking_id

    def cancel_booking(self, booking_id: str, professor_id: str) -> bool:
        with self.transaction() as conn:
            cursor = conn.execute(
                "SELECT room_id, status FROM bookings WHERE booking_id=? AND professor_id=?",
                (booking_id, professor_id)
            )
            row = cursor.fetchone()
            if row is None:
                return False

            room_id, status = row
            if status == "cancelled":
                return False

            conn.execute(
                "UPDATE bookings SET status='cancelled' WHERE booking_id=?",
                (booking_id,)
            )
            conn.execute("""
                INSERT INTO booking_history (booking_id, actor, action, reason)
                VALUES (?, ?, 'cancelled', NULL)
            """, (booking_id, professor_id))

            return True

    def get_bookings_by_professor(self, professor_id: str) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT booking_id, room_id, session_date, start_time, end_time, course, "
                "group_code, student_count, status, created_at FROM bookings "
                "WHERE professor_id=? ORDER BY session_date, start_time",
                (professor_id,)
            )
            return [
                {
                    "booking_id": row[0], "room_id": row[1], "session_date": str(row[2]),
                    "start_time": str(row[3]), "end_time": str(row[4]), "course": row[5],
                    "group_code": row[6], "student_count": row[7], "status": row[8],
                    "created_at": str(row[9]),
                }
                for row in cursor
            ]
        finally:
            conn.close()

    def get_confirmed_bookings_for_room(self, room_id: str, session_date: date) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT booking_id, professor_id, session_date, start_time, end_time, course, "
                "group_code, student_count, status FROM bookings "
                "WHERE room_id=? AND session_date=? AND status='confirmed'",
                (room_id, session_date.isoformat() if hasattr(session_date, 'isoformat') else str(session_date))
            )
            return [
                {
                    "booking_id": row[0], "professor_id": row[1], "session_date": str(row[2]),
                    "start_time": str(row[3]), "end_time": str(row[4]), "course": row[5],
                    "group_code": row[6], "student_count": row[7], "status": row[8],
                }
                for row in cursor
            ]
        finally:
            conn.close()

    def get_all_bookings(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._connect()
        try:
            if status:
                cursor = conn.execute(
                    "SELECT booking_id, room_id, professor_id, session_date, start_time, end_time, "
                    "course, group_code, student_count, status FROM bookings WHERE status=? "
                    "ORDER BY session_date, start_time",
                    (status,)
                )
            else:
                cursor = conn.execute(
                    "SELECT booking_id, room_id, professor_id, session_date, start_time, end_time, "
                    "course, group_code, student_count, status FROM bookings "
                    "ORDER BY session_date, start_time"
                )
            return [
                {
                    "booking_id": row[0], "room_id": row[1], "professor_id": row[2],
                    "session_date": str(row[3]), "start_time": str(row[4]), "end_time": str(row[5]),
                    "course": row[6], "group_code": row[7], "student_count": row[8], "status": row[9],
                }
                for row in cursor
            ]
        finally:
            conn.close()

    def _is_room_available_with_conn(self, conn, room_id: str, session_date: date,
                                     start_time: time, end_time: time) -> bool:
        """Check if a room is available (no overlapping official sessions or confirmed bookings)."""
        sessions = self.get_official_sessions_by_room_with_conn(conn, room_id)
        for s in sessions:
            s_date = s["day"]
            s_start = s["start_time"]
            s_end = s["end_time"]
            # Overlap rule: start1 < end2 AND start2 < end1
            if s_date == session_date:
                s_start_cmp = str(s_start) if isinstance(s_start, time) else s_start
                s_end_cmp = str(s_end) if isinstance(s_end, time) else s_end
                start_cmp = str(start_time) if isinstance(start_time, time) else start_time
                end_cmp = str(end_time) if isinstance(end_time, time) else end_time
                if s_start_cmp < end_cmp and start_cmp < s_end_cmp:
                    return False

        cursor = conn.execute(
            "SELECT start_time, end_time FROM bookings WHERE room_id=? AND status='confirmed'",
            (room_id,)
        )
        for row in cursor:
            b_start = row[0]
            b_end = row[1]
            # Normalize to strings for comparison (stored as HH:MM strings in SQLite)
            b_start_cmp = str(b_start) if isinstance(b_start, time) else str(b_start)
            b_end_cmp = str(b_end) if isinstance(b_end, time) else str(b_end)
            start_cmp = str(start_time) if isinstance(start_time, time) else str(start_time)
            end_cmp = str(end_time) if isinstance(end_time, time) else str(end_time)
            if b_start_cmp < end_cmp and start_cmp < b_end_cmp:
                return False

        return True

    def _is_room_available(self, room_id: str, session_date: date,
                           start_time: time, end_time: time) -> bool:
        """Check if a room is available (no overlapping official sessions or confirmed bookings)."""
        conn = self._connect()
        try:
            return self._is_room_available_with_conn(conn, room_id, session_date, start_time, end_time)
        finally:
            conn.close()

    # Search methods

    def search_available_rooms(self, session_date: date, start_time: time,
                               end_time: time, min_capacity: int = 0,
                               required_equipment: Optional[List[str]] = None,
                               preferred_room_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search for rooms available at the given time, filtered by hard constraints."""
        if required_equipment is None:
            required_equipment = []
        rooms = self.get_all_rooms()
        available = []

        for room in rooms:
            if not room["active"]:
                continue
            if not self._is_room_available(room["room_id"], session_date, start_time, end_time):
                continue
            if room["capacity"] < min_capacity:
                continue
            room_equipment = set(room["equipment"])
            req_set = set(required_equipment)
            if req_set and not req_set.issubset(room_equipment):
                continue
            if preferred_room_type and room["room_type"] != preferred_room_type:
                continue

            available.append(room)

        return available

    # Utilization / metrics

    def get_utilization(self, room_id: str, session_date: date,
                        start_time: time, end_time: time) -> Optional[float]:
        """Return total scheduled hours for a room on a given date overlapping the window."""
        sessions = self.get_official_sessions_by_room(room_id)
        total_hours = 0.0
        for s in sessions:
            if s["day"] != session_date:
                continue
            s_start = self._parse_time(s["start_time"])
            s_end = self._parse_time(s["end_time"])
            overlap_start = max(s_start, start_time)
            overlap_end = min(s_end, end_time)
            if overlap_start < overlap_end:
                total_hours += (overlap_end.hour - overlap_start.hour) + \
                               (overlap_end.minute - overlap_start.minute) / 60.0
        return total_hours

    @staticmethod
    def _parse_time(t) -> time:
        if isinstance(t, time):
            return t
        s = str(t)
        parts = s.split(":")
        return time(int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0)

    def get_official_sessions_by_room_with_conn(self, conn, room_id: str) -> List[Dict[str, Any]]:
        cursor = conn.execute(
            "SELECT session_id, day, start_time, end_time, room_id, course, group_code, student_count, session_type FROM official_sessions WHERE room_id=?",
            (room_id,)
        )
        return [
            {
                "session_id": row[0], "day": row[1], "start_time": str(row[2]),
                "end_time": str(row[3]), "room_id": row[4], "course": row[5],
                "group_code": row[6], "student_count": row[7], "session_type": row[8]
            }
            for row in cursor
        ]

    def get_admin_metrics(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Compute verified admin dashboard metrics."""
        rooms = self.get_all_rooms()
        total_rooms = len(rooms)

        scheduled_hours_by_room = {}
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT room_id, start_time, end_time, day FROM official_sessions"
            )
            for row in cursor:
                room_id = row[0]
                s_start = self._parse_time(row[1])
                s_end = self._parse_time(row[2])
                hours = (s_end.hour - s_start.hour) + (s_end.minute - s_start.minute) / 60.0
                if s_start >= s_end:
                    hours += 24
                scheduled_hours_by_room[room_id] = scheduled_hours_by_room.get(room_id, 0.0) + hours

            extra_hours_by_room = {}
            booking_status_counts = {"confirmed": 0, "pending": 0, "cancelled": 0}
            cursor = conn.execute(
                "SELECT room_id, start_time, end_time, status FROM bookings WHERE session_date BETWEEN ? AND ?",
                (start_date, end_date)
            )
            for row in cursor:
                room_id = row[0]
                b_start = self._parse_time(row[1])
                b_end = self._parse_time(row[2])
                hours = (b_end.hour - b_start.hour) + (b_end.minute - b_start.minute) / 60.0
                if b_start >= b_end:
                    hours += 24
                extra_hours_by_room[room_id] = extra_hours_by_room.get(room_id, 0.0) + hours
                status = row[3]
                if status in booking_status_counts:
                    booking_status_counts[status] += 1
        finally:
            conn.close()

        building_hours = {}
        for room in rooms:
            rid = room["room_id"]
            building = room["building"]
            hrs = scheduled_hours_by_room.get(rid, 0.0) + extra_hours_by_room.get(rid, 0.0)
            building_hours[building] = building_hours.get(building, 0.0) + hrs

        most_requested_rooms = sorted(
            extra_hours_by_room.items(), key=lambda x: -x[1]
        )[:5]

        return {
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "total_rooms": total_rooms,
            "scheduled_hours_by_room": scheduled_hours_by_room,
            "extra_hours_by_room": extra_hours_by_room,
            "building_hours": building_hours,
            "booking_status_counts": booking_status_counts,
            "most_requested_rooms": most_requested_rooms,
        }

    # System settings

    def set_setting(self, key: str, value: str):
        conn = self._connect()
        try:
            conn.execute(
                "INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)",
                (key, value)
            )
            conn.commit()
        finally:
            conn.close()

    def get_setting(self, key: str, default: str = "") -> str:
        conn = self._connect()
        try:
            cursor = conn.execute(
                "SELECT value FROM system_settings WHERE key=?",
                (key,)
            )
            row = cursor.fetchone()
            if row is None:
                return default
            return row[0]
        finally:
            conn.close()
