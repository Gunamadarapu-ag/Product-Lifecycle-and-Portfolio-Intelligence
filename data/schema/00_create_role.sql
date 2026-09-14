-- ============================================================================
-- 00_create_role.sql — application role and database
--
-- Creates the least-privilege role the dashboard connects as, and the database
-- it owns. Run this ONCE as the postgres superuser.
--
-- The password is passed in as a psql variable so it is never stored in this
-- file. Run it like this (from the repo root):
--
--   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres `
--       -v app_password=YOUR_PASSWORD -f data/schema/00_create_role.sql
--
-- Idempotent: safe to re-run. Re-running resets the role's password.
-- ============================================================================

\set ON_ERROR_STOP on

-- ── Role ────────────────────────────────────────────────────────────────────
-- Created without CREATEDB / CREATEROLE / SUPERUSER on purpose: the app only
-- ever needs to read and write its own schema.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ppl_app') THEN
    EXECUTE format('CREATE ROLE ppl_app WITH LOGIN PASSWORD %L', :'app_password');
    RAISE NOTICE 'Created role ppl_app';
  ELSE
    EXECUTE format('ALTER ROLE ppl_app WITH LOGIN PASSWORD %L', :'app_password');
    RAISE NOTICE 'Role ppl_app already existed — password reset';
  END IF;
END
$$;

-- ── Database ────────────────────────────────────────────────────────────────
-- CREATE DATABASE cannot run inside a transaction or a DO block, so this uses
-- the standard SELECT ... \gexec pattern to stay idempotent.
SELECT 'CREATE DATABASE ppl_intelligence OWNER ppl_app ENCODING ''UTF8'''
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ppl_intelligence')
\gexec

-- ── Connect privileges ──────────────────────────────────────────────────────
REVOKE ALL ON DATABASE ppl_intelligence FROM PUBLIC;
GRANT CONNECT, TEMPORARY ON DATABASE ppl_intelligence TO ppl_app;

\echo ''
\echo 'Role and database ready.'
\echo 'Next: run 01_schema.sql against ppl_intelligence as ppl_app.'
