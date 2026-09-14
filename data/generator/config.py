"""
Generation targets, dimensions and tuning parameters.

Every figure here traces to either src/constants/data.ts or the source column
reference. Nothing is invented at this layer - see documentation/
dataset_generation_plan.md for the provenance of each target.
"""

from __future__ import annotations

from pathlib import Path

# ── Determinism ─────────────────────────────────────────────────────────────
# Fixed seed: figures must be stable across regenerations, or every run churns
# the UI constants that get replaced downstream.
SEED = 20260909

# ── Paths ───────────────────────────────────────────────────────────────────
GEN_DIR = Path(__file__).resolve().parent
REPO = GEN_DIR.parents[1]
OUT_DIR = REPO / "data" / "output"
SKU_SEED = GEN_DIR / "sku_seed.json"

# ── Calendar ────────────────────────────────────────────────────────────────
START_DATE = "2024-01-01"
END_DATE = "2025-12-31"
BASE_YEAR = 2024      # prior year
REPORT_YEAR = 2025    # the headline year; $473M is an ANNUAL figure

# ── Headline targets ────────────────────────────────────────────────────────
ANNUAL_NET_SALES = 473_000_000.0   # REPORT_YEAR total, USD
YOY_GROWTH = 0.083                 # 2024 -> 2025
AVG_GROSS_MARGIN = 0.3853

# 2024 is back-derived so the two years reconcile to the stated growth.
# $473M is an ANNUAL figure (COMPANY_CONTEXT: "$473M Annual"), so the dataset
# spans roughly twice that across its two years.
BASE_YEAR_NET_SALES = ANNUAL_NET_SALES / (1.0 + YOY_GROWTH)
TOTAL_NET_SALES = ANNUAL_NET_SALES + BASE_YEAR_NET_SALES

# ── Revenue concentration (cumulative share at each percentile) ─────────────
PARETO_ANCHORS = {0.00: 0.0, 0.10: 0.2781, 0.20: 0.4851, 0.30: 0.6288, 1.00: 1.0}

# ── Countries ───────────────────────────────────────────────────────────────
# listed_skus scaled from the documented 102-SKU portfolio to 119.
COUNTRIES = [
    # id, name,          region,            complexity, listed, rev_share
    (1, "Italy",         "Southern Europe", "High",     119, 0.2900),
    (2, "Spain",         "Southern Europe", "High",     119, 0.2260),
    (3, "Germany",       "Western Europe",  "High",     114, 0.1870),
    (4, "Austria",       "Central Europe",  "Medium",    93, 0.0910),
    (5, "France",        "Western Europe",  "Medium",    93, 0.0900),
    (6, "Poland",        "Central Europe",  "Medium",    93, 0.0900),
    (7, "Netherlands",   "Western Europe",  "Opt",       52, 0.0260),
]

# ── Channels ────────────────────────────────────────────────────────────────
# stockout_share from CHANNEL_DATA: 7907 / 7818 / 15907 / 1482 of 33,114.
CHANNELS = [
    # id, name,          rev_share, stockout_share
    (1, "E-commerce",    0.25, 0.2388),
    (2, "Supermarket",   0.30, 0.2361),
    (3, "Hypermarket",   0.35, 0.4804),
    (4, "Convenience",   0.10, 0.0448),
]

# ── Categories ──────────────────────────────────────────────────────────────
# Seasonality drives the demand model. Snacks carries the chocolate variants the
# source names as the most seasonal SKUs in the portfolio.
CATEGORIES = [
    (1, "Beverages",     "summer_peak"),
    (2, "Snacks",        "winter_peak"),
    (3, "Personal Care", "flat"),
    (4, "Dairy",         "flat"),
    (5, "Household",     "flat"),
    (6, "Beauty",        "q4_peak"),
    (7, "Fashion",       "q4_peak"),
]

# Amplitudes tuned so the resulting volatility split lands on the documented
# ~78% Stable / 22% Variable. Measured, not assumed: at the original values
# (0.25/0.30/0.08/0.20) only 65.5% of SKUs came out Stable.
SEASONALITY_AMPLITUDE = {
    "winter_peak": 0.200,
    "summer_peak": 0.240,
    "flat": 0.064,
    "q4_peak": 0.160,
}

# Peak month per profile (1-12).
SEASONALITY_PEAK_MONTH = {
    "winter_peak": 12,
    "summer_peak": 7,
    "flat": 6,
    "q4_peak": 11,
}

# ── Brands ──────────────────────────────────────────────────────────────────
BRANDS = [
    (1, "BrandA", "Cash Cow"),
    (2, "BrandB", "Strategic"),
    (3, "BrandC", "Strategic"),
    (4, "BrandD", "Energizer"),
    (5, "BrandE", "Flanker"),
    (6, "BrandF", "Silver Bullet"),
]

# ── Suppliers ───────────────────────────────────────────────────────────────
SUPPLIER_COUNT = 60   # S001..S060, all covering all SKUs

# ── Supply chain targets ────────────────────────────────────────────────────
TOTAL_STOCKOUTS = 33_114
PEAK_SKU_STOCKOUTS = 440
PEAK_STOCKOUT_SKU_COUNT = 2      # two SKUs tie at the peak

# ── Promotion targets ───────────────────────────────────────────────────────
PROMO_INTENSITIES = [0.0, 0.2, 0.5, 1.0]
PORTFOLIO_PROMO_DEPENDENCY = 0.11    # PCI sub-driver value
MAX_PROMO_DEPENDENCY = 0.2797        # most promo-dependent SKU
PROMO_DISCOUNT_RANGE = (0.10, 0.30)
PROMO_LIFT_RANGE = (1.3, 2.5)
# Promo days draw an intensity of 0.2/0.5/1.0 with weights .45/.35/.20, so the
# realised discount is disc x 0.465, not the full disc. The day-fraction solver
# must use this or every SKU overshoots its dependency target.
MEAN_PROMO_INTENSITY = 0.45*0.2 + 0.35*0.5 + 0.20*1.0
# Residual correction for per-SKU variation in the intensity draw, which leaves
# the peak SKU ~1.8% above its analytic target. Measured, not guessed.
PROMO_DEP_CALIBRATION = 0.982

# ── Volatility targets ──────────────────────────────────────────────────────
# Source thresholds. No SKU exceeded 0.5 in the original analysis.
CV_STABLE_MAX = 0.20
CV_VARIABLE_MAX = 0.50
TARGET_STABLE_SHARE = 0.78
AVG_PORTFOLIO_CV = 0.1071

# ── Segmentation ────────────────────────────────────────────────────────────
# 34/16/16/34, not an even split: value and complexity are negatively
# correlated, producing a heavy Keep-Rationalize diagonal.
VALUE_COMPLEXITY_CORRELATION = -0.45
# Blend weight pulling lead time and promo dependence toward the revenue tail.
# Set to 0 after measurement: the seed data already carries a -0.76 value/
# complexity correlation (its own val/cx fields correlate at -0.763), so no
# artificial bias is needed or wanted. Raising it only deepens the diagonal.
COMPLEXITY_REVENUE_BIAS = 0.0
SEGMENT_TARGETS = {"Keep": 0.34, "Grow": 0.16, "Consolidate": 0.16, "Rationalize": 0.34}

# ── Portfolio Complexity Index ──────────────────────────────────────────────
PCI_TARGET = 0.5509
PCI_BENCHMARK = 0.4200
# Baselines restated from the source's 100 SKUs / 50 suppliers to 119 / 60.
PCI_SKU_BASELINE = 119
PCI_SUPPLIER_BASELINE = 60
PCI_SUBDRIVER_TARGETS = {
    "supplier_fragmentation": 1.2000,
    "sku_proliferation": 1.0200,
    "low_velocity_pct": 0.6667,
    "lead_time_instability": 0.2014,
    "promo_dependency_score": 0.1100,
    "avg_volatility_cv": 0.1071,
}

# ── Inventory assumptions ───────────────────────────────────────────────────
CARRYING_COST_RATE = 0.20   # 20% of safety stock proxy - industry rule of thumb

# ── Rationalization scenarios ───────────────────────────────────────────────
RATIONALIZATION_SCENARIOS = [
    # id, label,              cohort_pct, safety_stock_freed
    (1, "Bottom 10%",         0.10, 0.088),
    (2, "Bottom 20%",         0.20, 0.223),
    (3, "Bottom 30%",         0.30, 0.296),
    (4, "Full Rationalize",   None, 0.422),   # all Rationalize-segment SKUs
]

# ── Transaction volume ──────────────────────────────────────────────────────
TARGET_FACT_ROWS = 368_000
ACTIVITY_MIN = 0.03    # least-active combo trades on 3% of days
ACTIVITY_MAX = 0.95

# ── Validation tolerances ───────────────────────────────────────────────────
TOL = {
    "total_net_sales": 0.005,        # +/- 0.5%
    "avg_gross_margin": 0.001,       # +/- 0.1pp
    "country_share": 0.01,           # +/- 1pp each
    "yoy_growth": 0.003,             # +/- 0.3pp
    "concentration": 0.01,           # +/- 1pp
    "total_stockouts": 0.02,         # +/- 2%
    "hypermarket_stockout_share": 0.02,
    "peak_stockouts": 10,            # +/- 10 events
    "pci": 0.02,
    "segment_share": 0.05,           # +/- 5pp (see note in validate.py)
    "max_promo_dependency": 0.006,
}
