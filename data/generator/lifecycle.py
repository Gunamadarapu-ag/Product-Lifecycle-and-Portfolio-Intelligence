"""
Per-SKU lifecycle: launch dates and year-on-year growth.

Before 7 Oct every combination split its revenue across the two years with the
same fraction, so all 119 SKUs grew at the portfolio rate and none could read as
Intro or Decline. This module gives each SKU its own growth (from the seed) and
its own launch date, while the portfolio totals stay exactly on target.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def assign_launch_dates(sku: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    Launch date for every SKU, and which ones launch inside the dataset window.

    Returns sku_id, launch_date, launch_year_in_window (None / 2024 / 2025).
    """
    s = sku.set_index("sku_id")
    stock_rank = s["seed_stockouts"].rank(ascending=False, method="first")
    eligible = s[(s["revenue_rank"] > C.LAUNCH_MIN_RANK)
                 & (stock_rank > C.LAUNCH_EXCLUDE_TOP_STOCKOUT)
                 & (s["seed_growth"] > 0)]
    if len(eligible) < C.LAUNCHES_2024 + C.LAUNCHES_2025:
        raise ValueError(f"only {len(eligible)} launch candidates; lower LAUNCH_MIN_RANK")
    # Highest seed growth first; a stable sort on sku_id breaks ties reproducibly.
    picks = (eligible.reset_index()
             .sort_values(["seed_growth", "sku_id"], ascending=[False, True])["sku_id"]
             .tolist())
    n24, n25 = C.LAUNCHES_2024, C.LAUNCHES_2025
    # The fastest growers launched in 2024: a partial 2024 is what makes their
    # year-on-year growth so high. 2025 launches have no prior year at all.
    in_2024, in_2025 = picks[:n24], picks[n24:n24 + n25]

    def month_date(year: int, months: tuple[int, int]) -> pd.Timestamp:
        m = int(rng.integers(months[0], months[1] + 1))
        return pd.Timestamp(year=year, month=m, day=1)

    rows = []
    for k, r in s.iterrows():
        if k in in_2024:
            d, w = month_date(2024, C.LAUNCH_2024_MONTHS), 2024
        elif k in in_2025:
            d, w = month_date(2025, C.LAUNCH_2025_MONTHS), 2025
        else:
            g = r["seed_growth"]
            band = ("decline" if g < 0 else
                    "growth" if g >= C.GROWTH_BAND_MATURE else "mature")
            y0, y1 = C.PRE_WINDOW_LAUNCH_YEARS[band]
            d = pd.Timestamp(year=int(rng.integers(y0, y1 + 1)),
                             month=int(rng.integers(1, 13)), day=1)
            w = None
        rows.append({"sku_id": k, "launch_date": d, "launch_year_in_window": w})
    return pd.DataFrame(rows)


def solve_growth(rev_2025: pd.Series, sku: pd.DataFrame,
                 launches: pd.DataFrame) -> tuple[pd.Series, float]:
    """
    Per-SKU growth g such that sum(rev_2025 / (1 + g)) = BASE_YEAR_NET_SALES.

    - 2025 launches: no 2024 revenue at all (g undefined, base = 0).
    - 2024 launches: g follows from launch timing - months on shelf in 2024 at a
      reduced run-rate - not from the seed.
    - Decliners (negative seed growth) keep the seed's figure as is.
    - Growers: seed growth times one common scale `b`, found by bisection so the
      portfolio lands on YOY_GROWTH. Scaling (not shifting) keeps every sign, so
      exactly the seed's decliners decline - a common shift was tried first and
      moved 68 SKUs negative against the seed's 23; a scale on all SKUs kept 23
      but compressed declines to -5%.

    Returns the base-year revenue per SKU and the growth scale applied.
    """
    s = sku.set_index("sku_id")
    L = launches.set_index("sku_id")
    seed_g = s["seed_growth"].reindex(rev_2025.index).astype(float)
    wy = L["launch_year_in_window"].reindex(rev_2025.index)

    base = pd.Series(0.0, index=rev_2025.index)
    is_24 = wy == 2024
    months_on_shelf = 13 - L["launch_date"].reindex(rev_2025.index).dt.month
    base[is_24] = (rev_2025[is_24] * (months_on_shelf[is_24] / 12.0)
                   * C.LAUNCH_YEAR_RUNRATE)

    rest = wy.isna()
    decl = rest & (seed_g < 0)
    grow = rest & (seed_g >= 0)
    base[decl] = rev_2025[decl] / (1.0 + seed_g[decl])
    need = C.BASE_YEAR_NET_SALES - float(base.sum())
    rest = grow

    def base_for(b: float) -> float:
        return float((rev_2025[rest] / (1.0 + b * seed_g[rest])).sum())

    # base_for is decreasing in b when revenue-weighted seed growth is positive.
    # Bracket [0, 3]: b = 0 means every SKU flat; the solve needs b in between.
    lo, hi = 0.0, 3.0
    if not (base_for(lo) >= need >= base_for(hi)):
        raise ValueError(f"growth scale not bracketed: need {need:,.0f}, "
                         f"b=0 -> {base_for(lo):,.0f}, b=3 -> {base_for(hi):,.0f}")
    for _ in range(200):
        mid = (lo + hi) / 2.0
        if base_for(mid) > need:
            lo = mid
        else:
            hi = mid
    b = (lo + hi) / 2.0
    base[rest] = rev_2025[rest] / (1.0 + b * seed_g[rest])
    return base, b
