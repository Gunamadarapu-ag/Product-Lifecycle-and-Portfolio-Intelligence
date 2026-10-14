"""
Weekly distribution-centre inventory per SKU x country (fact_inventory).

Periodic review, order-up-to policy:
    order-up-to S = demand_rate x (L + 1) + safety stock
    safety stock  = z x sd(weekly demand) x sqrt(L + 1)
with L the SKU's lead time in weeks and demand_rate a trailing weekly mean.

Sold units are fact_sales, summed per week - the inventory never decides what
sold. If scheduled receipts cannot cover a week's sales, an expedited receipt
does, and is recorded separately, so stock never goes negative and the identity
    closing = opening + receipts + expedited - sold
holds exactly.

fact_sales stockouts are store-shelf events; this is DC stock. The two are linked,
not identical: in a week with several store stockout days the scheduled receipt
slips a week (a supply disruption), which pulls DC cover down.
"""

from __future__ import annotations

import math

import numpy as np
import pandas as pd

import config as C


def build_inventory(fact: pd.DataFrame, sku: pd.DataFrame, launches: pd.DataFrame) -> pd.DataFrame:
    s = sku.set_index("sku_id")
    f = fact.assign(d=pd.to_datetime(fact["date_key"]))
    # Weeks start on Monday; 2024-01-01 is a Monday.
    f["week_start"] = f["d"] - pd.to_timedelta(f["d"].dt.weekday, unit="D")
    weekly = f.groupby(["sku_id", "country_id", "week_start"]).agg(
        sold=("units_sold", "sum"), so_days=("stock_out_flag", "sum"))

    all_weeks = pd.date_range(C.START_DATE, C.END_DATE, freq="W-MON")
    launch = launches.set_index("sku_id")["launch_date"]
    z, win = C.INVENTORY_SERVICE_Z, C.INVENTORY_DEMAND_WINDOW_WEEKS

    rows = []
    for (k, c), g in weekly.groupby(level=["sku_id", "country_id"]):
        g = g.droplevel([0, 1])
        lw = pd.Timestamp(launch[k])
        start = max(pd.Timestamp(C.START_DATE), lw - pd.Timedelta(days=lw.weekday()))
        weeks = all_weeks[all_weeks >= start]
        sold = g["sold"].reindex(weeks, fill_value=0).to_numpy(dtype=np.int64)
        so_days = g["so_days"].reindex(weeks, fill_value=0).to_numpy(dtype=np.int64)
        L = max(1, math.ceil(float(s.at[k, "lead_time_days"]) / 7.0))

        # Opening position from the first weeks' demand (a starting assumption).
        init = sold[:win] if len(sold) >= 1 else np.array([0])
        rate, sd = float(init.mean()), float(init.std())
        on_hand = int(round(rate * (L + 1) + z * sd * math.sqrt(L + 1)))
        pipeline = [0] * (L + 2)          # receipts due, by weeks from now

        for i, w in enumerate(weeks):
            hist = sold[max(0, i - win):i] if i > 0 else init
            rate, sd = float(hist.mean()), float(hist.std())
            safety = int(round(z * sd * math.sqrt(L + 1)))
            target = rate * (L + 1) + safety

            receipt = pipeline.pop(0)
            pipeline.append(0)
            if so_days[i] >= C.INVENTORY_DISRUPTION_STOCKOUT_DAYS and receipt > 0:
                pipeline[0] += receipt        # supplier delay: slips a week
                receipt = 0

            opening = on_hand
            expedited = max(0, int(sold[i]) - (opening + receipt))
            closing = opening + receipt + expedited - int(sold[i])

            on_order = sum(pipeline)
            order = max(0, int(round(target - (closing + on_order))))
            pipeline[L - 1] += order          # arrives in L weeks
            on_order = sum(pipeline)

            # Days of cover is not stored - it is closing / trailing daily sales,
            # computed downstream like every other derived figure.
            rows.append({"week_start": w, "sku_id": int(k), "country_id": int(c),
                         "opening_units": opening, "receipts_units": receipt,
                         "expedited_units": expedited, "sold_units": int(sold[i]),
                         "closing_units": closing, "on_order_units": on_order,
                         "safety_stock_units": safety})
            on_hand = closing
    return pd.DataFrame(rows)
