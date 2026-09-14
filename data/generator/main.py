"""
Generate the FMCG dataset end to end and write it to data/output/.

    python data/generator/main.py

Produces CSVs matching the tables in documentation/data_model_specification.md,
ready for COPY into PostgreSQL. No database connection required.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

import calibrate  # noqa: E402
import config as C  # noqa: E402
import demand  # noqa: E402
import derive  # noqa: E402
import dimensions  # noqa: E402
import sku_master  # noqa: E402
import validate  # noqa: E402

SNAPSHOT = "2026-01-01"

# Columns that exist only to drive generation and are not part of the schema.
GEN_ONLY = [
    "cat", "category_name", "seasonality_profile", "revenue_rank", "revenue_share",
    "seed_growth", "seed_stockouts", "seed_value", "seed_complexity",
]


def main() -> int:
    t0 = time.time()
    rng = np.random.default_rng(C.SEED)
    C.OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"seed={C.SEED}  window={C.START_DATE}..{C.END_DATE}")

    dims = dimensions.build_all()
    print(f"  dimensions      {len(dims['dim_date'])} days, "
          f"{len(dims['dim_country'])} countries, {len(dims['dim_channel'])} channels, "
          f"{len(dims['dim_supplier'])} suppliers")

    sku = sku_master.build_sku_master(rng, dims['dim_country'])
    sku_supplier = sku_master.build_sku_supplier(sku, rng)
    print(f"  sku master      {len(sku)} SKUs, {len(sku_supplier):,} supplier links")

    t = time.time()
    fact = demand.generate(sku, dims, rng)
    fact["gross_margin"] = (
        fact["net_sales"] - fact["units_sold"] * fact["purchase_cost"]
    ).round(2)
    print(f"  transactions    {len(fact):,} rows ({time.time()-t:.1f}s)")

    fact, sku, delta = calibrate.calibrate_margin(fact, sku)
    print(f"  margin calibrated  cost shift {delta:+.4f} "
          f"-> {calibrate.report(fact)['margin_pct']:.4f}")

    t = time.time()
    metrics = derive.build_sku_metrics(fact, sku, dims["dim_date"], SNAPSHOT)
    cann = derive.build_cannibalization(fact, sku, dims["dim_date"])
    metrics = derive.attach_cannibalization_score(metrics, cann)
    portfolio = derive.build_portfolio_metrics(fact, metrics, sku, dims["dim_date"], SNAPSHOT)
    print(f"  derived         {len(metrics)} sku_metrics, {len(cann):,} pairs "
          f"({time.time()-t:.1f}s)")

    scen = pd.DataFrame(
        [(i, lab, 0, 0.0, 0.0, ss, 0.0) for i, lab, _, ss in C.RATIONALIZATION_SCENARIOS],
        columns=["scenario_id", "scenario_label", "skus_removed", "revenue_impact_pct",
                 "margin_impact_pct", "safety_stock_freed_pct", "supplier_reduction_pct"],
    )

    checks = validate.run(fact, sku, metrics, portfolio, dims)
    all_ok = validate.print_report(checks)

    # ── Write outputs ───────────────────────────────────────────────────────
    dim_sku_out = sku.drop(columns=[c for c in GEN_ONLY if c in sku.columns])
    tables = {
        "dim_country": dims["dim_country"],
        "dim_channel": dims["dim_channel"],
        "dim_category": dims["dim_category"],
        "dim_brand": dims["dim_brand"],
        "dim_supplier": dims["dim_supplier"],
        "dim_date": dims["dim_date"],
        "dim_sku": dim_sku_out,
        "sku_supplier": sku_supplier,
        "fact_sales": fact.drop(columns=["gross_margin"]),   # generated in the DB
        "sku_metrics": metrics,
        "sku_cannibalization": cann,
        "portfolio_metrics": portfolio,
        "rationalization_scenario": scen,
    }

    print()
    print("  writing data/output/")
    for name, df in tables.items():
        path = C.OUT_DIR / f"{name}.csv"
        df.to_csv(path, index=False)
        print(f"    {name:<26} {len(df):>9,} rows  {path.stat().st_size/1e6:>7.2f} MB")

    # Parquet copy of the fact table - much smaller, handy for inspection.
    fact.drop(columns=["gross_margin"]).to_parquet(
        C.OUT_DIR / "fact_sales.parquet", index=False
    )

    print(f"\n  done in {time.time()-t0:.1f}s")
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
