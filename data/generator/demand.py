"""
Generate fact_sales.

Structure: for each valid SKU x country x channel combination, decide which days
it trades, apply seasonality and noise to get a daily unit shape, mark promo and
stockout days, then solve one scale factor per combination so its revenue lands
exactly on the allocated target. Revenue therefore reconciles by construction
rather than by iteration.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def _promo_day_fraction(dep: np.ndarray, lift: float, disc: float) -> np.ndarray:
    """
    Fraction of trading days on promo that yields a given revenue dependency.

    With r = lift x (1 - discount) as the revenue rate on a promo day relative to
    a normal one:  dep = f.r / (f.r + 1 - f)  =>  f = dep / (r(1-dep) + dep)
    """
    r = lift * (1.0 - disc)
    return dep / (r * (1.0 - dep) + dep)


def _seasonality(month: np.ndarray, profile: str, amplitude: float) -> np.ndarray:
    """Sine wave peaking in the profile's peak month."""
    peak = C.SEASONALITY_PEAK_MONTH[profile]
    phase = 2.0 * np.pi * (month - peak) / 12.0
    return 1.0 + amplitude * np.cos(phase)


def allocate_targets(sku: pd.DataFrame, countries: pd.DataFrame,
                     channels: pd.DataFrame) -> pd.DataFrame:
    """
    One row per valid SKU x country x channel, with its target revenue.

    A SKU is listed in a market if its revenue rank falls inside that market's
    listed_sku_count. Revenue is normalised within each country so the seven
    country shares hold exactly.
    """
    rows = []
    for _, ctry in countries.iterrows():
        listed = sku[sku["revenue_rank"] <= ctry["listed_sku_count"]]
        for _, chan in channels.iterrows():
            w = listed["revenue_share"].to_numpy() * chan["revenue_share_target"]
            rows.append(
                pd.DataFrame({
                    "sku_id": listed["sku_id"].to_numpy(),
                    "country_id": ctry["country_id"],
                    "channel_id": chan["channel_id"],
                    "weight": w,
                    "country_share": ctry["revenue_share_target"],
                })
            )
    combos = pd.concat(rows, ignore_index=True)

    # Normalise within country so each market's share is exact.
    combos["weight"] /= combos.groupby("country_id")["weight"].transform("sum")
    # TOTAL_NET_SALES spans both years; $473M alone is the annual figure.
    # target_revenue still drives trading activity, so the day draws (and the
    # main random stream) are unchanged by the per-year targets below.
    combos["target_revenue"] = (
        combos["weight"] * combos["country_share"] * C.TOTAL_NET_SALES
    )
    # The headline year carries the Pareto curve and the country split exactly.
    combos["target_2025"] = (
        combos["weight"] * combos["country_share"] * C.ANNUAL_NET_SALES
    )
    return combos.drop(columns=["weight", "country_share"])


def attach_base_year(combos: pd.DataFrame, sku: pd.DataFrame,
                     launches: pd.DataFrame) -> tuple[pd.DataFrame, float]:
    """
    Give each combination its own 2024 target from its SKU's growth.

    Growth is solved at SKU level (lifecycle.solve_growth) and applied to every
    market the SKU trades in, so a SKU grows at the same rate everywhere.
    """
    import lifecycle  # local: lifecycle imports config only, no cycle

    rev_sku = combos.groupby("sku_id")["target_2025"].sum()
    base_sku, scale = lifecycle.solve_growth(rev_sku, sku, launches)
    ratio = (base_sku / rev_sku).fillna(0.0)
    combos = combos.copy()
    combos["target_2024"] = combos["target_2025"] * combos["sku_id"].map(ratio)
    return combos, scale


def sku_stockout_targets(sku: pd.DataFrame, rows: pd.Series | None = None) -> pd.Series:
    """
    Per-SKU stockout counts summing to TOTAL_STOCKOUTS with two SKUs at the peak.

    Solves the exponent of a power transform on the seed stockout weights so both
    the total and the maximum land on target, rather than leaving either to chance.

    `rows` (sales days per SKU) makes the weight propensity × exposure. Without
    it, a low-activity SKU received the same count as a high-volume one and
    saturated: before 7 Oct, Fabric Softener stocked out on 378 of its 378 sales
    days. Counts are also capped at STOCKOUT_MAX_RATE of a SKU's rows; the cap is
    applied inside the solve, so the total still lands on target.
    """
    w = sku["seed_stockouts"].to_numpy(dtype=float)
    w = np.maximum(w, 0.5)
    cap = None
    if rows is not None:
        r = rows.reindex(sku["sku_id"].to_numpy()).fillna(0).to_numpy(dtype=float)
        w = w * r
        cap = np.floor(C.STOCKOUT_MAX_RATE * r)

    # Force a tie at the top: the two highest weights are levelled.
    order = np.argsort(-w)
    w[order[1]] = w[order[0]]
    wmax = w.max()

    def raw_counts(gamma: float) -> np.ndarray:
        c = np.round(C.PEAK_SKU_STOCKOUTS * (w / wmax) ** gamma)
        return np.minimum(c, cap) if cap is not None else c

    def total_for(gamma: float) -> float:
        return float(raw_counts(gamma).sum())

    lo, hi = 0.05, 8.0
    for _ in range(80):
        mid = (lo + hi) / 2.0
        if total_for(mid) > C.TOTAL_STOCKOUTS:
            lo = mid          # larger gamma -> smaller values
        else:
            hi = mid
    gamma = (lo + hi) / 2.0

    counts = raw_counts(gamma).astype(int)

    # Absorb the rounding residual into mid-ranked SKUs so the peak stays put,
    # skipping any SKU already at its rate cap.
    diff = C.TOTAL_STOCKOUTS - int(counts.sum())
    if diff != 0:
        mid_idx = order[len(order) // 4 : 3 * len(order) // 4]
        step = 1 if diff > 0 else -1
        i = 0
        while diff != 0 and i < 50 * len(mid_idx):
            k = mid_idx[i % len(mid_idx)]
            if step < 0 or cap is None or counts[k] < cap[k]:
                counts[k] += step
                diff -= step
            i += 1
    counts = np.maximum(counts, 0)

    return pd.Series(counts, index=sku["sku_id"].to_numpy())


def sku_promo_dependency(sku: pd.DataFrame) -> pd.Series:
    """
    Per-SKU promo dependency: max on target, top 10 clustered, portfolio mean on target.
    """
    w = sku["promo_propensity"].to_numpy(dtype=float)
    w = np.maximum(w, 0.01)
    rank = np.argsort(-w)

    dep = np.empty_like(w)
    # Top 10 cluster in the documented 27.6%-28.0% band.
    top = rank[:10]
    dep[top] = np.linspace(C.MAX_PROMO_DEPENDENCY, 0.276, len(top))

    rest = rank[10:]
    wr = w[rest]
    # Scale the remainder so the portfolio mean lands on target.
    need = C.PORTFOLIO_PROMO_DEPENDENCY * len(w) - dep[top].sum()
    scaled = wr / wr.sum() * need
    dep[rest] = np.clip(scaled, 0.005, 0.26)

    # Correct residual drift from the clip.
    resid = C.PORTFOLIO_PROMO_DEPENDENCY * len(w) - dep.sum()
    room = dep[rest] < 0.26
    if room.any():
        dep[rest[room]] += resid / room.sum()
    dep = np.clip(dep, 0.005, C.MAX_PROMO_DEPENDENCY) * C.PROMO_DEP_CALIBRATION

    return pd.Series(dep, index=sku["sku_id"].to_numpy())


def generate(sku: pd.DataFrame, dims: dict[str, pd.DataFrame],
             rng: np.random.Generator, launches: pd.DataFrame,
             rng_price: np.random.Generator) -> tuple[pd.DataFrame, dict]:
    """
    Returns fact_sales and the extras built alongside it: the list-price paths
    (exported as fact_price), the per-SKU elasticity and the growth shift (both
    generation-only, reported by validation).
    """
    import pricing  # local: pricing imports config only, no cycle

    countries, channels = dims["dim_country"], dims["dim_channel"]
    cal = dims["dim_date"]

    combos = allocate_targets(sku, countries, channels)
    combos, growth_scale = attach_base_year(combos, sku, launches)
    promo_dep = sku_promo_dependency(sku)

    paths = pricing.build_price_paths(sku, countries, combos, rng_price)
    elasticity = pricing.build_elasticity(sku, rng_price)
    price_of = pricing.price_lookup(paths)
    launch_at = dict(zip(launches["sku_id"].to_numpy(),
                         launches["launch_date"].to_numpy(dtype="datetime64[D]")))
    in_window = set(launches.loc[launches["launch_year_in_window"].notna(), "sku_id"])

    # Per-SKU lookups
    s = sku.set_index("sku_id")
    cost = s["purchase_cost"]
    lead = s["lead_time_days"]
    profile = s["seasonality_profile"]
    supplier = s["primary_supplier_id"]

    # Per-SKU seasonal amplitude, jittered so SKUs inside a category differ.
    amp = profile.map(C.SEASONALITY_AMPLITUDE).to_numpy()
    amp = np.clip(amp * rng.uniform(0.75, 1.25, len(amp)), 0.03, 0.42)
    amp = pd.Series(amp, index=s.index)

    # Per-SKU promo economics
    disc = pd.Series(rng.uniform(*C.PROMO_DISCOUNT_RANGE, len(s)), index=s.index)
    lift = pd.Series(rng.uniform(*C.PROMO_LIFT_RANGE, len(s)), index=s.index)
    pfrac = pd.Series(
        _promo_day_fraction(promo_dep.reindex(s.index).to_numpy(),
                            lift.to_numpy(),
                            disc.to_numpy() * C.MEAN_PROMO_INTENSITY),
        index=s.index,
    )

    # ── Activity: how many days each combination trades ─────────────────────
    rev = combos["target_revenue"].to_numpy()
    rel = rev / rev.max()
    raw = np.clip(rel ** 0.30, 0, 1)
    scale = C.TARGET_FACT_ROWS / (raw.sum() * len(cal))
    activity = np.clip(raw * scale, C.ACTIVITY_MIN, C.ACTIVITY_MAX)
    combos["activity"] = activity

    n_days = len(cal)
    dates = cal["date_key"].to_numpy()
    months = cal["month"].to_numpy()
    years = cal["year"].to_numpy()
    is_wknd = cal["is_weekend"].to_numpy()

    # Day indices per year. Active days are drawn from each year in proportion to
    # its length, so the year-on-year ratio does not depend on the random draw.
    base_idx = np.flatnonzero(years == C.BASE_YEAR)
    rept_idx = np.flatnonzero(years == C.REPORT_YEAR)
    base_frac = len(base_idx) / n_days

    # Per-day weights that place exactly the target revenue in each year
    # (2024 has 366 days, 2025 has 365 - a flat multiplier would miss by ~0.3pp).
    yr_w = np.empty(n_days, dtype=float)
    yr_w[base_idx] = C.BASE_YEAR_NET_SALES / len(base_idx)
    yr_w[rept_idx] = C.ANNUAL_NET_SALES / len(rept_idx)
    yr_w /= yr_w.mean()

    out_frames = []
    for row in combos.itertuples(index=False):
        k = row.sku_id
        n_active = max(8, int(round(row.activity * n_days)))
        # Stratify by year so both years are represented proportionally.
        n_base = max(4, int(round(n_active * base_frac)))
        n_rept = max(4, n_active - n_base)
        idx = np.concatenate([
            rng.choice(base_idx, size=min(n_base, len(base_idx)), replace=False),
            rng.choice(rept_idx, size=min(n_rept, len(rept_idx)), replace=False),
        ])
        idx.sort()
        n_active = len(idx)

        m, y_w, wknd = months[idx], yr_w[idx], is_wknd[idx]

        shape = _seasonality(m, profile[k], amp[k])
        shape = shape * y_w
        shape = shape * np.where(wknd, 1.12, 1.0)          # weekend uplift
        shape = shape * rng.lognormal(0.0, 0.18, n_active)  # day-to-day noise
        shape = np.maximum(shape, 1e-6)

        # Exactly k promo days rather than a Bernoulli draw: binomial variance
        # otherwise pushes the most promo-dependent SKU well past its target.
        n_promo = int(round(pfrac[k] * n_active))
        promo = np.zeros(n_active, dtype=bool)
        if n_promo > 0:
            promo[rng.choice(n_active, size=min(n_promo, n_active), replace=False)] = True

        intensity = np.where(
            promo, rng.choice([0.2, 0.5, 1.0], size=n_active, p=[0.45, 0.35, 0.20]), 0.0
        )
        # Drawn here, on every drawn day, so the stream is identical whether or
        # not some of these days are later dropped as pre-launch.
        lead_draw = rng.normal(0, 0.6, n_active)

        # List price in force on each day; demand responds to it relative to the
        # combination's opening price, so the country index itself moves units
        # only through the revenue solve, not through elasticity.
        starts, list_prices = price_of[(k, row.country_id)]
        day = dates[idx].astype("datetime64[D]")
        list_p = list_prices[np.searchsorted(starts, day, side="right") - 1]
        eff_price = list_p * (1.0 - disc[k] * intensity)
        shape = shape * np.where(promo, lift[k], 1.0)
        shape = shape * (list_p / list_prices[0]) ** elasticity[k]

        # In-window launches: no sales before launch, and a ramp to full run-rate.
        keep = day >= launch_at[k]
        if k in in_window:
            age = (day - launch_at[k]).astype(float)
            shape = shape * np.clip(0.4 + 0.6 * age / C.LAUNCH_RAMP_DAYS, 0.4, 1.0)

        # Scale each year separately so every SKU's year-on-year ratio is its
        # own growth (lifecycle.solve_growth), exactly, rather than an artefact
        # of which days happened to be drawn.
        is_base = years[idx] == C.BASE_YEAR
        units = np.zeros(n_active, dtype=np.int64)
        for mask, target in (
            (is_base & keep, row.target_2024),
            (~is_base & keep, row.target_2025),
        ):
            if not mask.any() or target <= 0:
                continue
            denom = float((shape[mask] * eff_price[mask]).sum())
            if denom <= 0:
                continue
            units[mask] = np.maximum(
                1, np.round(shape[mask] * (target / denom))
            ).astype(np.int64)
        net = np.round(units * eff_price, 2)

        # A day can survive the launch filter yet sit in a year whose target is
        # zero (a 2025 launch has no 2024 target); it carries no sale, so drop it.
        keep = keep & (units > 0)
        out_frames.append(
            pd.DataFrame({
                "date_key": dates[idx][keep],
                "sku_id": k,
                "country_id": row.country_id,
                "channel_id": row.channel_id,
                "supplier_id": supplier[k],
                "units_sold": units[keep],
                "net_sales": net[keep],
                "purchase_cost": cost[k],
                "promo_flag": intensity[keep],
                "stock_out_flag": 0,
                "lead_time_days": np.round(
                    np.clip(lead[k] + lead_draw[keep], 1.0, 60.0), 2
                ),
            })
        )

    fact = pd.concat(out_frames, ignore_index=True)
    # Stockout targets need each SKU's real sales days (exposure), which only
    # exist now that the rows are drawn. sku_stockout_targets uses no random
    # draws, so recomputing here leaves the main stream unchanged.
    stock_target = sku_stockout_targets(sku, fact.groupby("sku_id").size())
    fact = _assign_stockouts(fact, stock_target, channels, rng)
    return fact, {"price_paths": paths, "elasticity": elasticity,
                  "growth_scale": growth_scale}


def _assign_stockouts(fact: pd.DataFrame, target: pd.Series,
                      channels: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """
    Place stockout events so BOTH margins hold: each SKU's total, and each
    channel's share of the portfolio total.

    Weighting rows independently satisfies neither reliably - a SKU with few
    Hypermarket rows cannot reach the channel share on its own. This is a
    two-way marginal problem, so it uses iterative proportional fitting on the
    SKU x channel matrix, clipped to the rows actually available in each cell.
    """
    skus = np.sort(fact["sku_id"].unique())
    chans = channels["channel_id"].to_numpy()
    s_pos = {s: i for i, s in enumerate(skus)}
    c_pos = {c: j for j, c in enumerate(chans)}

    # Capacity: rows available per (sku, channel).
    cap = np.zeros((len(skus), len(chans)))
    grid = fact.groupby(["sku_id", "channel_id"]).size()
    for (s, c), n in grid.items():
        cap[s_pos[s], c_pos[c]] = n

    row_t = np.array([float(target.get(s, 0)) for s in skus])
    col_t = channels.set_index("channel_id")["stockout_share_target"].reindex(chans).to_numpy()
    col_t = col_t * row_t.sum()

    # IPF, clipped to capacity each pass so the result stays feasible.
    x = np.where(cap > 0, cap, 0.0)
    x = x / max(x.sum(), 1e-9) * row_t.sum()
    for _ in range(200):
        rs = x.sum(axis=1, keepdims=True)
        x *= np.divide(row_t[:, None], rs, out=np.ones_like(x), where=rs > 0)
        x = np.minimum(x, cap)
        cs = x.sum(axis=0, keepdims=True)
        x *= np.divide(col_t[None, :], cs, out=np.ones_like(x), where=cs > 0)
        x = np.minimum(x, cap)

    alloc = np.floor(x).astype(int)
    # Give each SKU back its rounding residual, in cells with spare capacity.
    for i in range(len(skus)):
        short = int(row_t[i]) - alloc[i].sum()
        while short > 0:
            room = cap[i] - alloc[i]
            if room.max() <= 0:
                break
            alloc[i, int(np.argmax(room))] += 1
            short -= 1

    flag = np.zeros(len(fact), dtype=np.int16)
    for (s, c), idx in fact.groupby(["sku_id", "channel_id"], sort=False).indices.items():
        take = int(alloc[s_pos[s], c_pos[c]])
        if take <= 0:
            continue
        flag[rng.choice(idx, size=min(take, len(idx)), replace=False)] = 1

    fact["stock_out_flag"] = flag
    return fact
