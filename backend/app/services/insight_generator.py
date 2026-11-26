import re
from dataclasses import dataclass

NUMBER = re.compile(r"\d+(?:[.,]\d+)?")
# Arabic-Indic and Persian digits, so a number written either way is compared the same
NON_ASCII_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "0123456789" * 2)

TEXT = {
    "en": {
        "top_building_utilization": "{building} has the highest utilization of the period: {rate}.",
        "not_enough_data": "There is not enough data in this period to write insights.",
    },
    "fr": {
        "top_building_utilization": (
            "{building} est le bâtiment le plus utilisé de la période : {rate}."
        ),
        "not_enough_data": "Il n'y a pas assez de données sur cette période pour des constats.",
    },
    "ar": {
        "top_building_utilization": "{building} هو المبنى الأكثر استخداما خلال الفترة: {rate}.",
        "not_enough_data": "لا توجد بيانات كافية في هذه الفترة لكتابة ملاحظات.",
    },
}


@dataclass(frozen=True)
class Evidence:
    metric: str
    label: str
    value: float | int | str
    display: str


@dataclass(frozen=True)
class Insight:
    id: str
    kind: str  # observation | suggestion
    text: str
    evidence: tuple[Evidence, ...]


def numbers_in(text: str) -> set[str]:
    return {n.replace(",", ".") for n in NUMBER.findall(text.translate(NON_ASCII_DIGITS))}


def is_grounded(insight: Insight) -> bool:
    allowed: set[str] = set()
    for item in insight.evidence:
        allowed |= numbers_in(item.display)
    return numbers_in(insight.text) <= allowed


def top_building(metrics: dict) -> tuple[str, float] | None:
    rows = metrics.get("by_building") if isinstance(metrics, dict) else None
    best = None
    for row in rows if isinstance(rows, list) else []:
        if not isinstance(row, dict):
            continue
        name, rate = row.get("building"), row.get("utilization_rate")
        if not isinstance(name, str) or isinstance(rate, bool):
            continue
        if not isinstance(rate, (int, float)):
            continue
        if best is None or rate > best[1]:
            best = (name, rate)
    return best


# Step 1 stub: one rule only. The full rule list arrives in Step 7.
def generate_insights(metrics: dict, lang: str = "en") -> list[Insight]:
    texts = TEXT.get(lang, TEXT["en"])
    best = top_building(metrics)
    if best is None:
        return [Insight("not_enough_data", "observation", texts["not_enough_data"], ())]

    name, rate = best
    shown = f"{round(rate * 100, 1):.1f}%"
    # The building name is evidence too, so a digit inside it ("Block 2") stays grounded.
    evidence = (
        Evidence(f"by_building[{name}].building", "Building", name, name),
        Evidence(f"by_building[{name}].utilization_rate", f"{name} utilization", rate, shown),
    )
    text = texts["top_building_utilization"].format(building=name, rate=shown)
    return [Insight("top_building_utilization", "observation", text, evidence)]
