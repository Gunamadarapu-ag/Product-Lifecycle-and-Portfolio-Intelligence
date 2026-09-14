"""
Emit src/constants/generated.ts from the generated dataset.

Replaces the hardcoded literals that were typed in from a Colab notebook with
values computed from the 368k-row fact table. The dashboard imports these; the
figures now trace back to data instead of to a transcription.

    python data/generator/export_ts.py

Scope: the arrays whose shape and identifiers are unaffected by the migration.
SKUS is deliberately NOT emitted here - see TODO.md, it needs a threshold audit
first because components disagree about the scale of `rev` and `stockouts`.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

import pandas as pd

import config as C

OUT = C.REPO / "src" / "constants" / "generated.ts"


def ts(value) -> str:
    """Render a Python value as a TypeScript literal."""
    if isinstance(value, str):
        return json.dumps(value)
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "null"
    if isinstance(value, float):
        return f"{value:.4f}".rstrip("0").rstrip(".") or "0"
    return str(value)


def obj(d: dict) -> str:
    return "{ " + ", ".join(f"{k}: {ts(v)}" for k, v in d.items()) + " }"


def arr(rows: list[dict], indent: str = "  ") -> str:
    return "[\n" + "".join(f"{indent}{obj(r)},\n" for r in rows) + "]"


def load() -> dict[str, pd.DataFrame]:
    names = ["dim_country", "dim_channel", "dim_sku", "dim_category",
             "sku_metrics", "portfolio_metrics", "dim_date"]
    out = {n: pd.read_csv(C.OUT_DIR / f"{n}.csv") for n in names}
    out["fact"] = pd.read_parquet(C.OUT_DIR / "fact_sales.parquet")
    out["dim_date"]["date_key"] = pd.to_datetime(out["dim_date"]["date_key"])
    out["fact"]["date_key"] = pd.to_datetime(out["fact"]["date_key"])
    return out


def main() -> int:
    d = load()
    m, p = d["sku_metrics"], d["portfolio_metrics"].iloc[0]
    sku = d["dim_sku"].merge(
        d["dim_category"][["category_id", "category_name"]], on="category_id", how="left"
    )
    f = d["fact"].merge(d["dim_date"][["date_key", "year"]], on="date_key", how="left")
    f["gross_margin"] = f["net_sales"] - f["units_sold"] * f["purchase_cost"]
    rept = f[f["year"] == C.REPORT_YEAR]

    name_of = sku.set_index("sku_id")["sku_name"]
    cat_of = sku.set_index("sku_id")["category_name"]

    # ── Regional ────────────────────────────────────────────────────────────
    by_c = rept.groupby("country_id").agg(
        net=("net_sales", "sum"), gm=("gross_margin", "sum")
    )
    regional = []
    for _, r in d["dim_country"].iterrows():
        row = by_c.loc[r["country_id"]]
        regional.append({
            "country": r["country_name"],
            "skuCount": int(r["listed_sku_count"]),
            "netSalesM": round(float(row["net"]) / 1e6, 1),
            "marginPct": round(float(row["gm"] / row["net"]) * 100, 2),
            "complexityLabel": r["complexity_label"],
        })

    # ── Channel ─────────────────────────────────────────────────────────────
    by_ch = rept.groupby("channel_id").agg(
        net=("net_sales", "sum"), gm=("gross_margin", "sum")
    )
    stock_ch = f.groupby("channel_id")["stock_out_flag"].sum()
    # Volatility per channel: CV of monthly net sales.
    monthly_ch = f.assign(ym=f["date_key"].dt.to_period("M")).groupby(
        ["channel_id", "ym"])["net_sales"].sum()
    cv_ch = monthly_ch.groupby("channel_id").std() / monthly_ch.groupby("channel_id").mean()
    channel = []
    for _, r in d["dim_channel"].iterrows():
        cid = r["channel_id"]
        channel.append({
            "channel": r["channel_name"],
            "marginPct": round(float(by_ch.loc[cid, "gm"] / by_ch.loc[cid, "net"]) * 100, 2),
            "volatilityCV": round(float(cv_ch.loc[cid]), 3),
            "stockoutCount": int(stock_ch.loc[cid]),
        })

    # ── PCI drivers ─────────────────────────────────────────────────────────
    pci = [
        ("Supplier Fragmentation Index", "supplier_fragmentation", 1.0000),
        ("SKU Proliferation Index", "sku_proliferation", 0.8500),
        ("Low Velocity SKU %", "low_velocity_pct", 0.4000),
        ("Lead Time Instability (CV)", "lead_time_instability", 0.1500),
        ("Promo Dependency Score", "promo_dependency_score", 0.0800),
        ("Avg Portfolio Volatility CV", "avg_volatility_cv", 0.0800),
    ]
    pci_drivers = [
        {"label": lab, "value": round(float(p[col]), 4), "benchmark": bench}
        for lab, col, bench in pci
    ]

    # ── Stockout top 10 ─────────────────────────────────────────────────────
    top_so = m.nlargest(10, "total_stockouts")
    stockout = [{
        "name": name_of[r.sku_id],
        "category": cat_of[r.sku_id],
        "stockoutCount": int(r.total_stockouts),
        "safetyStockRatio": round(float(r.ss_to_revenue_ratio), 6),
        "netSalesM": round(float(r.total_net_sales) / 1e6, 2),
        "segment": r.portfolio_segment,
    } for r in top_so.itertuples()]

    # ── Top SKUs by revenue ─────────────────────────────────────────────────
    top_rev = m.nlargest(5, "total_net_sales")
    top_skus = [{
        "name": name_of[r.sku_id],
        "category": cat_of[r.sku_id],
        "netSalesM": round(float(r.total_net_sales) / 1e6, 2),
        "grossMarginM": round(float(r.total_gross_margin) / 1e6, 2),
    } for r in top_rev.itertuples()]

    # ── Rationalization scenarios ───────────────────────────────────────────
    ranked = m.sort_values("total_net_sales")          # worst first
    ss_total = float(m["safety_stock_proxy"].sum())
    gm_total = float(m["total_gross_margin"].sum())
    scenarios = []
    for label, pct in (("Bottom 10%", 0.10), ("Bottom 20%", 0.20), ("Bottom 30%", 0.30)):
        k = int(round(len(ranked) * pct))
        cohort = ranked.head(k)
        scenarios.append({
            "label": label,
            "skusRemoved": k,
            "revenueImpact": -round(float(cohort["revenue_share_pct"].sum()) * 100, 2),
            "marginImpact": -round(float(cohort["total_gross_margin"].sum()) / gm_total * 100, 2),
            "safetyStockFreed": round(float(cohort["safety_stock_proxy"].sum()) / ss_total * 100, 2),
            "supplierReduction": 0,
        })
    rat = m[m["portfolio_segment"] == "Rationalize"]
    scenarios.append({
        "label": "Full Rationalize",
        "skusRemoved": int(len(rat)),
        "revenueImpact": -round(float(rat["revenue_share_pct"].sum()) * 100, 2),
        "marginImpact": -round(float(rat["total_gross_margin"].sum()) / gm_total * 100, 2),
        "safetyStockFreed": round(float(rat["safety_stock_proxy"].sum()) / ss_total * 100, 2),
        "supplierReduction": 0,
    })

    # ── KPI values ──────────────────────────────────────────────────────────
    tail_risk = float(rat["revenue_share_pct"].sum()) * 100
    long_tail = float(p["long_tail_pct"]) * 100
    kpis = {
        "Net Sales (Portfolio)": {
            "value": f"${float(p['total_net_sales'])/1e6:.0f}M",
            "trendValue": f"+{float(p['yoy_growth'])*100:.1f}% YoY",
        },
        "Avg Gross Margin": {
            "value": f"{float(p['avg_gross_margin_pct'])*100:.2f}%",
            "trendValue": f"{(float(p['avg_gross_margin_pct'])*100 - 40.0):.2f}% vs bench",
        },
        "Revenue Concentration": {
            "value": f"{float(p['top10pct_revenue_share'])*100:.2f}%",
            "trendValue": "Top 10% SKUs",
        },
        "Portfolio PCI": {
            "value": f"{float(p['portfolio_complexity_index']):.4f}",
            "trendValue": f"Target: {C.PCI_BENCHMARK:.4f}",
        },
        "Long-Tail SKU Burden": {
            "value": f"{long_tail:.1f}%",
            "trendValue": f"{int(m['low_velocity_flag'].sum())} SKUs <1% rev",
        },
        "Rationalize Candidates": {
            "value": f"{len(rat)} SKUs",
            "trendValue": f"-{tail_risk:.2f}% tail risk",
        },
        "Peak Stockout Freq.": {
            "value": f"{int(m['total_stockouts'].max())} events",
            "trendValue": name_of[int(m.loc[m['total_stockouts'].idxmax(), 'sku_id'])],
        },
        "Revenue Tail Risk": {
            "value": f"{tail_risk:.2f}%",
            "trendValue": "Full Rat. scenario",
        },
    }

    meta = {
        "seed": C.SEED,
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "factRows": int(len(f)),
        "skuCount": int(len(sku)),
        "window": f"{C.START_DATE}..{C.END_DATE}",
        "reportYear": C.REPORT_YEAR,
        "currency": "USD",
    }

    body = f"""/**
 * AUTO-GENERATED - do not edit by hand.
 *
 * Emitted by data/generator/export_ts.py from the dataset in data/output/.
 * Regenerate with:
 *     python data/generator/main.py && python data/generator/export_ts.py
 *
 * Every figure here is computed from the {meta['factRows']:,}-row fact table rather
 * than transcribed from a notebook. Values are USD; monetary figures are $M for
 * the report year ({C.REPORT_YEAR}).
 */

import {{ ChannelData, RegionalData, StockoutItem, PCIDriver, TopSKU,
         RationalizationScenario }} from '../types/dashboard';

export const GENERATED_META = {obj(meta)} as const;

/** KPI label -> computed display values. Labels match the KPIS array in data.ts. */
export const GENERATED_KPI_VALUES: Record<string, {{ value: string; trendValue: string }}> = {{
{chr(10).join(f"  {json.dumps(k)}: {obj(v)}," for k, v in kpis.items())}
}};

export const GENERATED_REGIONAL_DATA: RegionalData[] = {arr(regional)};

export const GENERATED_CHANNEL_DATA: ChannelData[] = {arr(channel)};

export const GENERATED_PCI_DRIVERS: PCIDriver[] = {arr(pci_drivers)};

export const GENERATED_STOCKOUT_TOP10: StockoutItem[] = {arr(stockout)};

export const GENERATED_TOP_SKUS_REVENUE: TopSKU[] = {arr(top_skus)};

export const GENERATED_RATIONALIZATION_SCENARIOS: RationalizationScenario[] = {arr(scenarios)};
"""

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="utf-8")

    print(f"wrote {OUT.relative_to(C.REPO)}  ({len(body):,} bytes)")
    print(f"  KPI values        {len(kpis)}")
    print(f"  regional          {len(regional)}")
    print(f"  channel           {len(channel)}")
    print(f"  pci drivers       {len(pci_drivers)}")
    print(f"  stockout top10    {len(stockout)}")
    print(f"  top SKUs          {len(top_skus)}")
    print(f"  scenarios         {len(scenarios)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
