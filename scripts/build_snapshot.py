"""Freeze every API answer the frontend asks for into static JSON.

Why: the shareable deployment is a static site with no database. Instead of
falling back to the old typed sample figures, the app reads these files —
real figures, computed by the SQL layer, frozen at the dataset's end date.

Usage (the API must be running: `npm run api`):
    python scripts/build_snapshot.py
    npm run build:snapshot      # build that reads the snapshot directly

URL → file mapping (must match `snapshotPath` in src/api/liveData.tsx):
    /api/regions/Southern%20Europe/top-skus?months=12
    → public/data-snapshot/regions/southern-europe/top-skus/months-12.json
"""
from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = 'http://127.0.0.1:8000'
OUT = Path(__file__).resolve().parent.parent / 'public' / 'data-snapshot'
MONTHS = [1, 3, 6, 12, 24, 36]          # the timeline selector's options


def slug(s: str) -> str:
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9-]', '-', s.lower())).strip('-')


def snapshot_path(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    segments = [slug(urllib.parse.unquote(seg)) for seg in parsed.path.split('/') if seg and seg != 'api']
    query = sorted(urllib.parse.parse_qsl(parsed.query))
    name = '__'.join(f'{slug(k)}-{slug(v)}' for k, v in query) or 'all'
    return '/'.join(segments + [name]) + '.json'


def get(url: str):
    with urllib.request.urlopen(API + url, timeout=60) as r:
        return json.load(r)


def urls() -> list[str]:
    out: set[str] = set()
    # one fetch each, not windowed
    out.update(['/api/skus/segments', '/api/portfolio/snapshot', '/api/rationalization/scenarios',
                '/api/launches', '/api/launches/gates', '/api/launches/summary', '/api/portfolio/kpis?months=1'])
    regions = sorted({r['region'] for r in get('/api/regions/fulfillment?months=12')})
    for m in MONTHS:
        out.update([
            f'/api/portfolio/summary?months={m}', f'/api/skus?months={m}',
            f'/api/portfolio/trend?months={max(m, 12)}', f'/api/alerts?months={m}',
            f'/api/forecast/accuracy?months={m}', f'/api/customers?months={m}',
            f'/api/profitability/pnl?months={m}', f'/api/profitability/pnl-by-category?months={m}',
            f'/api/customers/by-category?months={m}&top=5', f'/api/regions/mix?months={m}',
            f'/api/signals?months={m}', f'/api/assortment/summary?months={m}',
            f'/api/skus/rationale?months={m}', f'/api/regions/fulfillment?months={m}',
            f'/api/categories/trend?months={m}&grain=week', f'/api/categories/trend?months={m}&grain=month',
        ])
        for reg in regions:
            out.add(f'/api/regions/{urllib.parse.quote(reg)}/top-skus?months={m}')
    return sorted(out)


def main() -> int:
    try:
        health = get('/api/health')
    except OSError as e:
        print(f'API not reachable at {API} — start it with `npm run api`. ({e})')
        return 1
    if OUT.exists():
        for f in OUT.rglob('*.json'):
            f.unlink()
    total = 0
    for u in urls():
        data = get(u)
        path = OUT / snapshot_path(u)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, separators=(',', ':')), encoding='utf-8')
        total += path.stat().st_size
    kpis = get('/api/portfolio/kpis?months=12')
    manifest = {
        'generated_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'data_end': kpis['period_end'],
        'files': len(urls()),
        'bytes': total,
        'health': health,
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f'snapshot: {len(urls())} files, {total / 1e6:.1f} MB, data to {kpis["period_end"]} → {OUT}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
