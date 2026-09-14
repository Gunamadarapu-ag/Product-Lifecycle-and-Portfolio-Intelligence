"""
Build dim_sku and sku_supplier from the 119-SKU seed.

The seed supplies names, categories and behavioural attributes. This module adds
the economics: a Pareto revenue weight, a price/cost pair consistent with the
seed margin, a brand, and supplier links.
"""

from __future__ import annotations

import json

import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

import config as C

# Typical unit price band per category, USD. Sets the units/revenue ratio.
PRICE_BAND = {
    "Beverages": (1.20, 4.00),
    "Snacks": (1.50, 5.00),
    "Dairy": (2.00, 8.00),
    "Household": (3.00, 15.00),
    "Personal Care": (3.00, 12.00),
    "Beauty": (8.00, 40.00),
    "Fashion": (15.00, 60.00),
}


def pareto_shares(n: int) -> np.ndarray:
    """
    Per-SKU revenue shares, rank 1 (largest) first.

    Fits a monotone cubic through the cumulative-share anchors so the top
    10/20/30% land on the documented concentration figures, then differences it.
    """
    p = np.array(sorted(C.PARETO_ANCHORS))
    cum = np.array([C.PARETO_ANCHORS[k] for k in p])
    curve = PchipInterpolator(p, cum)
    edges = curve(np.arange(0, n + 1) / n)
    share = np.diff(edges)
    return share / share.sum()


def effective_shares(w: np.ndarray, listed: list[int], country_share: np.ndarray) -> np.ndarray:
    """
    Realised revenue share per SKU after country listing.

    Revenue is normalised within each market, so a SKU absent from a market has
    its share redistributed to the SKUs present there. Channel share is common to
    all SKUs and cancels out.
    """
    n = len(w)
    eff = np.zeros(n)
    for lc, cs in zip(listed, country_share):
        mask = np.arange(n) < lc          # w is in rank order, best first
        eff[mask] += cs * w[mask] / w[mask].sum()
    return eff


def solve_input_shares(target: np.ndarray, listed: list[int],
                       country_share: np.ndarray, iters: int = 300) -> np.ndarray:
    """
    Find the input weights whose realised shares match the Pareto targets.

    Listing thresholds concentrate revenue - Netherlands stocks only the top 52
    SKUs, so lower-ranked SKUs lose that market and the top decile's realised
    share rises above the curve. Damped fixed-point iteration inverts that.
    """
    w = target.copy()
    for _ in range(iters):
        eff = effective_shares(w, listed, country_share)
        w = w * (target / np.maximum(eff, 1e-15)) ** 0.5
        w = np.maximum(w, 1e-12)
        w /= w.sum()
    return w


def build_sku_master(rng: np.random.Generator,
                     countries: pd.DataFrame | None = None) -> pd.DataFrame:
    seed = pd.DataFrame(json.loads(C.SKU_SEED.read_text(encoding="utf-8")))

    cats = pd.DataFrame(
        C.CATEGORIES, columns=["category_id", "category_name", "seasonality_profile"]
    )
    df = seed.merge(cats, left_on="cat", right_on="category_name", how="left")
    assert df["category_id"].notna().all(), "unmapped category in seed"

    # ── Revenue weight ──────────────────────────────────────────────────────
    # Rank by the seed's own revenue figure so the curve preserves the
    # relative standing already encoded in the master.
    df = df.sort_values("rev", ascending=False).reset_index(drop=True)
    df["revenue_rank"] = np.arange(1, len(df) + 1)

    target = pareto_shares(len(df))
    if countries is not None:
        # Pre-compensate for market listing, so the realised concentration - not
        # the input curve - lands on the documented top 10/20/30% figures.
        df["revenue_share"] = solve_input_shares(
            target,
            countries["listed_sku_count"].tolist(),
            countries["revenue_share_target"].to_numpy(),
        )
    else:
        df["revenue_share"] = target

    # ── Price and cost ──────────────────────────────────────────────────────
    # Higher-ranked SKUs sit toward the upper end of their category band.
    lo = df["cat"].map(lambda c: PRICE_BAND[c][0]).to_numpy()
    hi = df["cat"].map(lambda c: PRICE_BAND[c][1]).to_numpy()
    pos = 1.0 - (df["revenue_rank"].to_numpy() - 1) / len(df)
    jitter = rng.uniform(-0.12, 0.12, len(df))
    df["base_price"] = np.round(lo + (hi - lo) * np.clip(pos + jitter, 0.05, 1.0), 2)

    df["target_margin_pct"] = (df["margin"] / 100.0).round(4)
    df["purchase_cost"] = np.round(
        df["base_price"] * (1.0 - df["target_margin_pct"]), 2
    )
    # Guard the ck_dim_sku_price constraint against a rounding collision.
    too_close = df["purchase_cost"] >= df["base_price"]
    df.loc[too_close, "purchase_cost"] = (df.loc[too_close, "base_price"] - 0.01).round(2)
    df["purchase_cost"] = df["purchase_cost"].clip(lower=0.01)

    # ── Brand ───────────────────────────────────────────────────────────────
    # Round-robin within each category, so every brand spans several categories
    # and every category carries several brands.
    brand_ids = [b[0] for b in C.BRANDS]
    df["brand_id"] = 0
    for _, idx in df.groupby("category_id").groups.items():
        pos_in_cat = np.arange(len(idx))
        df.loc[idx, "brand_id"] = [brand_ids[i % len(brand_ids)] for i in pos_in_cat]

    # ── Supply chain and promo attributes ───────────────────────────────────
    # Long-tail SKUs carry worse supply terms: longer lead times and heavier
    # promo dependence. This is what makes value and complexity negatively
    # correlated, producing the documented heavy Keep-Rationalize diagonal
    # (34/16/16/34) instead of four even quadrants.
    rank_pos = (df["revenue_rank"].to_numpy() - 1) / (len(df) - 1)   # 0 best, 1 worst
    a = C.COMPLEXITY_REVENUE_BIAS

    seed_lead = df["lead"].astype(float).to_numpy()
    lo_l, hi_l = seed_lead.min(), seed_lead.max()
    tail_lead = lo_l + rank_pos * (hi_l - lo_l)
    df["lead_time_days"] = np.round(seed_lead * (1 - a) + tail_lead * a, 2)

    seed_promo = df["promo"].clip(0, 1).to_numpy()
    lo_p, hi_p = seed_promo.min(), seed_promo.max()
    tail_promo = lo_p + rank_pos * (hi_p - lo_p)
    df["promo_propensity"] = np.round(
        np.clip(seed_promo * (1 - a) + tail_promo * a, 0, 1), 4
    )
    df["household_penetration"] = df["householdPenetration"].round(3)

    supplier_ids = [f"S{i:03d}" for i in range(1, C.SUPPLIER_COUNT + 1)]
    df["primary_supplier_id"] = rng.choice(supplier_ids, size=len(df))

    df["launch_date"] = pd.NaT
    df["is_active"] = True

    # Seed attributes carried through for the demand and scoring models.
    df["seed_growth"] = df["growth"]
    df["seed_stockouts"] = df["stockouts"]
    df["seed_value"] = df["val"]
    df["seed_complexity"] = df["cx"]

    df = df.sort_values("sku_id").reset_index(drop=True)

    cols = [
        "sku_id", "sku_name", "brand_id", "category_id", "primary_supplier_id",
        "base_price", "purchase_cost", "target_margin_pct", "lead_time_days",
        "promo_propensity", "household_penetration", "launch_date", "is_active",
        # generator-only columns, dropped before export
        "cat", "category_name", "seasonality_profile", "revenue_rank",
        "revenue_share", "seed_growth", "seed_stockouts", "seed_value",
        "seed_complexity",
    ]
    df = df.rename(columns={"name": "sku_name"})
    return df[cols]


def build_sku_supplier(sku: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    All 60 suppliers cover all 119 SKUs - 7,140 rows.

    The absence of specialisation is the documented finding behind the Supplier
    Fragmentation Index, so it is modelled explicitly rather than assumed away.
    """
    supplier_ids = [f"S{i:03d}" for i in range(1, C.SUPPLIER_COUNT + 1)]
    sku_ids = sku["sku_id"].to_numpy()

    pairs = pd.MultiIndex.from_product(
        [sku_ids, supplier_ids], names=["sku_id", "supplier_id"]
    ).to_frame(index=False)

    primary = sku.set_index("sku_id")["primary_supplier_id"]
    pairs["is_primary"] = pairs["supplier_id"] == pairs["sku_id"].map(primary)
    pairs["unit_cost"] = None

    assert pairs["is_primary"].sum() == len(sku), "exactly one primary supplier per SKU"
    return pairs
