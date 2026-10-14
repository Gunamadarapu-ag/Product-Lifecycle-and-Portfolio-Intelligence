"""
Retail accounts (dim_customer) and monthly sales by account (fact_customer_sales).

fact_sales stays at SKU x country x channel x day. This module splits each
month x SKU x country x channel cell across the fictional accounts trading in
that country and channel, so units and net sales reconcile to fact_sales to the
cent - a breakdown of the warehouse, never a second source of totals.

Account names are coined from syllables so none can match a real retailer.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C

_ONSET = ["B", "C", "D", "F", "L", "M", "N", "P", "R", "S", "T", "V", "Z", "Br", "Cl", "Tr"]
_VOWEL = ["a", "e", "i", "o", "u"]
_CODA = ["ra", "na", "lo", "vex", "ria", "ton", "via", "mar", "deo", "lia"]


def _coin(rng: np.random.Generator, taken: set[str]) -> str:
    while True:
        name = (rng.choice(_ONSET) + rng.choice(_VOWEL) + rng.choice(_ONSET).lower()
                + rng.choice(_VOWEL) + rng.choice(_CODA))
        if name not in taken:
            taken.add(name)
            return name


def build_customers(countries: pd.DataFrame, channels: pd.DataFrame,
                    rng: np.random.Generator) -> pd.DataFrame:
    """dim_customer: a few accounts per country x channel, with a fixed share each."""
    rows, taken, cid = [], set(), 1
    for _, ctry in countries.iterrows():
        small = ctry["country_name"] in C.CUSTOMER_SMALL_MARKETS
        for _, ch in channels.iterrows():
            n = C.ACCOUNTS_PER_CHANNEL[ch["channel_name"]]
            if small:
                n = max(1, n - 1)
            # Dirichlet with a heavier first weight: one dominant key account,
            # as in most FMCG markets.
            alpha = np.array(C.ACCOUNT_SHARE_ALPHA[:n], dtype=float)
            share = np.sort(rng.dirichlet(alpha))[::-1]
            for i in range(n):
                rows.append({
                    "customer_id": cid,
                    "customer_name": f"{_coin(rng, taken)} {C.ACCOUNT_FORMAT[ch['channel_name']]}",
                    "country_id": int(ctry["country_id"]),
                    "channel_id": int(ch["channel_id"]),
                    "account_tier": "Key account" if i == 0 else "Regional",
                    "base_share": round(float(share[i]), 6),
                })
                cid += 1
    return pd.DataFrame(rows)


def build_customer_sales(fact: pd.DataFrame, customers: pd.DataFrame,
                         rng: np.random.Generator) -> pd.DataFrame:
    """
    fact_customer_sales: month x SKU x customer, units and net sales.

    Shares = account base share x a per (account, SKU) affinity x a small monthly
    wobble, renormalised within each cell. Units use largest-remainder rounding;
    net sales follow units and the cell's rounding residual goes to its largest
    row, so both reconcile exactly.
    """
    f = fact.assign(month_start=pd.to_datetime(fact["date_key"]).dt.to_period("M").dt.to_timestamp())
    cells = (f.groupby(["month_start", "sku_id", "country_id", "channel_id"], as_index=False)
             .agg(units=("units_sold", "sum"), net=("net_sales", "sum"),
                  purchase_cost=("purchase_cost", "first")))
    cells["cell"] = np.arange(len(cells))

    x = cells.merge(customers[["customer_id", "country_id", "channel_id", "base_share"]],
                    on=["country_id", "channel_id"])
    x = x.sort_values(["cell", "customer_id"]).reset_index(drop=True)

    # Affinity is fixed per (account, SKU): an account consistently over- or
    # under-indexes on a product. The wobble varies by month.
    pairs = x[["customer_id", "sku_id"]].drop_duplicates().sort_values(["customer_id", "sku_id"])
    pairs["affinity"] = rng.lognormal(0.0, C.ACCOUNT_SKU_AFFINITY_SD, len(pairs))
    x = x.merge(pairs, on=["customer_id", "sku_id"]).sort_values(["cell", "customer_id"])
    x = x.reset_index(drop=True)
    x["w"] = x["base_share"] * x["affinity"] * rng.lognormal(0.0, C.ACCOUNT_MONTH_WOBBLE_SD, len(x))
    x["w"] = x["w"] / x.groupby("cell")["w"].transform("sum")

    # Units: largest remainder within each cell.
    raw = x["units"] * x["w"]
    x["u"] = np.floor(raw).astype(np.int64)
    x["rem"] = raw - x["u"]
    short = x["units"] - x.groupby("cell")["u"].transform("sum")
    order = x.groupby("cell")["rem"].rank(method="first", ascending=False)
    x["u"] += (order <= short).astype(np.int64)

    # Net sales follow units; the cent residual goes to the cell's largest row.
    x["ns"] = np.round(x["net"] * x["u"] / x["units"], 2)
    resid = np.round(x["net"] - x.groupby("cell")["ns"].transform("sum"), 2)
    top = x.groupby("cell")["u"].transform("idxmax") == x.index
    x.loc[top, "ns"] = np.round(x.loc[top, "ns"] + resid[top], 2)

    out = x[x["u"] > 0].rename(columns={"u": "units_sold", "ns": "net_sales"})
    return out[["month_start", "sku_id", "customer_id", "units_sold", "net_sales",
                "purchase_cost"]].reset_index(drop=True)
