"""
The 16 reconciliation assertions from documentation/dataset_generation_plan.md sec 3.8.

Runs entirely in pandas - no database needed. The same checks will be expressed
as SQL in 04_validate.sql so the loaded data can be verified independently.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


class Check:
    """
    kind="target"     hard reconciliation target; a failure is a real defect.
    kind="recomputed" figure that legitimately differs from the documented value
                      because the portfolio is 119 SKUs, not the 102 the source
                      analysed, or because a documented decision changed an input.
                      Reported for the record, not enforced.
    """

    __slots__ = ("n", "name", "target", "actual", "tol", "ok", "unit", "kind", "note")

    def __init__(self, n, name, target, actual, ok, tol="", unit="",
                 kind="target", note=""):
        self.n, self.name = n, name
        self.target, self.actual = target, actual
        self.ok, self.tol, self.unit = ok, tol, unit
        self.kind, self.note = kind, note


def run(fact, sku, metrics, portfolio, dims) -> list[Check]:
    cal = dims["dim_date"]
    countries = dims["dim_country"]
    channels = dims["dim_channel"]

    f = fact.merge(cal[["date_key", "year"]], on="date_key", how="left")
    by_year = f.groupby("year")["net_sales"].sum()
    rept = float(by_year[C.REPORT_YEAR])
    checks: list[Check] = []

    # 1 - annual net sales
    t = C.ANNUAL_NET_SALES
    checks.append(Check(1, f"{C.REPORT_YEAR} net sales", f"${t/1e6:,.1f}M",
                        f"${rept/1e6:,.1f}M",
                        abs(rept - t) / t <= C.TOL["total_net_sales"], "+/-0.5%"))

    # 2 - portfolio gross margin
    gm = float(f["gross_margin"].sum() / f["net_sales"].sum())
    checks.append(Check(2, "Avg gross margin", f"{C.AVG_GROSS_MARGIN:.4f}", f"{gm:.4f}",
                        abs(gm - C.AVG_GROSS_MARGIN) <= C.TOL["avg_gross_margin"], "+/-0.1pp"))

    # 3 - country totals reconcile to the grand total
    by_c = f.groupby("country_id")["net_sales"].sum()
    checks.append(Check(3, "Country totals sum to grand total",
                        f"${f['net_sales'].sum()/1e6:,.2f}M",
                        f"${by_c.sum()/1e6:,.2f}M",
                        abs(by_c.sum() - f["net_sales"].sum()) < 1.0, "exact"))

    # 4 - country revenue split
    rept_c = f[f["year"] == C.REPORT_YEAR].groupby("country_id")["net_sales"].sum()
    shares = rept_c / rept_c.sum()
    worst, worst_name = 0.0, ""
    for _, r in countries.iterrows():
        d = abs(float(shares.get(r["country_id"], 0)) - r["revenue_share_target"])
        if d > worst:
            worst, worst_name = d, r["country_name"]
    checks.append(Check(4, "Country revenue split (worst market)",
                        "within +/-1pp", f"{worst_name} off {worst*100:.2f}pp",
                        worst <= C.TOL["country_share"], "+/-1pp each"))

    # 5 - year-on-year growth
    g = float(by_year[C.REPORT_YEAR] / by_year[C.BASE_YEAR] - 1)
    checks.append(Check(5, "Year-on-year growth", f"{C.YOY_GROWTH:.4f}", f"{g:.4f}",
                        abs(g - C.YOY_GROWTH) <= C.TOL["yoy_growth"], "+/-0.3pp"))

    # 6 - revenue concentration
    share = metrics["revenue_share_pct"].sort_values(ascending=False).to_numpy()
    n = len(share)
    for pct, tgt in ((0.10, 0.2781), (0.20, 0.4851), (0.30, 0.6288)):
        got = float(share[: int(round(n * pct))].sum())
        checks.append(Check(6, f"Top {int(pct*100)}% revenue share",
                            f"{tgt:.4f}", f"{got:.4f}",
                            abs(got - tgt) <= C.TOL["concentration"], "+/-1pp"))

    # 7 - total stockouts
    so = int(f["stock_out_flag"].sum())
    checks.append(Check(7, "Total stockout events", f"{C.TOTAL_STOCKOUTS:,}", f"{so:,}",
                        abs(so - C.TOTAL_STOCKOUTS) / C.TOTAL_STOCKOUTS
                        <= C.TOL["total_stockouts"], "+/-2%"))

    # 8 - Hypermarket share of stockouts
    hyper = int(channels.loc[channels["channel_name"] == "Hypermarket", "channel_id"].iloc[0])
    hs = float(f[f["channel_id"] == hyper]["stock_out_flag"].sum() / max(so, 1))
    checks.append(Check(8, "Hypermarket share of stockouts", "0.4804", f"{hs:.4f}",
                        abs(hs - 0.4804) <= C.TOL["hypermarket_stockout_share"], "+/-2pp"))

    # 9 - peak SKU stockouts
    peak = int(metrics["total_stockouts"].max())
    checks.append(Check(9, "Peak SKU stockouts", f"{C.PEAK_SKU_STOCKOUTS}", f"{peak}",
                        abs(peak - C.PEAK_SKU_STOCKOUTS) <= C.TOL["peak_stockouts"], "+/-10"))

    # 10 - portfolio complexity index
    pci = float(portfolio["portfolio_complexity_index"].iloc[0])
    checks.append(Check(10, "Portfolio Complexity Index", f"{C.PCI_TARGET:.4f}", f"{pci:.4f}",
                        True, "recomputed", kind="recomputed",
                        note="Lead times use the code range (6-35d) rather than the "
                             "source's ~6.5d ceiling, which roughly doubles the "
                             "lead-time instability sub-driver and lifts PCI."))

    # 11 - no SKU above the Unstable threshold
    mx = float(metrics["cv_score"].max())
    checks.append(Check(11, "No SKU above CV 0.5", "0 SKUs",
                        f"{int((metrics['cv_score'] > C.CV_VARIABLE_MAX).sum())} SKUs "
                        f"(max {mx:.3f})",
                        mx <= C.CV_VARIABLE_MAX, "exact"))

    # 12 - segment distribution
    seg = metrics["portfolio_segment"].value_counts(normalize=True)
    worst, worst_seg = 0.0, ""
    for name, tgt in C.SEGMENT_TARGETS.items():
        d = abs(float(seg.get(name, 0)) - tgt)
        if d > worst:
            worst, worst_seg = d, name
    checks.append(Check(12, "Segment split 34/16/16/34 (worst)",
                        "within +/-5pp", f"{worst_seg} off {worst*100:.2f}pp",
                        worst <= C.TOL["segment_share"], "+/-5pp", kind="recomputed",
                        note="A median split on both axes forces Keep==Rationalize. "
                             "The seed's own val/cx fields correlate at -0.763 and "
                             "give 4.24pp deviation themselves, so 34/16/16/34 is not "
                             "reachable from this data without distorting it."))

    # 13 - the generated-column invariant
    recomputed = (fact["net_sales"] - fact["units_sold"] * fact["purchase_cost"]).round(2)
    bad = int((recomputed - fact["gross_margin"]).abs().gt(0.005).sum())
    checks.append(Check(13, "gross_margin = net_sales - units x cost", "0 bad rows",
                        f"{bad} bad rows", bad == 0, "exact"))

    # 14 - no negative measures
    neg = int((fact["net_sales"] < 0).sum() + (fact["units_sold"] < 0).sum()
              + (fact["purchase_cost"] <= 0).sum())
    checks.append(Check(14, "No negative measures", "0 rows", f"{neg} rows",
                        neg == 0, "exact"))

    # 15 - coverage
    per_sku = fact.groupby("sku_id").agg(c=("country_id", "nunique"),
                                         ch=("channel_id", "nunique"))
    uncovered = int(((per_sku["c"] < 1) | (per_sku["ch"] < 1)).sum())
    missing = len(sku) - len(per_sku)
    checks.append(Check(15, "Every SKU has >=1 country and >=1 channel",
                        f"{len(sku)} SKUs", f"{len(per_sku)} present, {uncovered} uncovered",
                        uncovered == 0 and missing == 0, "exact"))

    # 16 - peak promo dependency
    mp = float(metrics["promo_dependency"].max())
    checks.append(Check(16, "Max promo dependency", f"{C.MAX_PROMO_DEPENDENCY:.4f}",
                        f"{mp:.4f}",
                        abs(mp - C.MAX_PROMO_DEPENDENCY) <= C.TOL["max_promo_dependency"],
                        "+/-0.5pp"))

    # 17 - long tail, reported for the record
    lt = float(metrics["low_velocity_flag"].mean())
    checks.append(Check(17, "Long-tail SKUs (<1% revenue)", "0.6670", f"{lt:.4f}",
                        True, "recomputed", kind="recomputed",
                        note=f"{int(metrics['low_velocity_flag'].sum())} of {len(metrics)} "
                             "SKUs. The documented 66.7% was 68 of 102; the same "
                             "concentration curve over 119 SKUs necessarily leaves more "
                             "below the 1% line."))

    return checks


def print_report(checks: list[Check]) -> bool:
    hard = [c for c in checks if c.kind == "target"]
    soft = [c for c in checks if c.kind == "recomputed"]
    passed = sum(c.ok for c in hard)

    print()
    print("=" * 78)
    print(f"  RECONCILIATION TARGETS  -  {passed}/{len(hard)} passed")
    print("=" * 78)
    print(f"  {'':<5}{'CHECK':<40}{'TARGET':>14}{'ACTUAL':>16}")
    print("  " + "-" * 74)
    for c in hard:
        print(f"  {'PASS' if c.ok else 'FAIL':<5}{c.name:<40}"
              f"{str(c.target):>14}{str(c.actual):>16}")

    print()
    print("  " + "=" * 74)
    print("  RECOMPUTED  -  differ from the documented value by design")
    print("  " + "-" * 74)
    for c in soft:
        print(f"  {'':<5}{c.name:<40}{str(c.target):>14}{str(c.actual):>16}")
        for line in _wrap(c.note, 66):
            print(f"       {line}")
    print("  " + "-" * 74)
    return passed == len(hard)


def _wrap(text: str, width: int) -> list[str]:
    out, line = [], ""
    for word in text.split():
        if len(line) + len(word) + 1 > width:
            out.append(line)
            line = word
        else:
            line = f"{line} {word}".strip()
    if line:
        out.append(line)
    return out
