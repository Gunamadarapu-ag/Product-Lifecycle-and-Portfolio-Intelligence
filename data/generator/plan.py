"""
Monthly plan / targets per country x category (fact_plan).

Back-derived, and labelled as such in the data (basis column): the annual plan
for each country x category is its actual outcome times (1 + a planning error
that leans optimistic), then phased across months by the category's EXPECTED
seasonal curve - not by what actually happened each month - so monthly
attainment varies the way it does against a real budget.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C
from demand import _seasonality


def build_plan(fact: pd.DataFrame, sku: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    s = sku.set_index("sku_id")
    f = fact.assign(d=pd.to_datetime(fact["date_key"]))
    f["year"] = f["d"].dt.year
    f["category_id"] = f["sku_id"].map(s["category_id"])

    annual = (f.groupby(["year", "country_id", "category_id"], as_index=False)
              .agg(net=("net_sales", "sum"), gm=("gross_margin", "sum")))
    profile = (sku.drop_duplicates("category_id")
               .set_index("category_id")["seasonality_profile"])

    months = np.arange(1, 13)
    rows = []
    for r in annual.itertuples(index=False):
        err = float(rng.normal(C.PLAN_OPTIMISM_MEAN, C.PLAN_ERROR_SD))
        plan_year = r.net * (1.0 + err)
        prof = profile[r.category_id]
        w = _seasonality(months, prof, C.SEASONALITY_AMPLITUDE[prof])
        w = w / w.sum()
        margin_target = round(r.gm / r.net + C.PLAN_MARGIN_STRETCH, 4)
        for m, wm in zip(months, w):
            rows.append({"month_start": pd.Timestamp(year=int(r.year), month=int(m), day=1),
                         "country_id": int(r.country_id), "category_id": int(r.category_id),
                         "revenue_target_usd": round(plan_year * wm, 2),
                         "gross_margin_pct_target": margin_target,
                         "basis": "back-derived: actual x (1 + planning error), phased by expected seasonality"})
    return pd.DataFrame(rows)
