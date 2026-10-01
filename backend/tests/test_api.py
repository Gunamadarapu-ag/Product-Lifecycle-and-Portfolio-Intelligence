"""
Integration tests: run against the real PostgreSQL warehouse (needs .env and a
loaded database). From the repo root:

    python -m pytest backend/tests -q
"""
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)
PERIODS = [1, 3, 6, 12, 24, 36]


def get(path):
    r = client.get(path)
    assert r.status_code == 200, r.text
    return r.json()


def test_health_reports_loaded_database():
    body = get("/api/health")
    assert body["database"] == "connected"
    assert body["fact_rows"] == 368013


def test_12_month_kpis_match_validated_targets():
    k = get("/api/portfolio/kpis?months=12")
    assert k["net_sales"] == pytest.approx(473_000_000, rel=0.005)
    assert k["gross_margin_pct"] == pytest.approx(0.3853, abs=0.001)
    assert k["growth_pct"] == pytest.approx(0.083, abs=0.003)
    assert k["active_skus"] == 119


@pytest.mark.parametrize("months", PERIODS)
def test_every_breakdown_sums_to_the_headline(months):
    total = get(f"/api/portfolio/kpis?months={months}")["net_sales"]
    for path in ("/api/skus", "/api/regions", "/api/channels", "/api/portfolio/trend"):
        parts = sum(r["net_sales"] for r in get(f"{path}?months={months}"))
        assert parts == pytest.approx(total, rel=1e-9), path


def test_summary_is_consistent_with_its_parts():
    s = get("/api/portfolio/summary?months=12")
    assert s["kpis"] == get("/api/portfolio/kpis?months=12")
    assert s["concentration"] == get("/api/portfolio/concentration?months=12")


def test_growth_is_null_not_invented_without_a_prior_window():
    assert get("/api/portfolio/kpis?months=24")["growth_pct"] is None


def test_36_months_reports_the_24_actually_available():
    k = get("/api/portfolio/kpis?months=36")
    assert k["months_requested"] == 36
    assert k["months_available"] == 24


def test_invalid_period_is_rejected():
    assert client.get("/api/portfolio/kpis?months=7").status_code == 422


def test_fulfillment_covers_the_real_seven_countries_in_three_regions():
    rows = get("/api/regions/fulfillment?months=12")
    assert len(rows) == 7
    assert {r["region"] for r in rows} == {"Southern Europe", "Western Europe", "Central Europe"}
    for r in rows:
        assert 0 <= r["fulfillment_pct"] <= 1


def test_fulfillment_stockouts_sum_to_the_kpi_total():
    total = get("/api/portfolio/kpis?months=12")["stockout_events"]
    parts = sum(r["stockout_events"] for r in get("/api/regions/fulfillment?months=12"))
    assert parts == total
