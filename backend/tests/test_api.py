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
    # 368,013 until 7 Oct; 10 SKUs now launch inside the window, so their
    # pre-launch days carry no sales.
    assert body["fact_rows"] == 357471


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


@pytest.mark.parametrize("months", PERIODS)
def test_region_mix_sums_to_the_headline_on_both_dimensions(months):
    total = get(f"/api/portfolio/kpis?months={months}")["net_sales"]
    rows = get(f"/api/regions/mix?months={months}")
    for dim in ("category", "channel"):
        parts = sum(r["net_sales"] for r in rows if r["dimension"] == dim)
        assert parts == pytest.approx(total, rel=1e-9), dim


def test_every_category_lists_its_top_accounts():
    rows = get("/api/customers/by-category?months=12&top=5")
    cats = {r["category_name"] for r in rows}
    assert len(cats) == 7
    for c in cats:
        ranks = sorted(r["category_rank"] for r in rows if r["category_name"] == c)
        assert ranks == [1, 2, 3, 4, 5]


def test_forecast_attainment_and_accuracy_are_distinct_measures():
    f = get("/api/forecast/accuracy?months=12")
    assert f["attainment_pct"] == pytest.approx(f["actual_units"] / f["forecast_units"])
    assert f["accuracy_pct"] == pytest.approx(1 - f["wape"])


def test_launch_summary_reconciles_with_the_launch_rows():
    rows = get("/api/launches")
    s = get("/api/launches/summary")
    pipe = [r for r in rows if r["sku_id"] is None]
    assert s["pipeline_launches"] == len(pipe)
    at_risk = [r for r in pipe if r["gates_overdue"] > 0]
    assert s["at_risk_launches"] == len(at_risk)
    assert s["revenue_at_risk_usd"] == pytest.approx(sum(r["expected_year1_revenue_usd"] for r in at_risk))
    gates = get("/api/launches/gates")
    assert len(gates) == 6 * len(rows)
    assert all(g["reviewer_role"] for g in gates)


@pytest.mark.parametrize("months", PERIODS)
def test_signals_include_every_alert_and_carry_a_region(months):
    alerts = {a["alert_id"] for a in get(f"/api/alerts?months={months}")}
    sigs = get(f"/api/signals?months={months}")
    assert alerts <= {s["signal_id"] for s in sigs}
    regions = {r["region"] for r in get("/api/regions/fulfillment?months=12")}
    assert all(s["region"] in regions for s in sigs)
    assert all(s["impact_usd"] is None or s["impact_usd"] >= 0 for s in sigs)


def test_category_trend_sums_to_monthly_portfolio_trend():
    rows = get("/api/categories/trend?months=12&grain=month")
    by_month = {}
    for r in rows:
        by_month[r["period_start"]] = by_month.get(r["period_start"], 0) + r["net_sales"]
    trend = {p["month_start"]: p["net_sales"] for p in get("/api/portfolio/trend?months=12")}
    for m, v in by_month.items():
        assert v == pytest.approx(trend[m], rel=1e-6), m


def test_assortment_summary_matches_its_sources():
    s = get("/api/assortment/summary?months=12")
    skus = get("/api/skus?months=12")
    assert s["active_skus"] == len(skus)
    assert s["long_tail_skus"] == sum(1 for k in skus if k["revenue_share_pct"] < 0.01)
    assert s["max_density"] == max(r["skus_selling"] for r in get("/api/assortment?months=12"))
    assert s["listed_never_sold"] == sum(r["listed_never_sold"] for r in get("/api/listings/gaps"))


@pytest.mark.parametrize("months", PERIODS)
def test_rationale_rules_hold_for_every_flagged_sku(months):
    rows = get(f"/api/skus/rationale?months={months}")
    eol = {n for n in (r["sku_id"] for r in rows if r["eol_notice_type"])}
    for r in rows:
        if r["sku_id"] in eol:
            assert r["factor"] == "Supplier Discontinuation"
        if r["factor"] == "Declining Sales":
            assert r["growth_pct"] < 0
        if r["factor"] == "Low Profitability":
            assert r["gross_margin_pct"] < r["portfolio_margin_pct"] - 0.08
        if r["factor"] == "Strong Brand Growth":
            assert r["growth_pct"] >= 0.12
        assert r["action"] in {"Discontinue / Consolidate", "Reposition",
                               "Reformulate / Redesign", "Invest / Expand"}
    assert len({r["sku_id"] for r in rows}) == len(rows)
