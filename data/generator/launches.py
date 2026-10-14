"""
Launch pipeline (dim_launch, launch_gate) and supplier end-of-life notices.

Two kinds of launch:
- the SKUs launched inside the data window (lifecycle.assign_launch_dates):
  every gate complete, actual launch date = first day they could sell;
- pipeline products planned for 2026: no SKU and no sales yet, gates
  completed / overdue / scheduled as of AS_OF_DATE.

Readiness is not stored - it is sum(gate weight) over completed gates, computed
downstream, so it can never disagree with the gate rows.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C

AS_OF = pd.Timestamp(C.AS_OF_DATE)
OWNER_ROLES = {
    "Beverages": "Category Manager - Beverages", "Snacks": "Category Manager - Snacks",
    "Dairy": "Category Manager - Dairy", "Household": "Category Manager - Home Care",
    "Personal Care": "Category Manager - Personal Care", "Beauty": "Category Manager - Beauty",
    "Fashion": "Category Manager - Fashion",
}


def _gates(launch_id: str, planned: pd.Timestamp, launched: bool, late: bool,
           rng: np.random.Generator) -> list[dict]:
    rows = []
    slip_extra = 0.0
    for no, name, weight, weeks in C.LAUNCH_GATES:
        due = planned - pd.Timedelta(weeks=weeks)
        slip = float(rng.normal(*C.GATE_SLIP_WEEKS))
        if late and no >= 2:
            slip_extra += float(rng.uniform(*C.LATE_GATE_SLIP_WEEKS))   # late items keep slipping
        done = due + pd.Timedelta(weeks=max(-2.0, slip + slip_extra))
        if launched:
            done = min(done, planned)                  # a launched item cleared every gate
            status = "Completed"
        elif done <= AS_OF:
            status = "Completed"
        elif due < AS_OF:
            status, done = "Overdue", pd.NaT
        else:
            status, done = "Scheduled", pd.NaT
        rows.append({"launch_id": launch_id, "gate_no": no, "gate_name": name,
                     "weight": weight, "reviewer_role": C.GATE_REVIEWER_ROLES[name],
                     "due_date": due.normalize(),
                     "completed_date": done.normalize() if pd.notna(done) else pd.NaT,
                     "status": status})
    return rows


def build_launches(sku: pd.DataFrame, launches: pd.DataFrame, brands: pd.DataFrame,
                   rng: np.random.Generator) -> tuple[pd.DataFrame, pd.DataFrame]:
    s = sku.set_index("sku_id")
    rows, gates = [], []
    lo, hi = C.LAUNCH_BUDGET_RANGE_USD

    # 1. Launched inside the window.
    done = launches[launches["launch_year_in_window"].notna()].sort_values("launch_date")
    for i, r in enumerate(done.itertuples(index=False), start=1):
        lid = f"L{i:03d}"
        actual = pd.Timestamp(r.launch_date)
        planned = actual - pd.Timedelta(weeks=int(rng.integers(0, 9)))   # some ran late
        budget = round(float(rng.uniform(lo, hi)), -3)
        cat = s.at[r.sku_id, "cat"]
        rows.append({"launch_id": lid, "sku_id": int(r.sku_id),
                     "product_name": s.at[r.sku_id, "sku_name"],
                     "category_id": int(s.at[r.sku_id, "category_id"]),
                     "brand_id": int(s.at[r.sku_id, "brand_id"]),
                     "planned_launch_date": planned.normalize(), "actual_launch_date": actual,
                     "stage": "Launched", "budget_usd": budget,
                     "spent_usd": round(budget * float(rng.uniform(0.9, 1.15)), -3),
                     "owner_role": OWNER_ROLES[cat]})
        gates += _gates(lid, actual, launched=True, late=False, rng=rng)

    # 2. Pipeline for 2026: fictional products in real categories and brands.
    cats = sku[["category_id", "cat"]].drop_duplicates().sort_values("category_id")
    brand_ids = brands["brand_id"].to_numpy()
    n_late = int(round(C.PIPELINE_LAUNCHES * C.PIPELINE_AT_RISK_SHARE))
    late_idx = set(rng.choice(C.PIPELINE_LAUNCHES, size=n_late, replace=False).tolist())
    for j in range(C.PIPELINE_LAUNCHES):
        lid = f"L{len(done) + j + 1:03d}"
        c = cats.iloc[j % len(cats)]
        products = C.PIPELINE_PRODUCTS[c["cat"]]
        product = products[(j // len(cats)) % len(products)]
        brand = int(brand_ids[j % len(brand_ids)])
        planned = pd.Timestamp(year=2026, month=int(rng.integers(C.PIPELINE_LAUNCH_MONTHS[0], C.PIPELINE_LAUNCH_MONTHS[1] + 1)),
                               day=1)
        g = _gates(lid, planned, launched=False, late=j in late_idx, rng=rng)
        frac_done = sum(x["weight"] for x in g if x["status"] == "Completed")
        budget = round(float(rng.uniform(lo, hi)), -3)
        stage = next((x["gate_name"] for x in g if x["status"] != "Completed"), "Launch")
        rows.append({"launch_id": lid, "sku_id": None,
                     "product_name": f"Brand{chr(64 + brand)} {product}",
                     "category_id": int(c["category_id"]), "brand_id": brand,
                     "planned_launch_date": planned, "actual_launch_date": pd.NaT,
                     "stage": stage, "budget_usd": budget,
                     "spent_usd": round(budget * frac_done * float(rng.uniform(0.85, 1.2)), -3),
                     "owner_role": OWNER_ROLES[c["cat"]]})
        gates += g

    dim_launch = pd.DataFrame(rows)
    dim_launch["sku_id"] = dim_launch["sku_id"].astype("Int64")
    return dim_launch, pd.DataFrame(gates)


def add_launch_targets(dim_launch: pd.DataFrame, fact: pd.DataFrame, sku: pd.DataFrame,
                       countries: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Lead region and expected year-1 revenue per launch (see config, 8 Oct).

    Both are labelled assumptions. Revenue at risk and plan-vs-actual are not
    stored - they are computed downstream from these columns and fact_sales.
    """
    region_of = countries.set_index("country_id")["region"]
    f = fact[["date_key", "sku_id", "country_id", "net_sales"]].copy()
    f["date_key"] = pd.to_datetime(f["date_key"])
    f["region"] = f["country_id"].map(region_of)
    cat_of = sku.set_index("sku_id")["cat"]
    cat_id = sku.drop_duplicates("category_id").set_index("category_id")["cat"]

    # Launched SKUs: first 365 days on sale (or what the window holds), annualised.
    first = f.groupby("sku_id")["date_key"].min()
    launched = dim_launch[dim_launch["sku_id"].notna()]
    actual_y1, lead = {}, {}
    data_end = f["date_key"].max()
    for r in launched.itertuples(index=False):
        k, start = int(r.sku_id), first[int(r.sku_id)]
        end = min(start + pd.Timedelta(days=364), data_end)
        rows = f[(f["sku_id"] == k) & (f["date_key"] <= end)]
        days = (end - start).days + 1
        actual_y1[r.launch_id] = float(rows["net_sales"].sum()) * 365.0 / days
        lead[r.launch_id] = rows.groupby("region")["net_sales"].sum().idxmax()

    by_cat = pd.Series({lid: cat_of[int(s)] for lid, s in
                        zip(launched["launch_id"], launched["sku_id"])})
    bench = pd.Series(actual_y1).groupby(by_cat).median()
    overall = float(np.median(list(actual_y1.values())))

    rep = f[f["date_key"].dt.year == C.REPORT_YEAR].assign(cat=lambda d: d["sku_id"].map(cat_of))
    reg_share = rep.groupby(["cat", "region"])["net_sales"].sum()

    regions, expected = [], []
    for r in dim_launch.itertuples(index=False):
        if r.launch_id in actual_y1:
            regions.append(lead[r.launch_id])
            expected.append(actual_y1[r.launch_id] / float(rng.uniform(*C.LAUNCH_PLAN_ERROR)))
        else:
            cat = cat_id[int(r.category_id)]
            w = reg_share.loc[cat].sort_index()
            regions.append(str(rng.choice(w.index.to_numpy(), p=(w / w.sum()).to_numpy())))
            expected.append(float(bench.get(cat, overall)) * float(rng.uniform(*C.PIPELINE_YEAR1_FACTOR)))
    return dim_launch.assign(lead_region=regions,
                             expected_year1_revenue_usd=np.round(expected, -3))


def build_supplier_notices(sku: pd.DataFrame, fact: pd.DataFrame,
                           rng: np.random.Generator) -> pd.DataFrame:
    """End-of-life notices from the primary supplier, for the steepest decliners."""
    f = fact.assign(year=pd.to_datetime(fact["date_key"]).dt.year)
    yr = f.pivot_table(index="sku_id", columns="year", values="net_sales", aggfunc="sum")
    growth = (yr[C.REPORT_YEAR] / yr[C.BASE_YEAR] - 1).dropna().sort_values()
    picks = growth.head(C.EOL_NOTICES).index
    s = sku.set_index("sku_id")
    rows = []
    for i, k in enumerate(picks, start=1):
        notice = pd.Timestamp(year=C.REPORT_YEAR,
                              month=int(rng.integers(C.EOL_NOTICE_MONTHS[0], C.EOL_NOTICE_MONTHS[1] + 1)),
                              day=int(rng.integers(1, 29)))
        effective = (notice + pd.DateOffset(months=int(rng.integers(C.EOL_LEAD_MONTHS[0], C.EOL_LEAD_MONTHS[1] + 1)))).normalize()
        kind = "Component end-of-life" if i % 2 else "Supplier discontinuation"
        rows.append({"notice_id": i, "supplier_id": s.at[k, "primary_supplier_id"],
                     "sku_id": int(k), "notice_date": notice, "eol_effective_date": effective,
                     "notice_type": kind})
    return pd.DataFrame(rows)
