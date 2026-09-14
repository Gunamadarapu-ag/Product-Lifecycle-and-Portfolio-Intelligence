"""
Load data/output/*.csv into PostgreSQL.

    python data/generator/load.py            # load everything
    python data/generator/load.py --dry-run  # check connection and files only

Reads connection settings from .env (gitignored). Requires the schema to exist:

    psql -h localhost -p 5433 -U postgres -d postgres \\
         -v app_password=... -f data/schema/00_create_role.sql
    psql -h localhost -p 5433 -U ppl_app -d ppl_intelligence \\
         -f data/schema/01_schema.sql

Tables load in foreign-key order. COPY is used rather than row inserts - 368k
rows one statement at a time would take minutes instead of seconds.
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import config as C

# Foreign-key order. dim_country first (dim_supplier references it), fact last.
LOAD_ORDER = [
    "dim_country",
    "dim_supplier",
    "dim_brand",
    "dim_category",
    "dim_channel",
    "dim_date",
    "dim_sku",
    "sku_supplier",
    "fact_sales",
    "sku_metrics",
    "sku_cannibalization",
    "portfolio_metrics",
    "rationalization_scenario",
]

# gross_margin is a generated column - the database computes it, so it is not
# in the CSV and must not be named in the COPY column list.
GENERATED_COLUMNS = {"fact_sales": {"gross_margin"}}


def read_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def connect(env: dict[str, str]):
    try:
        import psycopg2
    except ImportError:
        sys.exit("psycopg2 is not installed:  pip install psycopg2-binary")

    missing = [k for k in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD")
               if not env.get(k)]
    if missing:
        sys.exit(f".env is missing: {', '.join(missing)}")

    try:
        return psycopg2.connect(
            host=env["PGHOST"], port=env["PGPORT"], dbname=env["PGDATABASE"],
            user=env["PGUSER"], password=env["PGPASSWORD"],
        )
    except psycopg2.OperationalError as exc:
        msg = str(exc).strip().splitlines()[0]
        hint = ""
        if "does not exist" in msg or "authentication failed" in msg:
            hint = ("\n  The role or database is not set up yet. Run, as the postgres "
                    "superuser:\n"
                    '    psql -h localhost -p 5433 -U postgres -d postgres '
                    '-v app_password=<pw> -f data/schema/00_create_role.sql\n'
                    "  then create the schema with data/schema/01_schema.sql.")
        elif "could not connect" in msg or "refused" in msg:
            hint = ("\n  Nothing is listening. Check the service is running and that "
                    "PGPORT in .env matches\n  the port in postgresql.conf "
                    "(this install uses 5433, not the default 5432).")
        sys.exit(f"cannot connect: {msg}{hint}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="verify connection and CSVs, load nothing")
    ap.add_argument("--truncate", action="store_true",
                    help="empty the tables before loading")
    args = ap.parse_args()

    env = read_env(C.REPO / ".env")

    missing = [t for t in LOAD_ORDER if not (C.OUT_DIR / f"{t}.csv").exists()]
    if missing:
        sys.exit(f"missing CSVs: {', '.join(missing)}\n"
                 f"run: python data/generator/main.py")

    print(f"target: {env.get('PGUSER')}@{env.get('PGHOST')}:{env.get('PGPORT')}"
          f"/{env.get('PGDATABASE')}")

    conn = connect(env)
    conn.autocommit = False
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(f"connected: {cur.fetchone()[0].split(',')[0]}")

    if args.dry_run:
        for t in LOAD_ORDER:
            rows = sum(1 for _ in (C.OUT_DIR / f"{t}.csv").open(encoding="utf-8")) - 1
            print(f"  {t:<26} {rows:>9,} rows ready")
        conn.close()
        print("\ndry run - nothing written")
        return 0

    t0 = time.time()
    try:
        if args.truncate:
            cur.execute(f"TRUNCATE {', '.join(reversed(LOAD_ORDER))} CASCADE;")
            print("  truncated")

        for table in LOAD_ORDER:
            path = C.OUT_DIR / f"{table}.csv"
            with path.open("r", encoding="utf-8") as fh:
                header = fh.readline().strip().split(",")
                cols = [c for c in header if c not in GENERATED_COLUMNS.get(table, set())]
                fh.seek(0)
                t = time.time()
                cur.copy_expert(
                    f"COPY {table} ({', '.join(cols)}) "
                    f"FROM STDIN WITH (FORMAT csv, HEADER true, NULL '')",
                    fh,
                )
                print(f"  {table:<26} {cur.rowcount:>9,} rows  {time.time()-t:>5.1f}s")

        cur.execute("REFRESH MATERIALIZED VIEW agg_sku_monthly;")
        print("  agg_sku_monthly refreshed")

        conn.commit()
        print(f"\nloaded in {time.time()-t0:.1f}s")
    except Exception as exc:
        conn.rollback()
        print(f"\nrolled back: {exc}", file=sys.stderr)
        return 1
    finally:
        cur.close()
        conn.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
