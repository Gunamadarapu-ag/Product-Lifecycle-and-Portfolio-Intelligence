"""
FastAPI read API — the link between the PostgreSQL warehouse and the dashboard.

Run from the repo root:
    python -m uvicorn backend.app.main:app --port 8000

Every endpoint is a thin wrapper over one SQL function in
data/schema/03_derive_metrics.sql. No figure is computed here, so the API can
never disagree with the database. `months` is the dashboard's timeline
selector: 1, 3, 6, 12, 24 or 36 trailing months.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db import DatabaseUnavailable, close_pool, query

ALLOWED_MONTHS = (1, 3, 6, 12, 24, 36)


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    close_pool()


app = FastAPI(
    title="Product Lifecycle & Portfolio Intelligence API",
    version="0.1.0",
    lifespan=lifespan,
)

# The Vite dev/preview servers proxy /api, so browsers normally never need CORS.
# Allowed anyway for direct calls from the local dev origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:4173", "http://127.0.0.1:4173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.exception_handler(DatabaseUnavailable)
async def _db_down(_, exc: DatabaseUnavailable):
    return JSONResponse(status_code=503, content={"detail": f"Database unavailable: {exc}"})


def _months(months: int) -> int:
    if months not in ALLOWED_MONTHS:
        raise HTTPException(status_code=422,
                            detail=f"months must be one of {list(ALLOWED_MONTHS)}")
    return months


@app.get("/api/health")
def health():
    row = query("SELECT count(*) AS fact_rows, max(date_key) AS data_through FROM fact_sales")[0]
    return {"status": "ok", "database": "connected", **row}


@app.get("/api/metrics/registry")
def registry():
    return query("SELECT * FROM metric_registry ORDER BY metric_key")


@app.get("/api/portfolio/kpis")
def portfolio_kpis(months: int = Query(12)):
    return query("SELECT * FROM fn_portfolio_kpis(%s)", (_months(months),))[0]


@app.get("/api/portfolio/concentration")
def concentration(months: int = Query(12)):
    return query("SELECT * FROM fn_concentration(%s)", (_months(months),))[0]


@app.get("/api/portfolio/summary")
def summary(months: int = Query(12)):
    """KPIs and concentration in one call — what the dashboard's KPI strip needs."""
    m = _months(months)
    return {
        "kpis": query("SELECT * FROM fn_portfolio_kpis(%s)", (m,))[0],
        "concentration": query("SELECT * FROM fn_concentration(%s)", (m,))[0],
    }


@app.get("/api/portfolio/trend")
def trend(months: int = Query(12)):
    return query("SELECT * FROM fn_monthly_trend(%s)", (_months(months),))


@app.get("/api/skus")
def skus(months: int = Query(12)):
    return query("SELECT * FROM fn_sku_performance(%s)", (_months(months),))


@app.get("/api/regions")
def regions(months: int = Query(12)):
    return query("SELECT * FROM fn_regional_performance(%s)", (_months(months),))


@app.get("/api/regions/fulfillment")
def regions_fulfillment(months: int = Query(12)):
    """Per-country fulfillment ("OTIF") — see fn_regional_fulfillment for what
    this is and isn't: a real stockout-derived rate, not a literal OTIF."""
    return query("SELECT * FROM fn_regional_fulfillment(%s)", (_months(months),))


@app.get("/api/channels")
def channels(months: int = Query(12)):
    return query("SELECT * FROM fn_channel_performance(%s)", (_months(months),))


# ── 7 Oct additions: wiring the generated tables (TODO.md O18) ──────────────
# fn_sku_segments / fn_portfolio_snapshot / fn_cannibalization /
# fn_rationalization_scenarios are snapshot functions (no months parameter):
# see the comment above them in 03_derive_metrics.sql for why.

@app.get("/api/skus/segments")
def sku_segments():
    return query("SELECT * FROM fn_sku_segments()")


@app.get("/api/portfolio/snapshot")
def portfolio_snapshot():
    return query("SELECT * FROM fn_portfolio_snapshot()")[0]


@app.get("/api/skus/cannibalization")
def cannibalization():
    return query("SELECT * FROM fn_cannibalization()")


@app.get("/api/rationalization/scenarios")
def rationalization_scenarios():
    return query("SELECT * FROM fn_rationalization_scenarios()")


@app.get("/api/launches")
def launches():
    return query("SELECT * FROM fn_launches()")


@app.get("/api/launches/summary")
def launch_summary():
    return query("SELECT * FROM fn_launch_summary()")[0]


@app.get("/api/launches/gates")
def all_launch_gates():
    return query("SELECT * FROM fn_launch_gates(NULL)")


@app.get("/api/launches/{launch_id}/gates")
def launch_gates(launch_id: str):
    return query("SELECT * FROM fn_launch_gates(%s)", (launch_id,))


@app.get("/api/forecast/accuracy")
def forecast_accuracy(months: int = Query(12)):
    return query("SELECT * FROM fn_forecast_accuracy(%s)", (_months(months),))[0]


@app.get("/api/customers")
def customers(months: int = Query(12)):
    return query("SELECT * FROM fn_customer_insights(%s)", (_months(months),))


@app.get("/api/customers/by-category")
def customers_by_category(months: int = Query(12), top: int = Query(5, ge=1, le=100)):
    return query(
        "SELECT * FROM fn_customer_category_insights(%s) WHERE category_rank <= %s "
        "ORDER BY category_name, category_rank",
        (_months(months), top),
    )


@app.get("/api/regions/mix")
def region_mix(months: int = Query(12)):
    return query("SELECT * FROM fn_region_mix(%s)", (_months(months),))


@app.get("/api/categories/trend")
def category_trend(months: int = Query(12), grain: str = Query("month", pattern="^(week|month)$")):
    return query("SELECT * FROM fn_category_trend(%s, %s)", (_months(months), grain))


@app.get("/api/skus/rationale")
def sku_rationale(months: int = Query(12)):
    return query("SELECT * FROM fn_sku_rationale(%s)", (_months(months),))


@app.get("/api/signals")
def signals(months: int = Query(12)):
    return query("SELECT * FROM fn_signals(%s)", (_months(months),))


@app.get("/api/alerts")
def alerts(months: int = Query(12)):
    return query("SELECT * FROM fn_alerts(%s)", (_months(months),))


@app.get("/api/assortment/summary")
def assortment_summary(months: int = Query(12)):
    return query("SELECT * FROM fn_assortment_summary(%s)", (_months(months),))[0]


@app.get("/api/assortment")
def assortment(months: int = Query(12)):
    return query("SELECT * FROM fn_assortment(%s)", (_months(months),))


@app.get("/api/listings/gaps")
def listing_gaps():
    return query("SELECT * FROM fn_listing_gaps()")


@app.get("/api/regions/{region}/top-skus")
def region_top_skus(region: str, months: int = Query(12)):
    return query("SELECT * FROM fn_region_sku_shortlist(%s, %s)", (region, _months(months)))


@app.get("/api/profitability/pnl")
def pnl(months: int = Query(12)):
    return query("SELECT * FROM fn_pnl(%s)", (_months(months),))[0]


@app.get("/api/profitability/pnl-by-category")
def pnl_by_category(months: int = Query(12)):
    return query("SELECT * FROM fn_pnl_by_category(%s)", (_months(months),))
