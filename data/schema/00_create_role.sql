-- ============================================================================
-- 00_create_role.sql — application role and database
--
-- Creates the least-privilege role the dashboard connects as, and the database
-- it owns. Run this ONCE as the postgres superuser.
--
-- Nothing is hardcoded: the role name, database name and password all come in
-- as psql variables so this file always matches .env and never stores a
-- secret. Run it from the repo root in **Command Prompt** (cmd.exe), on ONE
-- line (values here must match PGUSER / PGDATABASE / PGPASSWORD in .env):
--
--   "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d postgres -v app_user=Pd_lc_app -v app_db=ppl_intelligence -v app_password=Admin123! -f data\schema\00_create_role.sql
--
-- cmd.exe notes: do NOT use PowerShell's backtick (`) continuation or the &
-- call operator — cmd.exe understands neither and the command breaks into
-- fragments ("'-v' is not recognized..."). A ! in the password is safe in
-- cmd.exe unless delayed expansion is on (cmd /v:on).
--
-- Identifiers are emitted through format(%I), which double-quotes them only
-- when needed. That matters here: a mixed-case name like Pd_lc_app written
-- unquoted would be folded to lowercase (pd_lc_app) and then -U Pd_lc_app
-- would fail with "role does not exist".
--
-- Close any psql session connected to the target database first — a database
-- cannot be renamed while a session is connected to it.
--
-- Idempotent: safe to re-run. Re-running resets the role's password.
-- ============================================================================

\set ON_ERROR_STOP on

-- ── Role ────────────────────────────────────────────────────────────────────
-- Created without CREATEDB / CREATEROLE / SUPERUSER on purpose: the app only
-- ever needs to read and write its own schema.
-- Deliberately NOT a DO $$ ... $$ block. psql does not substitute :variables
-- inside dollar-quoted strings — it treats the whole body as one literal — so
-- :'app_user' would reach the server verbatim and fail with
-- 'syntax error at or near ":"'. SELECT ... \gexec keeps the variables in
-- plain SQL text, where psql does substitute them.
SELECT format('CREATE ROLE %I WITH LOGIN PASSWORD %L', :'app_user', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_user')
\gexec

-- Runs unconditionally, so the stored password always matches .env.
SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'app_user', :'app_password')
\gexec

-- ── Adopt a database created by hand under a different name ─────────────────
-- On 20 Sep the database was first created as "Pd_lc_app". Renaming preserves
-- anything already in it. Runs only when the old name exists and the target
-- does not, so it is a no-op afterwards; delete this block once every
-- environment is on the new name.
SELECT format('ALTER DATABASE %I RENAME TO %I', 'Pd_lc_app', :'app_db')
WHERE EXISTS     (SELECT 1 FROM pg_database WHERE datname = 'Pd_lc_app')
  AND NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'app_db')
\gexec

-- ── Database ────────────────────────────────────────────────────────────────
-- CREATE DATABASE cannot run inside a transaction or a DO block, so this uses
-- the standard SELECT ... \gexec pattern to stay idempotent.
SELECT format('CREATE DATABASE %I OWNER %I ENCODING ''UTF8''', :'app_db', :'app_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'app_db')
\gexec

-- Covers the adopted case, where the database was created owned by postgres.
SELECT format('ALTER DATABASE %I OWNER TO %I', :'app_db', :'app_user')
\gexec

-- ── Connect privileges ──────────────────────────────────────────────────────
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'app_db')
\gexec
SELECT format('GRANT CONNECT, TEMPORARY ON DATABASE %I TO %I', :'app_db', :'app_user')
\gexec

-- ── Schema privileges ───────────────────────────────────────────────────────
-- PostgreSQL 15 removed PUBLIC's CREATE right on the public schema, so a
-- non-owner role cannot create tables there without this. Must run while
-- connected to the database itself, hence the reconnect.
\connect :app_db

SELECT format('ALTER SCHEMA public OWNER TO %I', :'app_user')
\gexec
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'app_user')
\gexec

\echo ''
\echo 'Role and database ready.'
\echo 'Next: run 01_schema.sql against the database as the app role.'
