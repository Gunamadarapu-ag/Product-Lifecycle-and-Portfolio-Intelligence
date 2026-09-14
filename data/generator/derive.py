"""
Compute sku_metrics, sku_cannibalization and portfolio_metrics from fact_sales.

Every formula here comes from the source column reference; none are invented.
Mirrors what 03_derive_metrics.sql will do in the database, so the two can be
checked against each other once the data is loaded.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def _minmax(s: pd.Series) -> pd.Series:
    """Normalise to 0-1. A constant input has no information, so it maps to 0.5."""
    lo, hi = s.min(), s.max()
    if not np.isfinite(lo) or not np.isfinite(hi) or hi - lo < 1e-12:
        return pd.Series(0.5, index=s.index)
    return (s - lo) / (hi - lo)


def build_sku_metrics(fact: pd.DataFrame, sku: pd.DataFrame,
                      cal: pd.DataFrame, snapshot: str) -> pd.DataFrame:
    f = fact.merge(cal[["date_key", "year", "month"]], on="date_key", how="left")

    # ── Commercial ──────────────────────────────────────────────────────────
    g = f.groupby("sku_id")
    m = pd.DataFrame({
        "total_net_sales": g["net_sales"].sum(),
        "total_units_sold": g["units_sold"].sum(),
        "total_gross_margin": g["gross_margin"].sum(),
        "total_stockouts": g["stock_out_flag"].sum(),
        "avg_lead_time_days": g["lead_time_days"].mean(),
    })
    m["gross_margin_pct"] = m["total_gross_margin"] / m["total_net_sales"]

    # Year-on-year. NULL where there is no prior year, never 0 - the source
    # warns zeros here were being misread as "flat" rather than "unknown".
    yr = f.pivot_table(index="sku_id", columns="year", values="net_sales", aggfunc="sum")
    base, rept = C.BASE_YEAR, C.REPORT_YEAR
    if base in yr and rept in yr:
        m["revenue_growth"] = np.where(
            yr[base].reindex(m.index).fillna(0) > 0,
            (yr[rept].reindex(m.index) - yr[base].reindex(m.index))
            / yr[base].reindex(m.index).replace(0, np.nan),
            np.nan,
        )
    else:
        m["revenue_growth"] = np.nan

    total_rev = m["total_net_sales"].sum()
    m["revenue_share_pct"] = m["total_net_sales"] / total_rev
    m["low_velocity_flag"] = (m["revenue_share_pct"] < 0.01).astype(int)

    # ── Volatility (monthly grain) ──────────────────────────────────────────
    monthly = f.groupby(["sku_id", "year", "month"])["units_sold"].sum()
    mstats = monthly.groupby("sku_id").agg(["std", "mean"])
    m["demand_std"] = mstats["std"]
    m["cv_score"] = (mstats["std"] / mstats["mean"]).fillna(0)
    m["volatility_class"] = pd.cut(
        m["cv_score"],
        bins=[-np.inf, C.CV_STABLE_MAX, C.CV_VARIABLE_MAX, np.inf],
        labels=["Stable", "Variable", "Unstable"],
    ).astype(str)

    # Seasonality: average each calendar month across years first, so the index
    # captures the seasonal shape rather than year-on-year drift.
    permonth = f.groupby(["sku_id", "month"])["units_sold"].sum().unstack(fill_value=0)
    m["seasonality_index"] = (permonth.std(axis=1) / permonth.mean(axis=1)).fillna(0)

    # ── Supply chain proxies ────────────────────────────────────────────────
    lead = sku.set_index("sku_id")["lead_time_days"]
    m["safety_stock_proxy"] = lead.reindex(m.index) * m["demand_std"]
    m["ss_to_revenue_ratio"] = m["safety_stock_proxy"] / m["total_net_sales"]
    m["inventory_carrying_cost"] = C.CARRYING_COST_RATE * m["safety_stock_proxy"]

    # ── Promotions ──────────────────────────────────────────────────────────
    promo_rev = f[f["promo_flag"] > 0].groupby("sku_id")["net_sales"].sum()
    m["promo_dependency"] = (promo_rev.reindex(m.index).fillna(0)
                             / m["total_net_sales"])

    # Margin erosion: percentage-point gap between non-promo and promo margin.
    f["_is_promo"] = f["promo_flag"] > 0
    pm = f.groupby(["sku_id", "_is_promo"]).apply(
        lambda d: d["gross_margin"].sum() / d["net_sales"].sum()
        if d["net_sales"].sum() else np.nan,
        include_groups=False,
    ).unstack()
    if True in pm and False in pm:
        m["margin_erosion"] = ((pm[False] - pm[True]) * 100).reindex(m.index).fillna(0)
    else:
        m["margin_erosion"] = 0.0

    # ── Composite scores ────────────────────────────────────────────────────
    # Equal-weighted means of normalised components - a documented assumption.
    value = pd.concat([
        _minmax(m["total_net_sales"]),
        _minmax(m["total_gross_margin"]),
        _minmax(m["revenue_growth"].fillna(m["revenue_growth"].median())),
        _minmax(1.0 - m["cv_score"]),
    ], axis=1).mean(axis=1)
    m["commercial_value_score"] = value.clip(0, 1)

    vol_num = m["volatility_class"].map({"Stable": 0.3, "Variable": 0.6, "Unstable": 1.0})
    # Supplier dependency is constant here (all 60 suppliers serve all SKUs), so
    # _minmax maps it to a neutral 0.5 and it adds no spurious variance.
    supplier_dep = pd.Series(float(C.SUPPLIER_COUNT), index=m.index)
    complexity = pd.concat([
        _minmax(lead.reindex(m.index)),
        _minmax(supplier_dep),
        _minmax(m["promo_dependency"]),
        _minmax(m["total_stockouts"]),
        _minmax(vol_num),
    ], axis=1).mean(axis=1)
    m["operational_complexity_score"] = complexity.clip(0, 1)

    m["op_burden_ratio"] = (m["operational_complexity_score"]
                            / m["commercial_value_score"].clip(lower=0.01))

    # Median split on both axes.
    hv = m["commercial_value_score"] >= m["commercial_value_score"].median()
    hc = m["operational_complexity_score"] >= m["operational_complexity_score"].median()
    m["portfolio_segment"] = np.select(
        [hv & ~hc, hv & hc, ~hv & ~hc, ~hv & hc],
        ["Keep", "Grow", "Consolidate", "Rationalize"],
        default="Consolidate",
    )

    m["snapshot_date"] = pd.Timestamp(snapshot).date()
    # cannibalization_risk_score is attached later by attach_cannibalization_score,
    # once the pairwise table exists.
    m["cannibalization_risk_score"] = np.nan
    return m.reset_index()


def attach_cannibalization_score(metrics: pd.DataFrame, cann: pd.DataFrame) -> pd.DataFrame:
    """
    Per-SKU score = the most negative correlation the SKU takes part in.

    The source defines a scalar per SKU; the UI shows the pairs. Both are kept,
    and this derives the former from the latter so they cannot disagree.
    """
    if cann.empty:
        metrics["cannibalization_risk_score"] = 0.0
        return metrics

    worst = pd.concat([
        cann[["sku_id_a", "correlation"]].rename(columns={"sku_id_a": "sku_id"}),
        cann[["sku_id_b", "correlation"]].rename(columns={"sku_id_b": "sku_id"}),
    ]).groupby("sku_id")["correlation"].min()

    metrics = metrics.copy()
    metrics["cannibalization_risk_score"] = (
        metrics["sku_id"].map(worst).fillna(0.0).round(4)
    )
    return metrics


def build_cannibalization(fact: pd.DataFrame, sku: pd.DataFrame,
                          cal: pd.DataFrame) -> pd.DataFrame:
    """
    Within-category SKU pairs, stored once with sku_id_a < sku_id_b.

    Measures displacement as the correlation between one SKU's monthly promo
    intensity and another's monthly units, taking the more negative of the two
    directions - the source's definition.
    """
    f = fact.merge(cal[["date_key", "year", "month"]], on="date_key", how="left")
    f["ym"] = f["year"].astype(str) + "-" + f["month"].astype(str).str.zfill(2)

    units = f.pivot_table(index="ym", columns="sku_id", values="units_sold",
                          aggfunc="sum", fill_value=0)
    promo = f.pivot_table(index="ym", columns="sku_id", values="promo_flag",
                          aggfunc="mean", fill_value=0)

    cat = sku.set_index("sku_id")["category_id"]
    rows = []
    for cat_id, grp in sku.groupby("category_id"):
        ids = sorted(grp["sku_id"].tolist())
        for i, a in enumerate(ids):
            for b in ids[i + 1:]:
                if a not in units or b not in units:
                    continue
                c1 = np.corrcoef(promo[a], units[b])[0, 1] if promo[a].std() > 0 else 0.0
                c2 = np.corrcoef(promo[b], units[a])[0, 1] if promo[b].std() > 0 else 0.0
                c = float(np.nanmin([c1, c2]))
                if not np.isfinite(c):
                    c = 0.0
                rows.append({
                    "sku_id_a": a, "sku_id_b": b, "category_id": int(cat_id),
                    "correlation": round(max(-1.0, min(1.0, c)), 4),
                    "is_significant": c < -0.30,
                })
    return pd.DataFrame(rows)


def build_portfolio_metrics(fact: pd.DataFrame, m: pd.DataFrame, sku: pd.DataFrame,
                            cal: pd.DataFrame, snapshot: str) -> pd.DataFrame:
    f = fact.merge(cal[["date_key", "year"]], on="date_key", how="left")
    by_year = f.groupby("year")["net_sales"].sum()

    share = m["revenue_share_pct"].sort_values(ascending=False).to_numpy()
    n = len(share)

    def top(pct: float) -> float:
        return float(share[: max(1, int(round(n * pct)))].sum())

    # PCI sub-drivers. The two baselines the source flags as internal
    # assumptions are restated here for 119 SKUs and 60 suppliers.
    sku_prolif = n / C.PCI_SKU_BASELINE * C.PCI_SUBDRIVER_TARGETS["sku_proliferation"]
    supp_frag = (C.SUPPLIER_COUNT / C.PCI_SUPPLIER_BASELINE
                 * C.PCI_SUBDRIVER_TARGETS["supplier_fragmentation"])
    low_vel = float(m["low_velocity_flag"].mean())
    lead_cv = float(sku["lead_time_days"].std() / sku["lead_time_days"].mean())
    promo_score = float((m["promo_dependency"] * m["revenue_share_pct"]).sum())
    avg_cv = float(m["cv_score"].mean())

    subs = [supp_frag, sku_prolif, low_vel, lead_cv, promo_score, avg_cv]
    pci = float(np.mean(subs))

    row = {
        "snapshot_date": pd.Timestamp(snapshot).date(),
        "total_net_sales": float(by_year.get(C.REPORT_YEAR, f["net_sales"].sum())),
        "avg_gross_margin_pct": float(f["gross_margin"].sum() / f["net_sales"].sum()),
        "yoy_growth": float(by_year[C.REPORT_YEAR] / by_year[C.BASE_YEAR] - 1),
        "active_sku_count": int(n),
        "supplier_count": C.SUPPLIER_COUNT,
        "top10pct_revenue_share": top(0.10),
        "top20pct_revenue_share": top(0.20),
        "top30pct_revenue_share": top(0.30),
        "long_tail_pct": low_vel,
        "total_stockouts": int(f["stock_out_flag"].sum()),
        "portfolio_complexity_index": pci,
        "supplier_fragmentation": supp_frag,
        "sku_proliferation": sku_prolif,
        "low_velocity_pct": low_vel,
        "lead_time_instability": lead_cv,
        "promo_dependency_score": promo_score,
        "avg_volatility_cv": avg_cv,
    }
    return pd.DataFrame([row])
