-- Migración: unificar nombre/apellidos en full_name para registrations (solo campo unificado).
-- Ejecutar en SQL Editor de Supabase.

BEGIN;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS full_name TEXT;

UPDATE public.registrations
SET full_name = NULLIF(
  trim(
    regexp_replace(
      concat_ws(' ', coalesce(first_name, ''), coalesce(last_name, '')),
      '\s+',
      ' ',
      'g'
    )
  ),
  ''
)
WHERE full_name IS NULL OR trim(full_name) = '';

ALTER TABLE public.registrations
  ALTER COLUMN full_name SET NOT NULL;

ALTER TABLE public.registrations
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name;

DROP INDEX IF EXISTS registrations_unique_person;
CREATE UNIQUE INDEX IF NOT EXISTS registrations_unique_person
  ON public.registrations(email, full_name, birth_date);

COMMENT ON COLUMN public.registrations.full_name IS 'Nombre y apellidos del asistente';

COMMIT;
