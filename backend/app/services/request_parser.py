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
