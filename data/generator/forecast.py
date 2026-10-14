"""
Monthly demand forecast per SKU x country (fact_forecast), one month ahead.

The forecast for month m is made on the first day of m-1, so it can only use
actuals up to the end of m-2. With enough history it is statistical: the trailing
mean, adjusted by the category's expected seasonal curve and, from the second
year, blended with the same month last year. Without enough history (the first
months of the data, or a fresh launch) it is labelled judgemental. Each SKU then
carries its own bias and an error that grows with its demand volatility, so
forecast accuracy differs by SKU the way it does in practice.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C
from demand import _seasonality


def build_forecast(fact: pd.DataFrame, sku: pd.DataFrame, launches: pd.DataFrame,
                   rng: np.random.Generator) -> pd.DataFrame:
    s = sku.set_index("sku_id")
    f = fact.assign(month_start=pd.to_datetime(fact["date_key"]).dt.to_period("M").dt.to_timestamp())
    actual = f.groupby(["sku_id", "country_id", "month_start"])["units_sold"].sum()

    sku_month = f.groupby(["sku_id", "month_start"])["units_sold"].sum()
    stats = sku_month.groupby("sku_id").agg(["std", "mean"])
    cv = (stats["std"] / stats["mean"]).fillna(0.0)

    all_months = pd.date_range(C.START_DATE, C.END_DATE, freq="MS")
    launch = launches.set_index("sku_id")["launch_date"]

    bias = pd.Series(rng.normal(C.FORECAST_BIAS_MEAN, C.FORECAST_BIAS_SD, len(s)), index=s.index)

    rows = []
    for (k, c), series in actual.groupby(level=["sku_id", "country_id"]):
        series = series.droplevel([0, 1])
        start = max(pd.Timestamp(C.START_DATE), pd.Timestamp(launch[k]).to_period("M").to_timestamp())
        months = all_months[all_months >= start]
        units = series.reindex(months, fill_value=0).astype(float)
        prof = s.at[k, "seasonality_profile"]
        amp = C.SEASONALITY_AMPLITUDE[prof]
        sd = C.FORECAST_NOISE_BASE + C.FORECAST_NOISE_PER_CV * float(cv.get(k, 0.0))

        for i, m in enumerate(months):
            known = units.iloc[: max(0, i - 1)]             # actuals up to end of m-2
            if len(known) >= C.FORECAST_HISTORY_MONTHS:
                last = known.iloc[-C.FORECAST_HISTORY_MONTHS:]
                idx_m = _seasonality(np.array([m.month]), prof, amp)[0]
                idx_last = _seasonality(last.index.month.to_numpy(), prof, amp).mean()
                stat = last.mean() * idx_m / idx_last
                ly = m - pd.DateOffset(years=1)
                if ly in known.index:
                    ly_last = known.reindex(last.index - pd.DateOffset(years=1)).sum()
                    trend = (last.sum() / ly_last - 1.0) if ly_last > 0 else 0.0
                    stat = 0.5 * stat + 0.5 * known[ly] * (1.0 + np.clip(trend, -0.5, 0.5))
                method = "statistical"
                fc = stat * (1.0 + bias[k]) * rng.lognormal(0.0, sd)
            else:
                method = "judgemental (no history)"
                fc = units.iloc[i] * rng.lognormal(0.0, C.FORECAST_NO_HISTORY_SD)
            rows.append({"month_start": m, "sku_id": int(k), "country_id": int(c),
                         "forecast_units": int(max(0, round(fc))),
                         "created_on": (m - pd.DateOffset(months=1)).normalize(),
                         "forecast_method": method})
    return pd.DataFrame(rows)
