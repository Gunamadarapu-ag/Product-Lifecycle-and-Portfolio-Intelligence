"""
Post-generation calibration.

Only one target needs correcting after the fact: the portfolio gross margin.
Everything else is exact by construction.

Why margin needs it: the portfolio figure is revenue-weighted, and the seed's
higher-revenue SKUs carry higher margins, so the weighted mean lands above the
unweighted 37.9%. Cost affects margin but not revenue, so the correction has a
closed form and needs no regeneration.

    net_sales is fixed by price and units.
    cost_i = price_i x (1 - m_i - d)
    => sum(units x cost) = sum(units x price x (1 - m)) - d x U,  U = sum(units x price)
    => GM(d) = GM(0) + d x U
    => d = (GM_target - GM(0)) / U

The shift is additive, so every SKU keeps its position in the margin ordering.

Since 7 Oct two things changed. List prices move during the window (pricing.py),
and unit costs inflate by year (COST_INFLATION_BY_YEAR), so a transaction's cost
is base_price x (1 - m_i - d) x (1 + inflation of its year) - still linear in d,
with U weighted by the same inflation factor. And the target is solved on the
REPORT year only: 38.53% is the headline (12-month) figure that 04_validate.sql
checks, and with prices and costs moving the two years no longer share a margin.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def calibrate_margin(fact: pd.DataFrame, sku: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, float]:
    """Shift costs so the revenue-weighted portfolio margin lands on target."""
    s = sku.set_index("sku_id")
    year = pd.to_datetime(fact["date_key"]).dt.year
    infl = year.map(lambda y: 1.0 + C.COST_INFLATION_BY_YEAR.get(y, 0.0)).to_numpy()
    base = fact["sku_id"].map(s["base_price"]).to_numpy()
    m0 = fact["sku_id"].map(s["target_margin_pct"]).to_numpy()
    units = fact["units_sold"].to_numpy()

    rept = (year == C.REPORT_YEAR).to_numpy()
    revenue = float(fact.loc[rept, "net_sales"].sum())
    gm_now = revenue - float((units * base * (1.0 - m0) * infl)[rept].sum())
    gm_target = revenue * C.AVG_GROSS_MARGIN

    u = float((units * base * infl)[rept].sum())
    delta = (gm_target - gm_now) / u

    # Apply to the SKU master, respecting ck_dim_sku_price.
    # cost_i = price_i x (1 - m_i - d), so the effective margin is m_i + d.
    sku = sku.copy()
    new_margin = (sku["target_margin_pct"] + delta).clip(lower=0.02, upper=0.95)
    sku["target_margin_pct"] = new_margin.round(4)
    sku["purchase_cost"] = (sku["base_price"] * (1.0 - new_margin)).round(2)
    too_close = sku["purchase_cost"] >= sku["base_price"]
    sku.loc[too_close, "purchase_cost"] = (sku.loc[too_close, "base_price"] - 0.01).round(2)
    sku["purchase_cost"] = sku["purchase_cost"].clip(lower=0.01)

    # Mirror onto the fact rows, inflated to each row's year, and recompute the
    # generated column. dim_sku.purchase_cost stays the opening (2024) cost.
    fact = fact.copy()
    fact["purchase_cost"] = np.round(
        fact["sku_id"].map(sku.set_index("sku_id")["purchase_cost"]).to_numpy() * infl, 2)
    fact["gross_margin"] = (
        fact["net_sales"] - fact["units_sold"] * fact["purchase_cost"]
    ).round(2)

    return fact, sku, delta


def report(fact: pd.DataFrame) -> dict:
    """Headline-year figures - the year the margin target is calibrated on."""
    r = fact[pd.to_datetime(fact["date_key"]).dt.year == C.REPORT_YEAR]
    rev = float(r["net_sales"].sum())
    gm = float(r["gross_margin"].sum())
    return {"net_sales": rev, "gross_margin": gm, "margin_pct": gm / rev}
