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
# Cap on a SKU's stockout rate (stockout days ÷ sales days). Before 7 Oct
# stockouts were allocated as fixed counts per SKU regardless of how many days
# it sold, so 10 low-activity SKUs stocked out on 45-100% of their sales days
# (Fabric Softener: 378 of 378). Counts now scale with sales days, and no SKU
# exceeds this rate. Assumption: chronic FMCG out-of-stock rarely exceeds a
# third of selling days; the portfolio average stays ~9%.
STOCKOUT_MAX_RATE = 0.35

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
# Impacts are computed by derive.build_rationalization_scenarios. Until 7 Oct the
# safety-stock figures (8.8/22.3/29.6/42.2%) were typed here and every other
# impact column was written as zero.
RATIONALIZATION_SCENARIOS = [
    # id, label,              cohort_pct (lowest commercial value; None = Rationalize segment)
    (1, "Bottom 10%",         0.10),
    (2, "Bottom 20%",         0.20),
    (3, "Bottom 30%",         0.30),
    (4, "Full Rationalize",   None),
]

# ── Lifecycle (A1/A2, 7 Oct) ────────────────────────────────────────────────
# Before 7 Oct every SKU grew at exactly the portfolio rate (8.28-8.33%): the
# year split used one fraction for all combinations, so no SKU could ever read
# as Intro or Decline. Growth now comes from the seed's own per-SKU figure
# (sku_seed.json "growth", -22%..+32%, 23 negative), shifted so the portfolio
# still lands on YOY_GROWTH exactly.
#
# In-window launches: SKUs whose sales begin inside the dataset. Chosen from the
# highest seed growth outside the top revenue ranks (a new SKU is rarely a top
# seller) and outside the top stockout SKUs (their stockout targets need rows).
LAUNCHES_2024 = 4
LAUNCHES_2025 = 6
# Revenue rank must be worse than this. Measured, not guessed: launching from
# rank > 41 gave launches 6.2% of 2025 sales, which left established SKUs only
# ~+2% median growth to reach the portfolio's 8.3%. Deeper in the tail launches
# are ~2.5-3% of sales (a typical FMCG innovation share). Launches must also have
# positive seed growth, or seed decliners get relabelled as launches: rank > 95
# had only 3 such candidates, rank > 85 has 13 for the 10 launches needed.
LAUNCH_MIN_RANK = 85
LAUNCH_EXCLUDE_TOP_STOCKOUT = 10
LAUNCH_2024_MONTHS = (3, 10)      # launch month range, inclusive
LAUNCH_2025_MONTHS = (2, 9)
# Share of a full year's run-rate a SKU earns in its launch year, per month on
# shelf. Below 1 because launches ramp; see LAUNCH_RAMP_DAYS.
LAUNCH_YEAR_RUNRATE = 0.6
LAUNCH_RAMP_DAYS = 90             # units ramp from 40% to 100% of run-rate
# Launch years for SKUs that predate the dataset, by seed growth band - a
# declining SKU is usually an old one.
PRE_WINDOW_LAUNCH_YEARS = {"decline": (2012, 2018), "mature": (2015, 2021), "growth": (2019, 2023)}
GROWTH_BAND_MATURE = 0.10         # seed growth >= this counts as "growth"

# ── Pricing (A3, 7 Oct) ─────────────────────────────────────────────────────
# Country list-price index applied to base_price. Assumption, chosen so the
# Netherlands - documented as the LOWEST-margin market - comes out lowest; before
# this it came out highest (a known data defect in CLAUDE.md).
COUNTRY_PRICE_INDEX = {
    "Italy": 1.00, "Spain": 0.98, "Germany": 1.02, "Austria": 1.03,
    "France": 1.02, "Poland": 0.96, "Netherlands": 0.91,
}
# Unit-cost inflation by year (assumption). fact_sales.purchase_cost is cost as at
# the transaction, so 2025 rows carry the inflated cost. Without it, list-price
# increases against flat costs pushed 2025 margin to 39.45% - outside the 38.53%
# target that 04_validate.sql checks on the headline (12-month) window.
COST_INFLATION_BY_YEAR = {2024: 0.0, 2025: 0.025}
PRICE_INCREASE_PROB = 0.75        # chance a SKU x country takes an increase in a year
PRICE_INCREASE_RANGE = (0.01, 0.06)
PRICE_INCREASE_MONTHS = {2024: (3, 12), 2025: (1, 10)}
# Own-price elasticity by category (mean), jittered per SKU and clipped to
# ELASTICITY_RANGE. Staples are less elastic than impulse categories. Assumption,
# generation-only: validation re-estimates it from the data and reports both.
ELASTICITY_MEAN = {
    "Beverages": -1.8, "Snacks": -1.7, "Dairy": -1.0, "Household": -1.1,
    "Personal Care": -1.2, "Beauty": -1.3, "Fashion": -1.4,
}
ELASTICITY_JITTER = 0.35
ELASTICITY_RANGE = (-2.5, -0.8)

# ── Customers (B1, 7 Oct) ───────────────────────────────────────────────────
# Fictional retail accounts. Assumptions: a handful of accounts per country x
# channel with one dominant key account; the Netherlands, the smallest market,
# has one fewer per channel.
ACCOUNTS_PER_CHANNEL = {"Hypermarket": 3, "Supermarket": 3, "Convenience": 2, "E-commerce": 2}
CUSTOMER_SMALL_MARKETS = {"Netherlands"}
ACCOUNT_SHARE_ALPHA = [6.0, 3.0, 2.0]
ACCOUNT_FORMAT = {"Hypermarket": "Hyper", "Supermarket": "Market",
                  "Convenience": "Express", "E-commerce": "Online"}
ACCOUNT_SKU_AFFINITY_SD = 0.25    # lognormal sd: how far an account over/under-indexes on a SKU
ACCOUNT_MONTH_WOBBLE_SD = 0.06

# ── "Today" for status-as-of fields ────────────────────────────────────────
# The data ends here, so launch readiness, gate status, forecasts and supplier
# notices are all stated as of this date - not the wall clock.
AS_OF_DATE = "2025-12-31"

# ── Launch pipeline (B6, 7 Oct) ─────────────────────────────────────────────
# Stage gates with their weight in the readiness score and their due date in
# weeks before launch. Weights are an assumption (sum to 1).
LAUNCH_GATES = [
    # no, name,                weight, weeks_before_launch
    (1, "Concept",             0.10, 52),
    (2, "Business case",       0.15, 40),
    (3, "Development",         0.25, 26),
    (4, "Consumer testing",    0.15, 16),
    (5, "Launch readiness",    0.20, 6),
    (6, "Launch",              0.15, 0),
]
PIPELINE_LAUNCHES = 15                    # future products, planned in 2026
PIPELINE_LAUNCH_MONTHS = (2, 11)          # 2026
GATE_SLIP_WEEKS = (-1.0, 3.0)             # normal mean, sd of completion vs due
PIPELINE_AT_RISK_SHARE = 0.25             # share of pipeline items running late
LATE_GATE_SLIP_WEEKS = (4.0, 10.0)        # extra slip per gate from gate 2 on, for late items
LAUNCH_BUDGET_RANGE_USD = (300_000, 1_500_000)
# Launch targets (8 Oct, all labelled assumptions; stream "launch_targets" so
# adding them leaves every other table unchanged).
# Lead region: the region a launch is planned around. A launched SKU's lead
# region is derived (where its first-year sales were largest); a pipeline
# product's is drawn in proportion to its category's report-year sales by region.
# Expected year-1 revenue: the plan figure set before launch. Pipeline: the
# category's median annualised first-year sales among launched SKUs (all
# launched SKUs if the category has none) x a draw from this range. Launched:
# the SKU's own annualised first-year sales / a draw from LAUNCH_PLAN_ERROR, so
# plan vs actual has a realistic miss in both directions.
PIPELINE_YEAR1_FACTOR = (0.7, 1.3)
LAUNCH_PLAN_ERROR = (0.8, 1.25)           # actual / plan
# Who signs off each gate - a role, not a named person (none exist in the data).
GATE_REVIEWER_ROLES = {
    "Concept": "Innovation Lead",
    "Business case": "Finance Business Partner",
    "Development": "R&D Lead",
    "Consumer testing": "Consumer Insights Lead",
    "Launch readiness": "Supply Chain Lead",
    "Launch": "Sales Director",
}
# Product descriptors per category for pipeline names (fictional products).
PIPELINE_PRODUCTS = {
    "Beverages": ["Sparkling Citrus 330ml", "Cold Brew Oat 250ml", "Electrolyte Water 500ml"],
    "Snacks": ["Baked Lentil Crisps", "Protein Bar Cocoa", "Seeded Crackers"],
    "Dairy": ["Skyr Vanilla 450g", "Lactose-Free Milk 1L", "Kefir Berry 500ml"],
    "Household": ["Refill Laundry Pods", "Plant-Based Surface Spray", "Compact Dish Tabs"],
    "Personal Care": ["Solid Shampoo Bar", "Sensitive Body Wash", "Mineral Deodorant"],
    "Beauty": ["Vitamin C Serum", "Tinted SPF 30", "Hydrating Lip Oil"],
    "Fashion": ["Recycled Running Socks", "Packable Rain Jacket", "Organic Cotton Tee"],
}

# ── Supplier end-of-life notices (B6, 7 Oct) ───────────────────────────────
EOL_NOTICES = 6                           # from the steepest decliners
# Notice in Sep-Nov 2025 with 4-8 months' lead puts every effective date in
# 2026, after the data ends - so delistings are scheduled, not yet happened.
# (Jun notices with 4 months' lead once landed in Oct 2025 and cut sales
# off mid-window; validation check 23 caught it.)
EOL_NOTICE_MONTHS = (9, 11)               # 2025
EOL_LEAD_MONTHS = (4, 8)                  # notice -> effective (lands in 2026)

# ── Ranging (B2, 7 Oct) ─────────────────────────────────────────────────────
PRE_LAUNCH_LISTING_WEEKS = (4, 8)         # listed this long before first sale
GHOST_LISTING_SHARE = 0.03                # listed, never sold: share of traded combos
GHOST_RANK_WINDOW = 15                    # drawn from SKUs just outside a market's range

# ── Plan / targets (B3, 7 Oct) ──────────────────────────────────────────────
# Back-derived, labelled as such: annual plan = actual x (1 + planning error),
# phased by the category's expected seasonal curve so months miss differently.
PLAN_OPTIMISM_MEAN = 0.015                # plans run ~1.5% ahead of outcome
PLAN_ERROR_SD = 0.03
PLAN_MARGIN_STRETCH = 0.005               # margin target 0.5pp above outcome

# ── Forecast (B4, 7 Oct) ────────────────────────────────────────────────────
FORECAST_HISTORY_MONTHS = 3               # trailing window for the statistical forecast
FORECAST_BIAS_MEAN = 0.03                 # forecasts tend to over-call slightly
FORECAST_BIAS_SD = 0.05
FORECAST_NOISE_BASE = 0.08                # lognormal sd floor
FORECAST_NOISE_PER_CV = 0.6               # extra sd per unit of the SKU's cv_score
FORECAST_NO_HISTORY_SD = 0.30             # judgemental forecasts, no history yet

# ── Inventory (B5, 7 Oct) ───────────────────────────────────────────────────
# Distribution-centre stock per SKU x country, weekly. Periodic review, order-up-to.
INVENTORY_SERVICE_Z = 1.65                # ~95% cycle service level
INVENTORY_DEMAND_WINDOW_WEEKS = 8
INVENTORY_DISRUPTION_STOCKOUT_DAYS = 2    # store stockout days in a week that delay the receipt

# ── Costs below gross profit (B7, 7 Oct) - ALL ASSUMPTIONS ──────────────────
# Labelled as assumptions in the data itself (dim_cost_assumption, basis column).
LOGISTICS_PER_UNIT_USD = {"E-commerce": 0.45, "Hypermarket": 0.12, "Supermarket": 0.15, "Convenience": 0.22}
LOGISTICS_COUNTRY_FACTOR = {"Italy": 1.00, "Spain": 1.05, "Germany": 0.95, "Austria": 1.05,
                            "France": 1.00, "Poland": 0.85, "Netherlands": 1.10}
MARKETING_PCT_BY_BRAND_ROLE = {"Cash Cow": 0.020, "Strategic": 0.040, "Energizer": 0.050,
                               "Flanker": 0.025, "Silver Bullet": 0.060}
SGA_VARIABLE_PCT = 0.09                   # of net sales
SGA_FIXED_ANNUAL_USD = 18_000_000         # split across countries by revenue share
SKU_FIXED_COST_BASE_USD = 60_000          # per SKU per year: artwork, compliance, listing admin
SKU_FIXED_COST_PER_MARKET_USD = 10_000    # per country listed
# Statutory headline corporate income tax rates (public figures, approximate;
# local surcharges simplified). Source basis recorded in dim_cost_assumption.
CORPORATE_TAX_RATE = {"Italy": 0.24, "Spain": 0.25, "Germany": 0.30, "Austria": 0.23,
                      "France": 0.25, "Poland": 0.19, "Netherlands": 0.258}

# ── Independent random streams for 7 Oct additions ─────────────────────────
# Each new module draws from its own stream so the main generator's draw order,
# and therefore every row it produced before, is unchanged where not intended.
STREAM = {"lifecycle": 1, "pricing": 2, "customers": 3, "listing": 4, "plan": 5,
          "forecast": 6, "inventory": 7, "launches": 8, "costs": 9,
          "launch_targets": 10}

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
