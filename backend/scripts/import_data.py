#!/usr/bin/env python3
"""
Import sample data into the database.
Run this once before starting the server.
"""
import sys
import json
from pathlib import Path

# Add parent dir to path so we can import 'app' package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pandas as pd
from datetime import date, time

from app.database import Database
from app.config import DATA_DIR


def import_rooms(csv_path: Path, db: Database):
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        # Parse equipment as comma-separated list
        equipment_raw = str(row["equipment"]).strip()
        equipment = []
        if equipment_raw and equipment_raw.lower() != "nan" and equipment_raw.lower() != "none":
            # Split by comma and clean up
            for item in equipment_raw.split(","):
                item = item.strip().strip('"').strip("'").lower()
                if item and item != "nan" and item != "none":
                    equipment.append(item)
        db.upsert_room(
            room_id=row["room_id"],
            room_name=row["room_name"],
            capacity=int(row["capacity"]),
            room_type=row["room_type"],
            building=row["building"] if pd.notna(row["building"]) else "",
            equipment=equipment,
            active=bool(row["active"]),
        )
    print(f"Imported {len(df)} rooms")


def import_schedule(csv_path: Path, db: Database):
    df = pd.read_csv(csv_path)
    for _, row in df.iterrows():
        db.upsert_official_session(
            session_id=row["session_id"],
            day=date.fromisoformat(row["day"]),
            start_time=row["start_time"],  # Pass as string, will parse in DB
            end_time=row["end_time"],      # Pass as string, will parse in DB
            room_id=row["room_id"],
            course=row["course"],
            group_code=row["group_code"] if pd.notna(row["group_code"]) else None,
            student_count=int(row["student_count"]),
            session_type=row["session_type"],
        )
    print(f"Imported {len(df)} official sessions")


def main():
    db = Database()

    rooms_csv = DATA_DIR / "sample_rooms.csv"
    schedule_csv = DATA_DIR / "sample_schedule.csv"

    if not rooms_csv.exists():
        print(f"Rooms CSV not found: {rooms_csv}")
        return

    if not schedule_csv.exists():
        print(f"Schedule CSV not found: {schedule_csv}")
        return

    import_rooms(rooms_csv, db)
    import_schedule(schedule_csv, db)

    print("Data import complete!")


if __name__ == "__main__":
    main()