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
