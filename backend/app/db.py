"""
Database access.

Connection settings come from the repo-root .env (gitignored) — the same file
data/generator/load.py reads — so there is exactly one place credentials live.

The API does no arithmetic. Every figure comes from a SQL function defined in
data/schema/03_derive_metrics.sql; this module only runs those functions and
turns rows into JSON-safe dicts.
"""
from __future__ import annotations

import datetime as dt
import threading
from decimal import Decimal
from pathlib import Path
from typing import Any

import psycopg2
import psycopg2.extras
import psycopg2.pool

REPO = Path(__file__).resolve().parents[2]
ENV_FILE = REPO / ".env"


def read_env(path: Path = ENV_FILE) -> dict[str, str]:
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


class DatabaseUnavailable(RuntimeError):
    """Raised when PostgreSQL can't be reached; the API turns it into a 503."""


_pool: psycopg2.pool.ThreadedConnectionPool | None = None
_lock = threading.Lock()


def _get_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _pool
    with _lock:
        if _pool is None:
            env = read_env()
            missing = [k for k in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD")
                       if not env.get(k)]
            if missing:
                raise DatabaseUnavailable(f".env is missing: {', '.join(missing)}")
            try:
                _pool = psycopg2.pool.ThreadedConnectionPool(
                    1, 8,
                    host=env["PGHOST"], port=env["PGPORT"], dbname=env["PGDATABASE"],
                    user=env["PGUSER"], password=env["PGPASSWORD"],
                    connect_timeout=5, application_name="ppl-api",
                )
            except psycopg2.OperationalError as exc:
                raise DatabaseUnavailable(str(exc).strip()) from exc
        return _pool


def close_pool() -> None:
    global _pool
    with _lock:
        if _pool is not None:
            _pool.closeall()
            _pool = None


def _jsonable(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (dt.date, dt.datetime)):
        return value.isoformat()
    return value


def query(sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    """Run a read-only query and return rows as JSON-safe dicts."""
    pool = _get_pool()
    try:
        conn = pool.getconn()
    except psycopg2.OperationalError as exc:
        raise DatabaseUnavailable(str(exc).strip()) from exc
    try:
        conn.set_session(readonly=True, autocommit=True)
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [{k: _jsonable(v) for k, v in row.items()} for row in cur.fetchall()]
    except psycopg2.OperationalError as exc:
        pool.putconn(conn, close=True)
        conn = None
        raise DatabaseUnavailable(str(exc).strip()) from exc
    finally:
        if conn is not None:
            pool.putconn(conn)
