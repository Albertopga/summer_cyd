-- Borrar datos de prueba y dejar la BD lista para producción «desde cero».
-- Ejecutar en Supabase → SQL Editor como rol con permisos (p. ej. postgres).
--
-- Qué hace:
--   1) Vacía actividades y registros (orden seguro).
--   2) Reinicia las secuencias de attendee_number y temp_attendee_number.
--
-- NO borra usuarios de Authentication (hazlo en Dashboard → Authentication si hace falta).
-- Opcional: limpiar ficheros del bucket de documentos de actividades (bloque al final).

BEGIN;

-- 1) Actividades antes que registros (coherencia con emails de organizadores)
DELETE FROM public.activities;

-- 2) Todos los asistentes / familias
DELETE FROM public.registrations;

-- 3) Secuencias al estado «sin datos»
SELECT setval(
  'public.registrations_attendee_number_seq',
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
);

SELECT setval(
  'public.registrations_temp_attendee_number_seq',
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 0) > 0
);

COMMIT;

-- Verificación rápida:
-- SELECT COUNT(*) AS registrations FROM public.registrations;
-- SELECT COUNT(*) AS activities FROM public.activities;

-- =============================================================================
-- OPCIONAL: eliminar objetos del bucket de documentos de actividades (Storage)
-- =============================================================================
-- DELETE FROM storage.objects WHERE bucket_id = 'activity-documents';
