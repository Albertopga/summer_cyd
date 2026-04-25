-- Número temporal de asistente para identificar rápido tras el registro.
-- Se asigna automáticamente al insertar un registro.

BEGIN;

-- 1) Columna para numeración temporal
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS temp_attendee_number INTEGER;

-- 2) Secuencia temporal
CREATE SEQUENCE IF NOT EXISTS public.registrations_temp_attendee_number_seq
  AS INTEGER
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 3) Sincronizar secuencia con máximo actual
SELECT setval(
  'public.registrations_temp_attendee_number_seq',
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 1),
  COALESCE((SELECT MAX(temp_attendee_number) FROM public.registrations), 0) > 0
);

-- 4) Backfill para existentes sin número temporal
WITH ordered AS (
  SELECT id
  FROM public.registrations
  WHERE temp_attendee_number IS NULL
  ORDER BY created_at ASC, id ASC
)
UPDATE public.registrations r
SET temp_attendee_number = nextval('public.registrations_temp_attendee_number_seq')
FROM ordered
WHERE r.id = ordered.id;

-- 5) Índice único parcial
CREATE UNIQUE INDEX IF NOT EXISTS registrations_temp_attendee_number_unique_idx
  ON public.registrations(temp_attendee_number)
  WHERE temp_attendee_number IS NOT NULL;

-- 6) Trigger function para asignar al insertar
CREATE OR REPLACE FUNCTION public.assign_temp_attendee_number_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.temp_attendee_number IS NULL THEN
    NEW.temp_attendee_number := nextval('public.registrations_temp_attendee_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7) Trigger
DROP TRIGGER IF EXISTS set_temp_attendee_number_on_insert ON public.registrations;
CREATE TRIGGER set_temp_attendee_number_on_insert
BEFORE INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.assign_temp_attendee_number_on_insert();

COMMIT;
