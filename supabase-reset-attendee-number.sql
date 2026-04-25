-- RESET MANUAL Y RESTRINGIDO DEL NÚMERO DE ASISTENTE
-- Ejecutar SOLO desde Supabase SQL Editor (owner del proyecto).
-- No hay endpoint frontend para esto.

BEGIN;

-- ==========================
-- MODO A) RESET SOLO CONTADOR
-- ==========================
-- Mantiene attendee_number existentes y reinicia el siguiente valor
-- al máximo actual + 1 (o 1 si no hay ninguno).
SELECT setval(
  'public.registrations_attendee_number_seq',
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
);

-- ==========================
-- MODO B) RESET COMPLETO
-- ==========================
-- ADVERTENCIA: borra TODOS los attendee_number ya asignados y vuelve a empezar en 1.
-- Descomenta este bloque SOLO si quieres un reinicio total.
--
-- UPDATE public.registrations
-- SET attendee_number = NULL;
--
-- ALTER SEQUENCE public.registrations_attendee_number_seq RESTART WITH 1;

COMMIT;

-- Verificación rápida:
-- SELECT id, full_name, accommodation_paid, attendee_number
-- FROM public.registrations
-- ORDER BY attendee_number NULLS LAST, created_at ASC
-- LIMIT 50;
