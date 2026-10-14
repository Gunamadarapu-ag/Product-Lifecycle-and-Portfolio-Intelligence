"""
List-price history per SKU x country, and per-SKU own-price elasticity.

Before 7 Oct each SKU had one price for the whole window, which made any
elasticity or pricing figure unfounded: with no price variation there is no
demand response to measure. Each SKU x country now starts at base_price times a
country index and takes at most one list-price increase per year. Demand
responds through the elasticity in demand.generate; revenue still lands exactly
on target because units are solved per year.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def build_price_paths(sku: pd.DataFrame, countries: pd.DataFrame,
                      combos: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    One row per price spell: sku_id, country_id, effective_from, effective_to
    (exclusive; NaT = still in force at the end of the data), list_price, change_pct.

    Only SKU x country pairs that actually trade get a path.
    """
    s = sku.set_index("sku_id")
    idx = countries.set_index("country_id")["country_name"].map(C.COUNTRY_PRICE_INDEX)
    pairs = combos[["sku_id", "country_id"]].drop_duplicates().sort_values(["sku_id", "country_id"])

    rows = []
    for k, c in pairs.itertuples(index=False):
        price = round(float(s.at[k, "base_price"]) * float(idx[c]), 2)
        start = pd.Timestamp(C.START_DATE)
        spells = [(start, price, 0.0)]
        for year, (m0, m1) in C.PRICE_INCREASE_MONTHS.items():
            # Draw both numbers regardless of the outcome, so the stream does not
            # depend on earlier coin flips.
            take = rng.random() < C.PRICE_INCREASE_PROB
            pct = float(rng.uniform(*C.PRICE_INCREASE_RANGE))
            month = int(rng.integers(m0, m1 + 1))
            if take:
                price = round(price * (1.0 + pct), 2)
                spells.append((pd.Timestamp(year=year, month=month, day=1), price, pct))
        for i, (frm, p, pct) in enumerate(spells):
            to = spells[i + 1][0] if i + 1 < len(spells) else pd.NaT
            rows.append({"sku_id": k, "country_id": c, "effective_from": frm,
                         "effective_to": to, "list_price": p,
                         "change_pct": round(pct, 4)})
    return pd.DataFrame(rows)


def build_elasticity(sku: pd.DataFrame, rng: np.random.Generator) -> pd.Series:
    """Own-price elasticity per SKU (negative). Generation-only, never exported."""
    mean = sku["cat"].map(C.ELASTICITY_MEAN).to_numpy(dtype=float)
    e = mean + rng.normal(0.0, C.ELASTICITY_JITTER, len(sku))
    e = np.clip(e, *C.ELASTICITY_RANGE)
    return pd.Series(np.round(e, 3), index=sku["sku_id"].to_numpy())


def price_lookup(paths: pd.DataFrame) -> dict[tuple[int, int], tuple[np.ndarray, np.ndarray]]:
    """(sku_id, country_id) -> (spell start dates, list prices), for searchsorted."""
    out = {}
    for (k, c), g in paths.groupby(["sku_id", "country_id"], sort=False):
        g = g.sort_values("effective_from")
        out[(k, c)] = (g["effective_from"].to_numpy(dtype="datetime64[D]"),
                       g["list_price"].to_numpy(dtype=float))
    return out
