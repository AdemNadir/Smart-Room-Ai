<<<<<<< HEAD
import json
import re
from datetime import date, time, timedelta
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

from .ollama_provider import OllamaProvider


@dataclass
class SearchCriteria:
    """Structured search criteria extracted from natural language."""
    session_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    student_count: Optional[int] = None
    required_equipment: Optional[List[str]] = None
    room_type: Optional[str] = None
    preferences: Optional[List[str]] = None
    raw_text: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "date": self.session_date.isoformat() if self.session_date else None,
            "start_time": self.start_time.strftime("%H:%M") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
            "student_count": self.student_count,
            "required_equipment": self.required_equipment or [],
            "room_type": self.room_type,
            "preferences": self.preferences or [],
        }


class RequestParser:
    """
    Natural language request parser for classroom search.
    Supports English, French, Arabic.
    Uses local Ollama model with deterministic fallback.
    """

    # Equipment keywords in multiple languages
    EQUIPMENT_KEYWORDS = {
        "projector": ["projector", "projecteur", "projecteur vidéo", "projecteur vidéo", "projector", "projecteur", "مشروع", "بروجيكتور"],
        "whiteboard": ["whiteboard", "tableau blanc", "tableau", "board", "لوحة بيضاء", "سبورة"],
        "computer": ["computer", "ordinateur", "pc", "pc portable", "laptop", "حاسوب", "كمبيوتر"],
        "audio": ["audio", "son", "sound", "microphone", "mic", "micro", "صوت", "ميكروفون"],
        "video_conference": ["video conference", "visioconférence", "video call", "conférence vidéo", "visioconf", "مؤتمر فيديو", "فيديو كونفرنس"],
        "ac": ["ac", "air conditioning", "climatisation", "air conditionné", "تكييف", "مكيف"],
    }

    ROOM_TYPES = {
        "lecture": ["lecture", "amphi", "amphitheatre", "amphitheater", "grand amphithéâtre", "قاعة محاضرات", "مدرج"],
        "classroom": ["classroom", "salle de classe", "class", "classe", "salle", "قاعة", "فصل"],
        "lab": ["lab", "laboratory", "laboratoire", "tp", "travaux pratiques", "مختبر", "معمل"],
    }

    def __init__(self, ollama_provider: Optional[OllamaProvider] = None):
        self.llm = ollama_provider

    def _build_prompt(self, text: str, today: date) -> str:
        return f"""You are an expert at extracting classroom search criteria from natural language requests in English, French, and Arabic.

Today is {today.isoformat()}.

Extract the following fields from the user's request. Return ONLY a JSON object with these exact keys:
- date: ISO date string (YYYY-MM-DD) or null
- start_time: HH:MM 24-hour format or null
- end_time: HH:MM 24-hour format or null
- student_count: integer or null
- required_equipment: array of strings (standardized: projector, whiteboard, computer, audio, video_conference, ac) or empty array
- room_type: one of "lecture", "classroom", "lab" or null
- preferences: array of strings or empty array

Rules:
- Resolve relative dates: "tomorrow" = {today + timedelta(days=1)}, "next week" = week starting {today + timedelta(days=(7-today.weekday()))}
- If a time range is given like "10 to 12", split into start_time and end_time
- Equipment names must match the standardized list exactly
- If information is missing or ambiguous, use null
- Output ONLY the JSON, no extra text, no code blocks, no markdown formatting
- Do not wrap the JSON in triple backticks or any formatting
- Do not include any additional text or explanation, only the raw JSON object

Examples:
Input: "Find a room tomorrow from 10 to 12 for 35 students with a projector."
Output: {{"date": "{(today + timedelta(days=1)).isoformat()}", "start_time": "10:00", "end_time": "12:00", "student_count": 35, "required_equipment": ["projector"], "room_type": null, "preferences": []}}

Input: "Je cherche une salle demain de 14h à 16h pour 20 étudiants avec un tableau blanc."
Output: {{"date": "{(today + timedelta(days=1)).isoformat()}", "start_time": "14:00", "end_time": "16:00", "student_count": 20, "required_equipment": ["whiteboard"], "room_type": null, "preferences": []}}

Input: "أحتاج قاعة بعد غد من 10 إلى 12 لـ 30 طالب مع جهاز عرض."
Output: {{"date": "{(today + timedelta(days=2)).isoformat()}", "start_time": "10:00", "end_time": "12:00", "student_count": 30, "required_equipment": ["projector"], "room_type": null, "preferences": []}}

Now extract from:
Input: {json.dumps(text, ensure_ascii=False)}
Output:"""

    def _parse_with_llm(self, text: str, today: date) -> Optional[SearchCriteria]:
        """Parse using local LLM."""
        if not self.llm or not self.llm.is_healthy():
            return None

        prompt = self._build_prompt(text, today)
        response = self.llm.generate(prompt, temperature=0.1, max_tokens=200)

        data = self._extract_json(response)
        if data is None:
            return None

        return SearchCriteria(
            session_date=self._safe_date(data.get("date")),
            start_time=self._safe_time(data.get("start_time")),
            end_time=self._safe_time(data.get("end_time")),
            student_count=self._safe_int(data.get("student_count")),
            required_equipment=data.get("required_equipment") or [],
            room_type=data.get("room_type"),
            preferences=data.get("preferences") or [],
            raw_text=text,
        )

    @staticmethod
    def _safe_date(value) -> Optional[date]:
        if not value:
            return None
        try:
            return date.fromisoformat(str(value).strip()[:10])
        except ValueError:
            return None

    @staticmethod
    def _safe_time(value) -> Optional[time]:
        if not value:
            return None
        try:
            return time.fromisoformat(str(value).strip())
        except ValueError:
            return None

    @staticmethod
    def _safe_int(value) -> Optional[int]:
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from LLM response, handling code fences and surrounding text."""
        if not text:
            return None

        # Try to find JSON in code fences
        import re
        code_fence_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if code_fence_match:
            try:
                res = json.loads(code_fence_match.group(1))
                if isinstance(res, dict):
                    return res
            except json.JSONDecodeError:
                pass

        # Try to find bare JSON object
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                res = json.loads(json_match.group(0))
                if isinstance(res, dict):
                    return res
            except json.JSONDecodeError:
                pass

        # Last resort: try parsing entire response as JSON
        try:
            res = json.loads(text.strip())
            if isinstance(res, dict):
                return res
        except json.JSONDecodeError:
            pass
        return None

    def _parse_deterministic(self, text: str, today: date) -> SearchCriteria:
        """Deterministic regex-based fallback parser (multilingual)."""
        text_lower = text.lower()
        criteria = SearchCriteria(raw_text=text)

        # Extract student count (numbers near students/étudiants/طالب)
        student_patterns = [
            r'(?:for|pour|pour\s+|لـ|ل)\s*(\d+)\s*(?:students?|étudiants?|étudiant|طالب|طلاب)',
            r'(\d+)\s*(?:students?|étudiants?|étudiant|طالب|طلاب)',
        ]
        for pattern in student_patterns:
            match = re.search(pattern, text_lower)
            if match:
                criteria.student_count = int(match.group(1))
                break

        # Extract time range
        time_patterns = [
            r'(?:from|de|من)\s*(\d{1,2})[:h]?\s*(?:to|à|إلى|-)\s*(\d{1,2})[:h]?',
            r'(\d{1,2})[:h]\s*(?:to|à|إلى|-)\s*(\d{1,2})[:h]',
        ]
        for pattern in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                start_h = int(match.group(1))
                end_h = int(match.group(2))
                criteria.start_time = time(start_h, 0)
                criteria.end_time = time(end_h, 0)
                break

        # Extract date
        if "tomorrow" in text_lower or "demain" in text_lower or "غداً" in text_lower or "غدا" in text_lower:
            criteria.session_date = today + timedelta(days=1)
        elif "after tomorrow" in text_lower or "après-demain" in text_lower or "بعد غد" in text_lower:
            criteria.session_date = today + timedelta(days=2)
        elif "today" in text_lower or "aujourd'hui" in text_lower or "اليوم" in text_lower:
            criteria.session_date = today
        else:
            # Try to extract ISO date or day name
            iso_date_match = re.search(r'\b(202\d-\d{2}-\d{2})\b', text_lower)
            if iso_date_match:
                criteria.session_date = date.fromisoformat(iso_date_match.group(1))
            else:
                # Extract day name like "Monday", "lundi", "الاثنين"
                day_names = {
                    "monday": 0, "mon": 0, "lunedi": 0, "lundi": 0, "monday": 0, "الاثنين": 0,
                    "tuesday": 1, "tue": 1, "mardi": 1, "mar": 1, "الثلاثاء": 1,
                    "wednesday": 2, "wed": 2, "mercredi": 2, "mer": 2, "الأربعاء": 2,
                    "thursday": 3, "thu": 3, "jeudi": 3, "jeu": 3, "الخميس": 3,
                    "friday": 4, "fri": 4, "vendredi": 4, "ven": 4, "الجمعة": 4,
                    "saturday": 5, "sat": 5, "samedi": 5, "sam": 5, "السبت": 5,
                    "sunday": 6, "sun": 6, "dimanche": 6, "dim": 6, "الأحد": 6,
                }
                day_found = None
                for day_key, day_num in day_names.items():
                    if day_key in text_lower:
                        day_found = day_num
                        break
                if day_found is not None:
                    days_ahead = (day_found - today.weekday()) % 7
                    # "next <day>" always means the following week
                    if "next" in text_lower or "prochain" in text_lower or "prochaine" in text_lower or "القادم" in text_lower:
                        if days_ahead == 0:
                            days_ahead = 7
                    criteria.session_date = today + timedelta(days=days_ahead)
                elif "next week" in text_lower or "semaine prochaine" in text_lower:
                    criteria.session_date = today + timedelta(days=(7 - today.weekday()))

        # Extract equipment
        equipment_found = []
        for std_name, keywords in self.EQUIPMENT_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    equipment_found.append(std_name)
                    break
        criteria.required_equipment = equipment_found

        # Extract room type
        for std_type, keywords in self.ROOM_TYPES.items():
            for kw in keywords:
                if kw in text_lower:
                    criteria.room_type = std_type
                    break
            if criteria.room_type:
                break

        return criteria

    def parse(self, text: str, today: Optional[date] = None) -> SearchCriteria:
        """
        Parse natural language text into structured search criteria.
        Tries LLM first, and fills in any missing fields with deterministic parser.
        """
        if today is None:
            today = date.today()

        llm_result = None
        # Try LLM first
        if self.llm and self.llm.is_healthy():
            llm_result = self._parse_with_llm(text, today)

        # Also run deterministic parser as baseline/fallback
        det_result = self._parse_deterministic(text, today)

        if not llm_result:
            return det_result

        # Blend: use LLM results, but fill in missing fields with deterministic extraction
        return SearchCriteria(
            session_date=llm_result.session_date or det_result.session_date,
            start_time=llm_result.start_time or det_result.start_time,
            end_time=llm_result.end_time or det_result.end_time,
            student_count=llm_result.student_count if llm_result.student_count is not None else det_result.student_count,
            required_equipment=list(set((llm_result.required_equipment or []) + (det_result.required_equipment or []))),
            room_type=llm_result.room_type or det_result.room_type,
            preferences=list(set((llm_result.preferences or []) + (det_result.preferences or []))),
            raw_text=text,
        )
=======
import datetime
import re
from collections.abc import Sequence
from dataclasses import dataclass

MAX_TEXT_LENGTH = 500  # contract D13; text is cut before any regex runs (rule S14b)
SLOTS = ("date", "start_time", "end_time", "student_count")

ARABIC_LETTER = re.compile("[\u0600-\u06ff]")
STUDENT_COUNT = re.compile(r"(\d{1,4})\s*(?:students|etudiants|étudiants|طلاب|طالب)")
PROJECTOR_WORDS = ("projector", "projecteur", "جهاز عرض")

TEXT_UNCLEAR = {
    "en": "I could not read a request in this text. Fill in the form below.",
    "fr": "Je n'ai pas pu lire de demande dans ce texte. Remplissez le formulaire ci-dessous.",
    "ar": "لم أتمكن من قراءة طلب في هذا النص. املأ النموذج أدناه.",
}


@dataclass(frozen=True)
class Criteria:
    date: str | None = None  # "YYYY-MM-DD"
    start_time: str | None = None  # "HH:MM"
    end_time: str | None = None
    student_count: int | None = None
    required_equipment: tuple[str, ...] = ()
    preferred_equipment: tuple[str, ...] = ()
    room_type: str | None = None
    preferred_building: str | None = None


@dataclass(frozen=True)
class Clarification:
    field: str  # date | start_time | end_time | student_count | equipment | text
    code: str  # see contract 6.4
    message: str  # in the request language


@dataclass(frozen=True)
class ParseResult:
    criteria: Criteria
    missing: tuple[str, ...]
    clarifications: tuple[Clarification, ...]
    language: str  # en | fr | ar
    engine: str  # "rules"


def find_student_count(text: str) -> int | None:
    hit = STUDENT_COUNT.search(text)
    if hit is None:
        return None
    count = int(hit.group(1))
    return count if 1 <= count <= 1000 else None


def find_equipment(text: str) -> tuple[str, ...]:
    if any(word in text for word in PROJECTOR_WORDS):
        return ("projector",)
    return ()


# Step 1 stub: only student count and projector work. today and known_buildings
# are accepted already so the signature never changes; they are used from Step 4.
def parse_request(
    text: str, today: datetime.date, known_buildings: Sequence[str] = ()
) -> ParseResult:
    if not isinstance(text, str):
        text = ""
    text = text[:MAX_TEXT_LENGTH].strip().lower()

    language = "ar" if ARABIC_LETTER.search(text) else "en"
    criteria = Criteria(
        student_count=find_student_count(text),
        required_equipment=find_equipment(text),
    )

    missing = tuple(slot for slot in SLOTS if getattr(criteria, slot) is None)
    clarifications = ()
    if not text:
        clarifications = (Clarification("text", "text_unclear", TEXT_UNCLEAR[language]),)

    return ParseResult(criteria, missing, clarifications, language, "rules")
>>>>>>> 61bfbd9e60e235fd6437d82e5264d78e6efb5b3f
