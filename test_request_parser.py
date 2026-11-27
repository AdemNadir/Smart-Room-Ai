import json
import re
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from backend.app.services.request_parser import RequestParser
from backend.app.services.ollama_provider import OllamaProvider
from datetime import date


def test_deterministic():
    """Test deterministic parser with multilingual inputs."""
    parser = RequestParser(ollama_provider=None)
    today = date.today()

    test_cases = [
        (
            "Find a room tomorrow from 10 to 12 for 35 students with a projector",
            {"date": "2026-11-28", "start_time": "10:00", "end_time": "12:00", "student_count": 35, "required_equipment": ["projector"], "room_type": None}
        ),
        (
            "I need a lab for 25 students next Monday with computers",
            {"date": "2026-11-30", "start_time": None, "end_time": None, "student_count": 25, "required_equipment": ["computer"], "room_type": "lab"}
        ),
        (
            "Je cherche une salle demain de 14h à 16h pour 20 étudiants avec un tableau blanc",
            {"date": "2026-11-28", "start_time": "14:00", "end_time": "16:00", "student_count": 20, "required_equipment": ["whiteboard"], "room_type": "classroom"}
        ),
        (
            "أحتاج قاعة بعد غد من 10 إلى 12 لـ 30 طالب مع جهاز عرض.",
            {"date": "2026-11-29", "start_time": "10:00", "end_time": "12:00", "student_count": 30, "required_equipment": ["projector"], "room_type": "classroom"}
        ),
        (
            "Need a room for 40 students on 2026-12-01 from 09:00 to 11:00 with AC and video conference",
            {"date": "2026-12-01", "start_time": "09:00", "end_time": "11:00", "student_count": 40, "required_equipment": ["ac", "video_conference"], "room_type": None}
        ),
    ]

    passed = 0
    failed = 0

    for text, expected in test_cases:
        result = parser._parse_deterministic(text, today)
        result_dict = result.to_dict()

        # Check date
        if expected["date"] is not None:
            if result_dict["date"] != expected["date"]:
                print(f"FAIL: Date mismatch for '{text}': expected {expected['date']}, got {result_dict['date']}")
                failed += 1
                continue

        # Check time
        if expected["start_time"] is not None and result_dict["start_time"] != expected["start_time"]:
            print(f"FAIL: Start time mismatch for '{text}': expected {expected['start_time']}, got {result_dict['start_time']}")
            failed += 1
            continue
        if expected["end_time"] is not None and result_dict["end_time"] != expected["end_time"]:
            print(f"FAIL: End time mismatch for '{text}': expected {expected['end_time']}, got {result_dict['end_time']}")
            failed += 1
            continue

        # Check student count
        if expected["student_count"] is not None and result_dict["student_count"] != expected["student_count"]:
            print(f"FAIL: Student count mismatch for '{text}': expected {expected['student_count']}, got {result_dict['student_count']}")
            failed += 1
            continue

        # Check equipment
        if set(expected["required_equipment"]) != set(result_dict["required_equipment"]):
            print(f"FAIL: Equipment mismatch for '{text}': expected {expected['required_equipment']}, got {result_dict['required_equipment']}")
            failed += 1
            continue

        # Check room type
        if expected["room_type"] is not None and result_dict["room_type"] != expected["room_type"]:
            print(f"FAIL: Room type mismatch for '{text}': expected {expected['room_type']}, got {result_dict['room_type']}")
            failed += 1
            continue

        print(f"PASS: '{text[:50]}...'")
        passed += 1

    print(f"\n{passed}/{passed + failed} tests passed")
    return passed, failed


def test_ollama_provider():
    """Test Ollama provider health check."""
    print("Testing Ollama provider...")
    llm = OllamaProvider()
    if llm.is_healthy():
        print("✓ Ollama is healthy and ready")
        return True
    else:
        print("✗ Ollama is not available")
        return False


def test_json_extraction():
    """Test JSON extraction from various LLM response formats."""
    parser = RequestParser(ollama_provider=None)

    test_cases = [
        ('{"date": "2026-11-28", "start_time": "10:00"}', {"date": "2026-11-28", "start_time": "10:00"}),
        ('```json\n{"date": "2026-11-28", "start_time": "10:00"}\n```', {"date": "2026-11-28", "start_time": "10:00"}),
        ('Here is the JSON:\n{"date": "2026-11-28", "start_time": "10:00"}\nEnd', {"date": "2026-11-28", "start_time": "10:00"}),
        ('{"date": "2026-11-28", "start_time": "10:00"}', {"date": "2026-11-28", "start_time": "10:00"}),
    ]

    passed = 0
    failed = 0

    for response, expected in test_cases:
        result = parser._extract_json(response)
        if result and result.get("date") == expected["date"] and result.get("start_time") == expected["start_time"]:
            print(f"PASS: JSON extraction for response: {response[:30]}...")
            passed += 1
        else:
            print(f"FAIL: JSON extraction for response: {response[:30]}... got: {result}")
            failed += 1

    print(f"\n{passed}/{passed + failed} JSON extraction tests passed")
    return passed, failed


if __name__ == "__main__":
    print("=" * 60)
    print("SMART ROOM AI - Request Parser Tests")
    print("=" * 60)

    print("\n1. Testing Deterministic Parser")
    print("-" * 60)
    p1, f1 = test_deterministic()

    print("\n2. Testing Ollama Provider")
    print("-" * 60)
    ollama_ok = test_ollama_provider()

    print("\n3. Testing JSON Extraction")
    print("-" * 60)
    p2, f2 = test_json_extraction()

    print("\n" + "=" * 60)
    total_passed = p1 + p2
    total_failed = f1 + f2
    print(f"Total: {total_passed}/{total_passed + total_failed} tests passed")
    if total_failed > 0:
        print("❌ Some tests failed")
        sys.exit(1)
    else:
        print("✅ All tests passed")
        sys.exit(0)