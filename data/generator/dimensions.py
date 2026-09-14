"""Build the dimension frames: countries, channels, categories, brands, suppliers, calendar."""

from __future__ import annotations

import calendar as _cal

import pandas as pd

import config as C


def build_countries() -> pd.DataFrame:
    return pd.DataFrame(
        C.COUNTRIES,
        columns=[
            "country_id",
            "country_name",
            "region",
            "complexity_label",
            "listed_sku_count",
            "revenue_share_target",
        ],
    )


def build_channels() -> pd.DataFrame:
    return pd.DataFrame(
        C.CHANNELS,
        columns=["channel_id", "channel_name", "revenue_share_target", "stockout_share_target"],
    )


def build_categories() -> pd.DataFrame:
    return pd.DataFrame(
        C.CATEGORIES, columns=["category_id", "category_name", "seasonality_profile"]
    )


def build_brands() -> pd.DataFrame:
    return pd.DataFrame(C.BRANDS, columns=["brand_id", "brand_name", "brand_role"])


def build_suppliers() -> pd.DataFrame:
    """S001..S060. Home market is left NULL - suppliers are not market-specific here."""
    rows = [
        {"supplier_id": f"S{i:03d}", "supplier_name": f"Supplier {i:03d}", "country_id": None}
        for i in range(1, C.SUPPLIER_COUNT + 1)
    ]
    return pd.DataFrame(rows)


def build_calendar() -> pd.DataFrame:
    """One row per day, 2024-01-01 to 2025-12-31 (730 rows)."""
    dates = pd.date_range(C.START_DATE, C.END_DATE, freq="D")
    df = pd.DataFrame({"date_key": dates})
    iso = df["date_key"].dt.isocalendar()

    df["year"] = df["date_key"].dt.year.astype("int16")
    df["quarter"] = df["date_key"].dt.quarter.astype("int16")
    df["month"] = df["date_key"].dt.month.astype("int16")
    df["month_name"] = df["date_key"].dt.month.map(lambda m: _cal.month_name[m])
    df["week"] = iso["week"].astype("int16")
    # Postgres convention: 0 = Sunday. pandas dayofweek is 0 = Monday.
    df["day_of_week"] = ((df["date_key"].dt.dayofweek + 1) % 7).astype("int16")
    df["is_weekend"] = df["day_of_week"].isin([0, 6])

    return df


def build_all() -> dict[str, pd.DataFrame]:
    return {
        "dim_country": build_countries(),
        "dim_channel": build_channels(),
        "dim_category": build_categories(),
        "dim_brand": build_brands(),
        "dim_supplier": build_suppliers(),
        "dim_date": build_calendar(),
    }
