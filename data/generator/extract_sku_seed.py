"""
Extract the 119-SKU master from src/constants/data.ts into data/generator/sku_seed.json.

The SKUS array is the canonical seed list: the generator attaches transaction
history to these SKUs rather than inventing names. Run this once; re-run only if
the TypeScript master changes.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "src" / "constants" / "data.ts"
OUT = Path(__file__).resolve().parent / "sku_seed.json"

# Fields on each SKU row, with the Python type to coerce to.
FIELDS: dict[str, type] = {
    "name": str,
    "cat": str,
    "rev": float,
    "val": float,
    "cx": float,
    "stockouts": int,
    "promo": float,
    "margin": float,
    "growth": float,
    "lead": float,
    "householdPenetration": float,
}

ROW_RE = re.compile(r"^\s*\{name:'", re.MULTILINE)


def extract_array(text: str, name: str) -> str:
    """Return the source text of `export const <name> = [ ... ];`."""
    start = text.index(f"export const {name}")
    start = text.index("[", start)
    depth, i = 0, start
    while i < len(text):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
        i += 1
    raise ValueError(f"unterminated array: {name}")


def parse_row(row: str) -> dict:
    """Pull the known fields out of one `{name:'...', cat:'...', ...}` literal."""
    out: dict = {}
    for field, caster in FIELDS.items():
        if caster is str:
            m = re.search(rf"\b{field}:\s*'([^']*)'", row)
            out[field] = m.group(1) if m else None
        else:
            m = re.search(rf"\b{field}:\s*(-?[\d.]+)", row)
            out[field] = caster(m.group(1)) if m else None
    return out


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    block = extract_array(text, "SKUS")

    # Split on row starts so a trailing comment line can't be mistaken for a row.
    rows: list[dict] = []
    starts = [m.start() for m in ROW_RE.finditer(block)]
    for idx, s in enumerate(starts):
        e = starts[idx + 1] if idx + 1 < len(starts) else len(block)
        rows.append(parse_row(block[s:e]))

    # Integrity checks - fail loudly rather than emit a bad seed.
    names = [r["name"] for r in rows]
    assert len(names) == len(set(names)), "duplicate SKU names in source"
    missing = {
        f: [r["name"] for r in rows if r[f] is None]
        for f in FIELDS
        if any(r[f] is None for r in rows)
    }
    assert not missing, f"rows missing fields: {missing}"

    for i, r in enumerate(rows, start=1):
        r["sku_id"] = i

    OUT.write_text(json.dumps(rows, indent=2), encoding="utf-8")

    cats: dict[str, int] = {}
    for r in rows:
        cats[r["cat"]] = cats.get(r["cat"], 0) + 1

    print(f"extracted {len(rows)} SKUs -> {OUT.relative_to(REPO)}")
    print(f"  categories ({len(cats)}):")
    for c, n in sorted(cats.items(), key=lambda kv: -kv[1]):
        print(f"    {c:16s} {n:3d}")
    print(f"  margin  range: {min(r['margin'] for r in rows):.0f}% "
          f"- {max(r['margin'] for r in rows):.0f}%")
    print(f"  lead    range: {min(r['lead'] for r in rows):.0f} "
          f"- {max(r['lead'] for r in rows):.0f} days")
    print(f"  seed rev total: {sum(r['rev'] for r in rows):.0f} (relative units)")


if __name__ == "__main__":
    main()
