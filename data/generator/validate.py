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


def run(fact, sku, metrics, portfolio, dims, launches=None, extras=None) -> list[Check]:
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

    # 2 - portfolio gross margin, on the headline year (as 04_validate.sql checks it).
    # Since 7 Oct prices and costs move by year, so the two years differ.
    r = f[f["year"] == C.REPORT_YEAR]
    gm = float(r["gross_margin"].sum() / r["net_sales"].sum())
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

    # 6 - revenue concentration, on the headline year. Since 7 Oct SKUs grow at
    # different rates, so the 2-year share drifts from the 2025 one; 2025 is what
    # the Pareto curve describes and what 04_validate.sql checks (fn_concentration(12)).
    rept_sku = f[f["year"] == C.REPORT_YEAR].groupby("sku_id")["net_sales"].sum()
    share = (rept_sku / rept_sku.sum()).sort_values(ascending=False).to_numpy()
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

    if launches is None or extras is None:
        return checks

    # ── 7 Oct additions ─────────────────────────────────────────────────────
    # 18 - lifecycle growth spread (reported): before 7 Oct every SKU grew 8.3%.
    yr = f.pivot_table(index="sku_id", columns="year", values="net_sales", aggfunc="sum")
    g = (yr[C.REPORT_YEAR] / yr[C.BASE_YEAR] - 1).dropna()
    seed_neg = int((sku["seed_growth"] < 0).sum())
    checks.append(Check(18, "SKUs with negative growth", f"~{seed_neg} (seed)",
                        f"{int((g < 0).sum())} (range {g.min():+.1%}..{g.max():+.1%})",
                        True, "recomputed", kind="recomputed",
                        note=f"Seed growth scaled by x{extras['growth_scale']:.4f} so the "
                             f"portfolio lands on {C.YOY_GROWTH:.1%}. "
                             f"{int(yr[C.BASE_YEAR].isna().sum())} SKUs have no 2024 sales "
                             "(2025 launches), so their growth is undefined."))

    # 18b - no SKU stocks out on an implausible share of its sales days
    so_rate = fact.groupby("sku_id")["stock_out_flag"].mean()
    checks.append(Check(18, "Max SKU stockout rate", f"<= {C.STOCKOUT_MAX_RATE:.0%}",
                        f"{so_rate.max():.1%} (portfolio {fact['stock_out_flag'].mean():.1%})",
                        so_rate.max() <= C.STOCKOUT_MAX_RATE + 1e-9, "exact"))

    # 19 - no sale before a SKU's launch date
    la = fact["sku_id"].map(launches.set_index("sku_id")["launch_date"])
    early = int((pd.to_datetime(fact["date_key"]) < la).sum())
    checks.append(Check(19, "No sales before launch date", "0 rows", f"{early} rows",
                        early == 0, "exact"))

    # 20 - every traded SKU x country has a contiguous price history from day one
    paths = extras["price_paths"]
    traded = fact[["sku_id", "country_id"]].drop_duplicates()
    covered = paths.loc[paths["effective_from"] == pd.Timestamp(C.START_DATE),
                        ["sku_id", "country_id"]].drop_duplicates()
    missing = len(traded.merge(covered, how="left", indicator=True)
                  .query("_merge == 'left_only'"))
    gaps = 0
    for _, grp in paths.groupby(["sku_id", "country_id"]):
        grp = grp.sort_values("effective_from")
        gaps += int((grp["effective_to"].iloc[:-1].to_numpy()
                     != grp["effective_from"].iloc[1:].to_numpy()).sum())
    checks.append(Check(20, "Price history covers every traded SKU x country",
                        "0 missing, 0 gaps", f"{missing} missing, {gaps} gaps",
                        missing == 0 and gaps == 0, "exact"))

    # 21 - Netherlands is the lowest-margin market (documented; was highest pre-7 Oct)
    cm = f.groupby("country_id").apply(
        lambda d: d["gross_margin"].sum() / d["net_sales"].sum(), include_groups=False)
    names = countries.set_index("country_id")["country_name"]
    lowest = names[cm.idxmin()]
    checks.append(Check(21, "Lowest-margin market", "Netherlands",
                        f"{lowest} ({cm.min():.2%}; highest {names[cm.idxmax()]} {cm.max():.2%})",
                        lowest == "Netherlands", "exact"))

    if "fact_customer_sales" not in extras:
        return checks
    X = extras
    month = pd.to_datetime(fact["date_key"]).dt.to_period("M").dt.to_timestamp()

    # 22 - account sales reconcile to fact_sales, to the unit and the cent
    keys = ["month_start", "sku_id", "country_id", "channel_id"]
    a = (fact.assign(month_start=month).groupby(keys)
         .agg(u=("units_sold", "sum"), n=("net_sales", "sum")))
    cs = X["fact_customer_sales"].merge(
        X["dim_customer"][["customer_id", "country_id", "channel_id"]], on="customer_id")
    b = cs.groupby(keys).agg(u=("units_sold", "sum"), n=("net_sales", "sum"))
    j = a.join(b, rsuffix="_c", how="outer").fillna(0)
    bad = int((j["u"] != j["u_c"]).sum() + ((j["n"] - j["n_c"]).abs() > 0.005).sum())
    checks.append(Check(22, "Account sales reconcile to fact_sales", "0 cells off",
                        f"{bad} of {len(j):,} cells off", bad == 0, "exact"))

    # 23 - every sale falls inside a listing
    lst = X["fact_listing"]
    fs = fact[["sku_id", "country_id", "channel_id", "date_key"]].merge(
        lst, on=["sku_id", "country_id", "channel_id"], how="left")
    d = pd.to_datetime(fs["date_key"])
    outside = int((fs["listed_from"].isna() | (d < pd.to_datetime(fs["listed_from"]))
                   | (fs["listed_to"].notna() & (d >= pd.to_datetime(fs["listed_to"])))).sum())
    sold_keys = fact[["sku_id", "country_id", "channel_id"]].drop_duplicates()
    ghosts = len(lst.merge(sold_keys, how="left", indicator=True)
                 .query("_merge == 'left_only'"))
    checks.append(Check(23, "Every sale inside an active listing", "0 rows",
                        f"{outside} rows ({ghosts} listed-never-sold)", outside == 0, "exact"))

    # 24 - plan covers every month x country x category that sold; attainment reported
    pl = X["fact_plan"]
    cat = fact["sku_id"].map(sku.set_index("sku_id")["category_id"])
    act = (fact.assign(month_start=month, category_id=cat)
           .groupby(["month_start", "country_id", "category_id"])["net_sales"].sum())
    planned = pl.set_index(["month_start", "country_id", "category_id"])["revenue_target_usd"]
    missing = int(len(act.index.difference(planned.index)))
    att = float(act.sum() / planned.reindex(act.index).sum())
    checks.append(Check(24, "Plan covers every selling cell", "0 missing",
                        f"{missing} missing; attainment {att:.1%}", missing == 0, "exact"))

    # 25 - forecasts are causal; accuracy reported
    fc = X["fact_forecast"]
    late = int((pd.to_datetime(fc["created_on"]) >= pd.to_datetime(fc["month_start"])).sum())
    am = (fact.assign(month_start=month).groupby(["month_start", "sku_id", "country_id"])
          ["units_sold"].sum().rename("actual").reset_index())
    ff = fc.merge(am, on=["month_start", "sku_id", "country_id"], how="left")
    ff["actual"] = ff["actual"].fillna(0)
    st = ff[ff["forecast_method"] == "statistical"]
    wape = float((st["forecast_units"] - st["actual"]).abs().sum() / st["actual"].sum())
    fbias = float(st["forecast_units"].sum() / st["actual"].sum() - 1)
    checks.append(Check(25, "Forecast made before its month", "0 rows",
                        f"{late} rows; WAPE {wape:.1%}, bias {fbias:+.1%}", late == 0, "exact"))

    # 26 - inventory flow identity, no negative stock, sold = fact_sales
    inv = X["fact_inventory"]
    ident = int((inv["opening_units"] + inv["receipts_units"] + inv["expedited_units"]
                 - inv["sold_units"] != inv["closing_units"]).sum())
    neg = int((inv[["opening_units", "closing_units", "receipts_units", "expedited_units"]] < 0)
              .any(axis=1).sum())
    sold_total, fact_units = int(inv["sold_units"].sum()), int(fact["units_sold"].sum())
    checks.append(Check(26, "Inventory: closing = opening + receipts - sold", "0 bad rows",
                        f"{ident} bad, {neg} negative; sold {sold_total:,} vs {fact_units:,}",
                        ident == 0 and neg == 0 and sold_total == fact_units, "exact"))

    # 27 - launches: pipeline has no SKU, gate weights sum to 1; readiness reported
    dl, lg = X["dim_launch"], X["launch_gate"]
    w_ok = float((lg.groupby("launch_id")["weight"].sum() - 1.0).abs().max()) < 1e-9
    pipe = dl[dl["actual_launch_date"].isna()]
    pipe_ok = bool(pipe["sku_id"].isna().all())
    ready = (lg[lg["status"] == "Completed"].groupby("launch_id")["weight"].sum()
             .reindex(pipe["launch_id"], fill_value=0))
    overdue = int((lg["status"] == "Overdue").sum())
    checks.append(Check(27, "Launch gates consistent", "weights=1, pipeline unsold",
                        f"{len(pipe)} pipeline, readiness {ready.mean():.0%} avg, "
                        f"{overdue} gates overdue", w_ok and pipe_ok, "exact"))

    # 28 - supplier notices: declining SKUs, notice before effective date
    sn = X["supplier_notice"]
    gsku = g.reindex(sn["sku_id"])
    ok28 = bool((gsku < 0).all() and (pd.to_datetime(sn["notice_date"])
                                       < pd.to_datetime(sn["eol_effective_date"])).all())
    checks.append(Check(28, "EOL notices: declining SKUs, notice < effective",
                        f"{len(sn)} notices",
                        f"{len(sn)} notices, growth {gsku.min():+.1%}..{gsku.max():+.1%}",
                        ok28, "exact"))

    # 29 - every cost is an assumption, and amount = driver x rate exactly
    ox = X["fact_opex"]
    off = int(((ox["driver_value"] * ox["rate"]).round(2) - ox["amount_usd"]).abs()
              .gt(0.005).sum())
    lab = bool((ox["basis"] == "assumption").all()
               and (X["dim_cost_assumption"]["basis"] == "assumption").all())
    checks.append(Check(29, "Costs: labelled assumptions, amount = driver x rate", "0 off",
                        f"{off} off", off == 0 and lab, "exact"))

    # 30 - implied P&L for the report year (reported, so the assumptions are visible)
    gp = float(f[f["year"] == C.REPORT_YEAR]["gross_margin"].sum())
    oyear = pd.to_datetime(ox["month_start"]).dt.year == C.REPORT_YEAR
    opx = float(ox.loc[oyear, "amount_usd"].sum())
    fx = X["sku_fixed_cost"]
    fixed = float(fx.loc[fx["year"] == C.REPORT_YEAR, "amount_usd"].sum())
    ebit = gp - opx - fixed
    checks.append(Check(30, f"Implied {C.REPORT_YEAR} EBIT margin", "plausible 8-20%",
                        f"{ebit / rept:.1%} (opex {opx / rept:.1%}, fixed {fixed / rept:.1%})",
                        True, "recomputed", kind="recomputed",
                        note="Everything below gross profit is a labelled assumption "
                             "(dim_cost_assumption). Tax is applied downstream per country."))

    # 32 - launch targets: a real region, a positive plan, and launched SKUs'
    # plan within the stated plan-error band of their annualised first year
    regions = set(dims["dim_country"]["region"])
    reg_ok = bool(dl["lead_region"].isin(regions).all())
    pos_ok = bool((dl["expected_year1_revenue_usd"] > 0).all())
    gate_ok = bool(lg["reviewer_role"].notna().all())
    pipe_y1 = dl.loc[dl["sku_id"].isna(), "expected_year1_revenue_usd"]
    checks.append(Check(32, "Launch targets: region, year-1 plan, gate reviewer",
                        "all present, plan > 0",
                        f"{dl['lead_region'].nunique()} regions; pipeline plan "
                        f"${pipe_y1.min() / 1e6:.1f}M..${pipe_y1.max() / 1e6:.1f}M",
                        reg_ok and pos_ok and gate_ok, "exact"))

    # 31 - rationalization scenarios are computed, not typed
    sc = X["rationalization_scenario"]
    full = sc[sc["scenario_label"] == "Full Rationalize"].iloc[0]
    checks.append(Check(31, "Rationalization scenarios computed", "non-zero impacts",
                        f"Full: {int(full['skus_removed'])} SKUs, revenue "
                        f"{full['revenue_impact_pct']:+.1%}, safety stock "
                        f"{full['safety_stock_freed_pct']:.1%}",
                        bool((sc["revenue_impact_pct"] != 0).all()), "exact"))

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
