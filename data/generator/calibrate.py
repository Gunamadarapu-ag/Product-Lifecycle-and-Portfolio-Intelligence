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
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def calibrate_margin(fact: pd.DataFrame, sku: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, float]:
    """Shift costs so the revenue-weighted portfolio margin lands on target."""
    price = sku.set_index("sku_id")["base_price"]
    unit_price = fact["sku_id"].map(price).to_numpy()

    revenue = float(fact["net_sales"].sum())
    gm_now = revenue - float((fact["units_sold"] * fact["purchase_cost"]).sum())
    gm_target = revenue * C.AVG_GROSS_MARGIN

    u = float((fact["units_sold"].to_numpy() * unit_price).sum())
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

    # Mirror onto the fact rows and recompute the generated column.
    fact = fact.copy()
    fact["purchase_cost"] = fact["sku_id"].map(sku.set_index("sku_id")["purchase_cost"])
    fact["gross_margin"] = (
        fact["net_sales"] - fact["units_sold"] * fact["purchase_cost"]
    ).round(2)

    return fact, sku, delta


def report(fact: pd.DataFrame) -> dict:
    rev = float(fact["net_sales"].sum())
    gm = float(fact["gross_margin"].sum())
    return {"net_sales": rev, "gross_margin": gm, "margin_pct": gm / rev}
