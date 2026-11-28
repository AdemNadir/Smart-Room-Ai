from typing import Dict, Any, List, Optional
from .ollama_provider import OllamaProvider


class InsightGenerator:
    """
    AI-generated administrative insights grounded in verified metrics.
    Every statement must cite computed facts.
    """

    def __init__(self, ollama_provider: Optional[OllamaProvider] = None):
        self.llm = ollama_provider

    def _build_grounded_facts(self, metrics: Dict[str, Any]) -> List[str]:
        """Convert metrics into verified facts the AI can reference."""
        facts = []
        facts.append(f"Total active rooms: {metrics['total_rooms']}")

        building_hours = metrics.get("building_hours", {})
        if building_hours:
            max_building = max(building_hours, key=building_hours.get)
            max_hours = building_hours[max_building]
            facts.append(f"Building {max_building} has the highest scheduled hours: {max_hours:.1f}h")

        booking_counts = metrics.get("booking_status_counts", {})
        facts.append(f"Confirmed bookings: {booking_counts.get('confirmed', 0)}")
        facts.append(f"Pending bookings: {booking_counts.get('pending', 0)}")
        facts.append(f"Cancelled bookings: {booking_counts.get('cancelled', 0)}")

        most_requested = metrics.get("most_requested_rooms", [])
        for rid, hours in most_requested[:3]:
            facts.append(f"Room {rid} had {hours:.1f}h of extra session hours")

        return facts

    def _generate_llm_insight(self, metrics: Dict[str, Any]) -> Optional[str]:
        if not self.llm or not self.llm.is_healthy():
            return None

        facts = self._build_grounded_facts(metrics)
        prompt = f"""You are an administrative analyst for a university room management system.
You MUST only use the verified facts provided below. Do not invent any numbers.

Verified facts:
{chr(10).join(facts)}

Write a concise summary (3-4 sentences) highlighting key findings and suggesting cautious actions.
Use phrases like "Consider" and "May benefit from" for recommendations.

Summary:"""

        response = self.llm.generate(prompt, temperature=0.3, max_tokens=300)
        if response and not response.startswith("[Error"):
            return response
        return None

    def _generate_template_insight(self, metrics: Dict[str, Any]) -> str:
        """Deterministic template-based fallback."""
        building_hours = metrics.get("building_hours", {})
        top_building = max(building_hours, key=building_hours.get) if building_hours else "N/A"
        top_building_hours = building_hours.get(top_building, 0)
        sentences = [
            "Administrative Summary:",
            f"Out of {metrics['total_rooms']} active rooms, {top_building_hours:.1f} hours were scheduled in {top_building}.",
            f"Current bookings: {metrics.get('booking_status_counts', {}).get('confirmed', 0)} confirmed, "
            f"{metrics.get('booking_status_counts', {}).get('pending', 0)} pending, "
            f"{metrics.get('booking_status_counts', {}).get('cancelled', 0)} cancelled.",
        ]
        most_requested = metrics.get("most_requested_rooms", [])
        if most_requested:
            rid, hrs = most_requested[0]
            sentences.append(f"Most requested room: {rid} with {hrs:.1f} hours.")
        sentences.append("Recommendation: Consider utilizing under-booked rooms for additional sessions.")
        return " ".join(sentences)

    def generate_insights(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from verified metrics. Grounded, not fabricated."""
        llm_summary = self._generate_llm_insight(metrics)
        template_summary = self._generate_template_insight(metrics)

        return {
            "metrics": metrics,
            "facts": self._build_grounded_facts(metrics),
            "summary_llm": llm_summary,
            "summary_template": template_summary,
            "method": "grounded_ai_with_template_fallback" if llm_summary else "template_only",
            "grounded": True,
        }