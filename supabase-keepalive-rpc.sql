-- Heartbeat para keep-alive del plan gratuito: PostgREST ejecuta esto en Postgres.
-- Ejecuta UNA VEZ en Supabase → SQL Editor → Run (idempotente).
--
-- Luego el workflow de GitHub llama: POST /rest/v1/rpc/keepalive_ping con body {}

CREATE OR REPLACE FUNCTION public.keepalive_ping()
RETURNS smallint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$ SELECT 1::smallint $$;

REVOKE ALL ON FUNCTION public.keepalive_ping() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.keepalive_ping() TO anon, authenticated;

COMMENT ON FUNCTION public.keepalive_ping() IS 'Ping ligero para actividad en BD; no expone tablas ni datos.';
