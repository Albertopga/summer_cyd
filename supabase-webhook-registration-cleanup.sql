-- Limpieza y verificación de webhook de registro (Supabase)
-- Objetivo: mantener un único webhook para public.registrations con INSERT/UPDATE.

-- 1) Ver triggers no internos sobre registrations
SELECT
  n.nspname AS table_schema,
  c.relname AS table_name,
  t.tgname AS trigger_name,
  pg_get_triggerdef(t.oid, true) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'registrations'
ORDER BY t.tgname;

-- 2) (Opcional) eliminar triggers sobrantes.
-- IMPORTANTE:
-- - Ajusta los nombres de trigger a tu caso real.
-- - Conserva solo el webhook deseado (p.ej. registration-confirmation-email).
-- - Puedes obtener nombres reales con la consulta anterior.
--
-- DROP TRIGGER IF EXISTS "registrations_webhook_delete" ON public.registrations;
-- DROP TRIGGER IF EXISTS "registrations_webhook_legacy" ON public.registrations;

-- 3) Ver últimas respuestas de pg_net (estado de entrega webhook)
SELECT
  id,
  status_code,
  created,
  timed_out,
  error_msg,
  content
FROM net._http_response
ORDER BY created DESC
LIMIT 30;
