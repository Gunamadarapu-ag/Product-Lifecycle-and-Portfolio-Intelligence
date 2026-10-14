"""
Costs below gross profit - ALL ASSUMPTIONS, labelled as such in the data.

The warehouse has revenue and cost of goods. Everything below the gross line -
logistics, warehousing, marketing, SG&A, fixed SKU costs, tax - has no source, so
it is generated from stated assumptions:

- dim_cost_assumption: one row per assumption (key, cost type, driver, rate,
  unit, basis note). This is what a screen should show when asked "where does
  this cost come from".
- fact_opex: month x country x category x assumption, with
      amount_usd = driver_value x rate        (exactly, to the cent)
  so every cost traces to one assumption and one measured driver.
- sku_fixed_cost: annual fixed cost per SKU, for break-even.

Tax rates live in dim_cost_assumption with the other assumptions rather than on
dim_country, so every assumed number sits in one table.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def build_cost_assumptions(countries: pd.DataFrame, channels: pd.DataFrame,
                           brands: pd.DataFrame) -> pd.DataFrame:
    rows = []

    def add(key, cost_type, driver, rate, unit, note):
        rows.append({"assumption_key": key, "cost_type": cost_type, "driver": driver,
                     "rate": rate, "unit": unit, "basis": "assumption", "basis_note": note})

    for _, ctry in countries.iterrows():
        cn = ctry["country_name"]
        for _, ch in channels.iterrows():
            rate = round(C.LOGISTICS_PER_UNIT_USD[ch["channel_name"]]
                         * C.LOGISTICS_COUNTRY_FACTOR[cn], 4)
            add(f"logistics.{ch['channel_name']}.{cn}", "Logistics", "units shipped", rate,
                "USD per unit", "Outbound freight per unit by channel, scaled by a country "
                "distance/labour factor. Illustrative industry-typical rates.")
        add(f"sga.fixed.{cn}", "SG&A (fixed)", "category share of country net sales",
            round(C.SGA_FIXED_ANNUAL_USD * float(ctry["revenue_share_target"]) / 12.0, 2),
            "USD per month", "Fixed overhead per country (offices, management), split "
            "across categories by their share of the country's monthly net sales.")
        add(f"tax.{cn}", "Corporate tax", "profit before tax", C.CORPORATE_TAX_RATE[cn],
            "share of profit", "Statutory headline corporate income tax rate (public figure, "
            "approximate; local surcharges such as German trade tax or Italian IRAP simplified).")

    add("warehousing.carrying", "Warehousing", "average inventory value at cost",
        round(C.CARRYING_COST_RATE / 12.0, 6), "share per month",
        f"Carrying cost of {C.CARRYING_COST_RATE:.0%} a year on DC inventory at cost "
        "(industry rule of thumb, same rate as sku_metrics.inventory_carrying_cost).")
    for _, b in brands.iterrows():
        add(f"marketing.{b['brand_role']}", "Marketing", "net sales",
            C.MARKETING_PCT_BY_BRAND_ROLE[b["brand_role"]], "share of net sales",
            "Above-the-line brand support as a share of sales, by brand role. Promotional "
            "discounts are not here - they are already netted out of net_sales.")
    add("sga.variable", "SG&A (variable)", "net sales", C.SGA_VARIABLE_PCT, "share of net sales",
        "Selling and admin cost that scales with sales.")
    add("sku.fixed", "Fixed SKU cost", "SKU-year",
        C.SKU_FIXED_COST_BASE_USD, "USD per SKU per year",
        f"Artwork, compliance and listing admin: {C.SKU_FIXED_COST_BASE_USD:,} per SKU plus "
        f"{C.SKU_FIXED_COST_PER_MARKET_USD:,} per country listed, per year. Used for break-even.")
    return pd.DataFrame(rows).drop_duplicates("assumption_key").reset_index(drop=True)


def build_opex(fact: pd.DataFrame, sku: pd.DataFrame, inventory: pd.DataFrame,
               countries: pd.DataFrame, channels: pd.DataFrame, brands: pd.DataFrame,
               assumptions: pd.DataFrame) -> pd.DataFrame:
    s = sku.set_index("sku_id")
    rate = assumptions.set_index("assumption_key")["rate"]
    cname = countries.set_index("country_id")["country_name"]
    chname = channels.set_index("channel_id")["channel_name"]
    role = s["brand_id"].map(brands.set_index("brand_id")["brand_role"])

    f = fact.assign(month_start=pd.to_datetime(fact["date_key"]).dt.to_period("M").dt.to_timestamp(),
                    category_id=fact["sku_id"].map(s["category_id"]),
                    brand_role=fact["sku_id"].map(role))
    keys = ["month_start", "country_id", "category_id"]
    parts = []

    # Logistics: units by channel x per-unit rate.
    lg = f.groupby(keys + ["channel_id"], as_index=False)["units_sold"].sum()
    lg["assumption_key"] = ("logistics." + lg["channel_id"].map(chname) + "."
                            + lg["country_id"].map(cname))
    parts.append(lg.rename(columns={"units_sold": "driver_value"})[keys + ["assumption_key", "driver_value"]])

    # Marketing: net sales by brand role x share.
    mk = f.groupby(keys + ["brand_role"], as_index=False)["net_sales"].sum()
    mk["assumption_key"] = "marketing." + mk["brand_role"]
    parts.append(mk.rename(columns={"net_sales": "driver_value"})[keys + ["assumption_key", "driver_value"]])

    # SG&A variable: net sales x share.
    ns = f.groupby(keys, as_index=False)["net_sales"].sum()
    sv = ns.assign(assumption_key="sga.variable").rename(columns={"net_sales": "driver_value"})
    parts.append(sv[keys + ["assumption_key", "driver_value"]])

    # SG&A fixed: country monthly amount x the category's share of country sales.
    share = ns["net_sales"] / ns.groupby(["month_start", "country_id"])["net_sales"].transform("sum")
    sf = ns.assign(driver_value=share.round(6),
                   assumption_key="sga.fixed." + ns["country_id"].map(cname))
    parts.append(sf[keys + ["assumption_key", "driver_value"]])

    # Warehousing: average weekly closing stock at cost, per month.
    inv = inventory.assign(month_start=pd.to_datetime(inventory["week_start"]).dt.to_period("M").dt.to_timestamp(),
                           category_id=inventory["sku_id"].map(s["category_id"]),
                           value=inventory["closing_units"] * inventory["sku_id"].map(s["purchase_cost"]))
    wk = (inv.groupby(keys + ["week_start"], as_index=False)["value"].sum()
             .groupby(keys, as_index=False)["value"].mean())
    wk = wk.assign(assumption_key="warehousing.carrying", driver_value=wk["value"].round(2))
    parts.append(wk[keys + ["assumption_key", "driver_value"]])

    out = pd.concat(parts, ignore_index=True)
    out["rate"] = out["assumption_key"].map(rate)
    out["amount_usd"] = (out["driver_value"] * out["rate"]).round(2)
    out["basis"] = "assumption"
    return out.sort_values(keys + ["assumption_key"]).reset_index(drop=True)


def build_sku_fixed_cost(listing: pd.DataFrame, sku: pd.DataFrame) -> pd.DataFrame:
    """Annual fixed cost per SKU: base + per country listed in that year."""
    rows = []
    for year in (C.BASE_YEAR, C.REPORT_YEAR):
        y0, y1 = pd.Timestamp(year=year, month=1, day=1), pd.Timestamp(year=year, month=12, day=31)
        live = listing[(pd.to_datetime(listing["listed_from"]) <= y1)
                       & (listing["listed_to"].isna() | (pd.to_datetime(listing["listed_to"]) > y0))]
        markets = live.groupby("sku_id")["country_id"].nunique()
        for k in sku["sku_id"]:
            n = int(markets.get(k, 0))
            if n == 0:
                continue
            rows.append({"sku_id": int(k), "year": year, "markets_listed": n,
                         "amount_usd": float(C.SKU_FIXED_COST_BASE_USD
                                             + C.SKU_FIXED_COST_PER_MARKET_USD * n),
                         "assumption_key": "sku.fixed", "basis": "assumption"})
    return pd.DataFrame(rows)
