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
import lifecycle  # noqa: E402
import costs as cost_model  # noqa: E402
import customers as customer_model  # noqa: E402
import forecast as forecast_model  # noqa: E402
import inventory as inventory_model  # noqa: E402
import launches as launch_model  # noqa: E402
import listing as listing_model  # noqa: E402
import plan as plan_model  # noqa: E402
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

    def stream(name: str) -> np.random.Generator:
        # Separate streams for 7 Oct additions; see config.STREAM.
        return np.random.default_rng([C.SEED, C.STREAM[name]])

    launches = lifecycle.assign_launch_dates(sku, stream("lifecycle"))
    sku = sku.assign(launch_date=sku["sku_id"].map(
        launches.set_index("sku_id")["launch_date"]))   # keeps column order

    t = time.time()
    fact, extras = demand.generate(sku, dims, rng, launches, stream("pricing"))
    fact["gross_margin"] = (
        fact["net_sales"] - fact["units_sold"] * fact["purchase_cost"]
    ).round(2)
    print(f"  transactions    {len(fact):,} rows ({time.time()-t:.1f}s)")
    n_in = int(launches["launch_year_in_window"].notna().sum())
    print(f"  lifecycle       growth scale x{extras['growth_scale']:.4f}, "
          f"{n_in} in-window launches, {len(extras['price_paths']):,} price spells")

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

    scen = derive.build_rationalization_scenarios(metrics, sku_supplier)

    # ── 7 Oct additions: tables derived from fact_sales, each on its own stream ─
    t = time.time()
    countries, channels, brands = dims["dim_country"], dims["dim_channel"], dims["dim_brand"]
    rng_c = stream("customers")
    dim_customer = customer_model.build_customers(countries, channels, rng_c)
    cust_sales = customer_model.build_customer_sales(fact, dim_customer, rng_c)
    rng_l = stream("launches")
    dim_launch, launch_gate = launch_model.build_launches(sku, launches, brands, rng_l)
    notices = launch_model.build_supplier_notices(sku, fact, rng_l)
    dim_launch = launch_model.add_launch_targets(dim_launch, fact, sku, countries,
                                                 stream("launch_targets"))
    listing = listing_model.build_listing(fact, sku, launches, countries, channels,
                                          notices, stream("listing"))
    plan = plan_model.build_plan(fact, sku, stream("plan"))
    forecast = forecast_model.build_forecast(fact, sku, launches, stream("forecast"))
    inventory = inventory_model.build_inventory(fact, sku, launches)
    assumptions = cost_model.build_cost_assumptions(countries, channels, brands)
    opex = cost_model.build_opex(fact, sku, inventory, countries, channels, brands, assumptions)
    sku_fixed = cost_model.build_sku_fixed_cost(listing, sku)
    print(f"  7 Oct tables    {len(dim_customer)} accounts, {len(cust_sales):,} account-sales, "
          f"{len(listing):,} listings, {len(forecast):,} forecasts, {len(inventory):,} inventory weeks, "
          f"{len(dim_launch)} launches, {len(opex):,} opex rows ({time.time()-t:.1f}s)")

    extras.update({"dim_customer": dim_customer, "fact_customer_sales": cust_sales,
                   "dim_launch": dim_launch, "launch_gate": launch_gate,
                   "supplier_notice": notices, "fact_listing": listing, "fact_plan": plan,
                   "fact_forecast": forecast, "fact_inventory": inventory,
                   "dim_cost_assumption": assumptions, "fact_opex": opex,
                   "sku_fixed_cost": sku_fixed, "rationalization_scenario": scen})

    checks = validate.run(fact, sku, metrics, portfolio, dims, launches, extras)
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
        "fact_price": extras["price_paths"],
        "dim_customer": dim_customer.drop(columns=["base_share"]),   # generation-only
        "fact_customer_sales": cust_sales,
        "fact_listing": listing,
        "fact_plan": plan,
        "fact_forecast": forecast,
        "fact_inventory": inventory,
        "dim_launch": dim_launch,
        "launch_gate": launch_gate,
        "supplier_notice": notices,
        "dim_cost_assumption": assumptions,
        "fact_opex": opex.drop(columns=["amount_usd"]),   # generated in the DB
        "sku_fixed_cost": sku_fixed,
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
