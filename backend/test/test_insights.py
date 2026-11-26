from app.services.insight_generator import Insight, generate_insights, is_grounded

METRICS = {
    "by_building": [
        {"building": "Block A", "utilization_rate": 0.714},
        {"building": "Block 2", "utilization_rate": 0.31},
    ]
}


def test_top_building_insight_uses_the_highest_rate():
    insights = generate_insights(METRICS)
    assert [i.id for i in insights] == ["top_building_utilization"]
    assert "71.4%" in insights[0].text
    assert "Block A" in insights[0].text


def test_generated_insights_are_grounded_in_every_language():
    for lang in ("en", "fr", "ar"):
        assert all(is_grounded(i) for i in generate_insights(METRICS, lang))


def test_digit_inside_a_building_name_is_still_grounded():
    metrics = {"by_building": [{"building": "Block 2", "utilization_rate": 0.5}]}
    assert all(is_grounded(i) for i in generate_insights(metrics))


def test_a_number_missing_from_the_evidence_is_not_grounded():
    made_up = Insight("x", "observation", "Utilization reached 99.0%.", ())
    assert not is_grounded(made_up)


def test_empty_or_broken_metrics_give_not_enough_data():
    for metrics in ({}, {"by_building": []}, {"by_building": "oops"}, None):
        insights = generate_insights(metrics)
        assert [i.id for i in insights] == ["not_enough_data"]
