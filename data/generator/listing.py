"""
Ranging: which SKU is listed in which country and channel, and when (fact_listing).

Built from what actually sold, so every sale falls inside a listing, plus the two
things sales alone cannot show:
- "ghost" listings: listed, never sold - SKUs just outside a market's range;
- scheduled delistings, from supplier end-of-life notices (dates in 2026).

Status ("active", "delisting scheduled", "listed, no sales") is not stored: it
follows from listed_to and the sales, downstream.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C

WINDOW_START = pd.Timestamp(C.START_DATE)


def build_listing(fact: pd.DataFrame, sku: pd.DataFrame, launches: pd.DataFrame,
                  countries: pd.DataFrame, channels: pd.DataFrame,
                  notices: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    s = sku.set_index("sku_id")
    L = launches.set_index("sku_id")
    eol = notices.set_index("sku_id")["eol_effective_date"]

    first_sale = (fact.assign(d=pd.to_datetime(fact["date_key"]))
                  .groupby(["sku_id", "country_id", "channel_id"])["d"].min())

    rows = []
    for (k, c, ch), first in first_sale.items():
        launch = pd.Timestamp(L.at[k, "launch_date"])
        if pd.notna(L.at[k, "launch_year_in_window"]):
            weeks = int(rng.integers(C.PRE_LAUNCH_LISTING_WEEKS[0], C.PRE_LAUNCH_LISTING_WEEKS[1] + 1))
            frm = min(first, launch) - pd.Timedelta(weeks=weeks)
        else:
            # Rolled into this market some months after launch, before the window.
            frm = launch + pd.DateOffset(months=int(rng.integers(0, 19)))
            frm = min(frm, WINDOW_START - pd.Timedelta(days=1), first)
        rows.append({"sku_id": int(k), "country_id": int(c), "channel_id": int(ch),
                     "listed_from": frm.normalize(),
                     "listed_to": eol.get(k, pd.NaT)})

    # Ghost listings: SKUs ranked just outside a market's range, listed but never
    # sold - the "listed but not selling" case assortment reviews look for.
    traded = set(first_sale.index)
    candidates = []
    for _, ctry in countries.iterrows():
        n = int(ctry["listed_sku_count"])
        near = s[(s["revenue_rank"] > n) & (s["revenue_rank"] <= n + C.GHOST_RANK_WINDOW)]
        for k in near.index:
            for ch in channels["channel_id"]:
                if (k, ctry["country_id"], ch) not in traded:
                    candidates.append((int(k), int(ctry["country_id"]), int(ch)))
    n_ghost = min(len(candidates), int(round(len(first_sale) * C.GHOST_LISTING_SHARE)))
    for i in rng.choice(len(candidates), size=n_ghost, replace=False):
        k, c, ch = candidates[i]
        frm = pd.Timestamp(year=int(rng.integers(2024, 2026)), month=int(rng.integers(1, 13)), day=1)
        rows.append({"sku_id": k, "country_id": c, "channel_id": ch,
                     "listed_from": frm, "listed_to": pd.NaT})

    return pd.DataFrame(rows).sort_values(["sku_id", "country_id", "channel_id"]).reset_index(drop=True)
