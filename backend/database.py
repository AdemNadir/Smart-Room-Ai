import sqlite3
import threading
from contextlib import contextmanager

from app import clock, config

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('professor','admin')),
  password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY, room_name TEXT NOT NULL, capacity INTEGER NOT NULL CHECK (capacity > 0),
  room_type TEXT NOT NULL CHECK (room_type IN ('lecture','classroom','lab','amphitheatre')),
  building TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS room_equipment (
  room_id TEXT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE, item TEXT NOT NULL,
  PRIMARY KEY (room_id, item));
CREATE TABLE IF NOT EXISTS official_sessions (
  session_id TEXT PRIMARY KEY, weekday TEXT, session_date TEXT,
  start_time TEXT NOT NULL, end_time TEXT NOT NULL,
  room_id TEXT NOT NULL REFERENCES rooms(room_id), course TEXT NOT NULL, group_code TEXT NOT NULL,
  student_count INTEGER, session_type TEXT NOT NULL,
  CHECK ((weekday IS NULL) <> (session_date IS NULL)), CHECK (start_time < end_time));
CREATE TABLE IF NOT EXISTS bookings (
  booking_id TEXT PRIMARY KEY, room_id TEXT NOT NULL REFERENCES rooms(room_id),
  professor_id TEXT NOT NULL REFERENCES users(id), session_date TEXT NOT NULL,
  start_time TEXT NOT NULL, end_time TEXT NOT NULL, course TEXT NOT NULL, group_code TEXT NOT NULL,
  student_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled','rejected')),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, CHECK (start_time < end_time));
CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings(room_id, session_date, status);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT, action TEXT NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT, detail TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- Second line of defence behind the transactional recheck in booking_service.
CREATE TRIGGER IF NOT EXISTS bookings_no_overlap_insert
BEFORE INSERT ON bookings
WHEN NEW.status = 'confirmed' AND EXISTS (
  SELECT 1 FROM bookings
  WHERE room_id = NEW.room_id AND session_date = NEW.session_date AND status = 'confirmed'
    AND start_time < NEW.end_time AND NEW.start_time < end_time)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;

CREATE TRIGGER IF NOT EXISTS bookings_no_overlap_update
BEFORE UPDATE OF status, room_id, session_date, start_time, end_time ON bookings
WHEN NEW.status = 'confirmed' AND EXISTS (
  SELECT 1 FROM bookings
  WHERE booking_id <> NEW.booking_id
    AND room_id = NEW.room_id AND session_date = NEW.session_date AND status = 'confirmed'
    AND start_time < NEW.end_time AND NEW.start_time < end_time)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;

-- The audit log is append-only (contract 5 and S15).
CREATE TRIGGER IF NOT EXISTS audit_log_no_update
BEFORE UPDATE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;

CREATE TRIGGER IF NOT EXISTS audit_log_no_delete
BEFORE DELETE ON audit_log
BEGIN
  SELECT RAISE(ABORT, 'audit_log_is_append_only');
END;
"""

DEFAULT_SETTINGS = {
    "approval_mode": "instant",
    "pending_blocks_room": "0",
    "working_hours_start": "08:00",
    "working_hours_end": "18:00",
    "working_days": "sun,mon,tue,wed,thu",
    "min_booking_minutes": "30",
    "max_booking_minutes": "240",
}

AUDIT_ACTIONS = (
    "login_failed", "booking_requested", "booking_confirmed", "booking_approved",
    "booking_rejected", "booking_cancelled", "rooms_imported", "schedule_imported",
    "room_updated", "settings_updated",
)

# SQLite has one writer. This lock queues our own threads so they wait here instead of
# fighting over the database file. Never nest write_tx(): the lock is not re-entrant.
_write_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    # isolation_level=None: we send BEGIN / COMMIT ourselves, nothing is hidden from us.
    conn = sqlite3.connect(config.DB_PATH, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")  # off by default in SQLite, per connection
    conn.execute("PRAGMA busy_timeout = 5000")
    return conn


def init_db() -> None:
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = _connect()
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(SCHEMA)
        # INSERT OR IGNORE so a restart never overwrites what the admin changed
        conn.executemany(
            "INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)",
            list(DEFAULT_SETTINGS.items()),
        )
    finally:
        conn.close()


@contextmanager
def read_conn():
    # Use from normal (sync) route functions only: the connection belongs to its thread.
    conn = _connect()
    try:
        conn.execute("BEGIN")  # every query of one request sees the same snapshot
        yield conn
    finally:
        conn.close()


@contextmanager
def write_tx():
    with _write_lock:
        conn = _connect()
        try:
            # IMMEDIATE takes the write lock now, so the rechecks done inside this block
            # cannot be invalidated by another writer before we commit.
            conn.execute("BEGIN IMMEDIATE")
            yield conn
            conn.execute("COMMIT")
        except Exception:
            if conn.in_transaction:
                conn.execute("ROLLBACK")
            raise
        finally:
            conn.close()


def get_settings(conn: sqlite3.Connection) -> dict[str, str]:
    rows = conn.execute("SELECT key, value FROM system_settings").fetchall()
    return {row["key"]: row["value"] for row in rows}


def _room(row: sqlite3.Row, equipment: list[str]) -> dict:
    return {
        "room_id": row["room_id"],
        "room_name": row["room_name"],
        "capacity": row["capacity"],
        "room_type": row["room_type"],
        "building": row["building"],
        "equipment": equipment,
        "active": bool(row["active"]),
    }


def all_rooms(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT room_id, room_name, capacity, room_type, building, active "
        "FROM rooms ORDER BY building, room_id"
    ).fetchall()
    items: dict[str, list[str]] = {}
    for link in conn.execute("SELECT room_id, item FROM room_equipment ORDER BY item"):
        items.setdefault(link["room_id"], []).append(link["item"])
    return [_room(row, items.get(row["room_id"], [])) for row in rows]


def find_room(conn: sqlite3.Connection, room_id: str) -> dict | None:
    row = conn.execute(
        "SELECT room_id, room_name, capacity, room_type, building, active "
        "FROM rooms WHERE room_id = ?",
        (room_id,),
    ).fetchone()
    if row is None:
        return None
    links = conn.execute(
        "SELECT item FROM room_equipment WHERE room_id = ? ORDER BY item", (room_id,)
    ).fetchall()
    return _room(row, [link["item"] for link in links])


def add_audit(conn: sqlite3.Connection, actor_id: str | None, action: str,
              entity_type: str, entity_id: str | None = None,
              detail: str | None = None) -> None:
    # Pass the connection of the running write_tx() so the row commits (or rolls back)
    # together with the change it describes.
    if action not in AUDIT_ACTIONS:
        raise ValueError(f"unknown audit action: {action}")
    conn.execute(
        "INSERT INTO audit_log (actor_id, action, entity_type, entity_id, detail, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (actor_id, action, entity_type, entity_id, detail,
         clock.now().isoformat(timespec="seconds")),
    )
