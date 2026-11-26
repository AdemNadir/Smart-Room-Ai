import sqlite3

import pytest

from app import database


def add_user_and_rooms(conn):
    conn.execute(
        "INSERT INTO users (id, username, display_name, role, password_hash, created_at) "
        "VALUES ('u1', 'prof', 'Prof', 'professor', 'x', '2026-11-26T08:00:00')"
    )
    for room_id in ("A102", "A103"):
        conn.execute(
            "INSERT INTO rooms (room_id, room_name, capacity, room_type, building) "
            "VALUES (?, ?, 40, 'classroom', 'Block A')",
            (room_id, "Classroom " + room_id),
        )


def insert_booking(conn, booking_id, start, end, status="confirmed", room="A102"):
    conn.execute(
        "INSERT INTO bookings (booking_id, room_id, professor_id, session_date, start_time, "
        "end_time, course, group_code, student_count, status, created_at, updated_at) "
        "VALUES (?, ?, 'u1', '2026-11-28', ?, ?, 'Operating Systems', 'L3-G2', 35, ?, "
        "'2026-11-26T08:00:00', '2026-11-26T08:00:00')",
        (booking_id, room, start, end, status),
    )


def test_schema_can_be_created_twice(fresh_db):
    database.init_db()
    with database.read_conn() as conn:
        assert conn.execute("SELECT COUNT(*) FROM rooms").fetchone()[0] == 0


def test_restart_does_not_overwrite_a_changed_setting(fresh_db):
    with database.write_tx() as conn:
        conn.execute("UPDATE system_settings SET value = 'approval' WHERE key = 'approval_mode'")
    database.init_db()
    with database.read_conn() as conn:
        assert database.get_settings(conn)["approval_mode"] == "approval"


def test_trigger_rejects_overlapping_confirmed_insert(fresh_db):
    with database.write_tx() as conn:
        add_user_and_rooms(conn)
        insert_booking(conn, "b1", "10:00", "12:00")
    with pytest.raises(sqlite3.IntegrityError):
        with database.write_tx() as conn:
            insert_booking(conn, "b2", "11:00", "13:00")
    with database.read_conn() as conn:
        assert conn.execute("SELECT COUNT(*) FROM bookings").fetchone()[0] == 1


def test_session_ending_at_ten_does_not_block_ten_oclock(fresh_db):
    with database.write_tx() as conn:
        add_user_and_rooms(conn)
        insert_booking(conn, "b1", "08:00", "10:00")
        insert_booking(conn, "b2", "10:00", "12:00")
    with database.read_conn() as conn:
        assert conn.execute("SELECT COUNT(*) FROM bookings").fetchone()[0] == 2


def test_cancelled_booking_and_other_rooms_do_not_block(fresh_db):
    with database.write_tx() as conn:
        add_user_and_rooms(conn)
        insert_booking(conn, "b1", "10:00", "12:00", status="cancelled")
        insert_booking(conn, "b2", "10:00", "12:00")
        insert_booking(conn, "b3", "10:00", "12:00", room="A103")


def test_trigger_stops_an_update_that_would_create_an_overlap(fresh_db):
    with database.write_tx() as conn:
        add_user_and_rooms(conn)
        insert_booking(conn, "b1", "10:00", "12:00")
        insert_booking(conn, "b2", "10:00", "12:00", status="pending")
    with pytest.raises(sqlite3.IntegrityError):
        with database.write_tx() as conn:
            conn.execute("UPDATE bookings SET status = 'confirmed' WHERE booking_id = 'b2'")


def test_write_tx_rolls_back_when_something_fails(fresh_db):
    with pytest.raises(ValueError):
        with database.write_tx() as conn:
            add_user_and_rooms(conn)
            raise ValueError("boom")
    with database.read_conn() as conn:
        assert conn.execute("SELECT COUNT(*) FROM rooms").fetchone()[0] == 0


def test_audit_log_rows_cannot_be_changed_or_deleted(fresh_db):
    with database.write_tx() as conn:
        database.add_audit(conn, None, "login_failed", "user", None, "unknown user")
    for sql in ("UPDATE audit_log SET detail = 'x'", "DELETE FROM audit_log"):
        with pytest.raises(sqlite3.IntegrityError):
            with database.write_tx() as conn:
                conn.execute(sql)
