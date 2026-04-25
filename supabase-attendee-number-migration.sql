  -- Asignación de número de asistente oficial al confirmar pago de alojamiento.
  -- Regla: se genera solo cuando accommodation_paid pasa a true.

  BEGIN;

  -- 1) Columna para número oficial de asistente
  ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS attendee_number INTEGER;

  -- 2) Secuencia para numeración correlativa
  CREATE SEQUENCE IF NOT EXISTS public.registrations_attendee_number_seq
    AS INTEGER
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

  -- 3) Sincronizar la secuencia con el máximo actual
  SELECT setval(
    'public.registrations_attendee_number_seq',
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
  );

  -- 4) Backfill opcional para registros ya pagados sin número
  UPDATE public.registrations
  SET attendee_number = nextval('public.registrations_attendee_number_seq')
  WHERE accommodation_paid = true
    AND attendee_number IS NULL;

  -- 5) Constraint de unicidad (ignora NULL)
  CREATE UNIQUE INDEX IF NOT EXISTS registrations_attendee_number_unique_idx
    ON public.registrations(attendee_number)
    WHERE attendee_number IS NOT NULL;

  -- 6) Trigger function para asignar número al marcar pagado
  CREATE OR REPLACE FUNCTION public.assign_attendee_number_on_payment()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.accommodation_paid = true
      AND (OLD.accommodation_paid IS DISTINCT FROM true)
      AND NEW.attendee_number IS NULL THEN
      NEW.attendee_number := nextval('public.registrations_attendee_number_seq');
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- 7) Trigger
  DROP TRIGGER IF EXISTS set_attendee_number_on_payment ON public.registrations;
  CREATE TRIGGER set_attendee_number_on_payment
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_attendee_number_on_payment();

-- 8) Función RPC para resincronizar secuencia tras reasignaciones manuales
CREATE OR REPLACE FUNCTION public.sync_attendee_number_sequence()
RETURNS VOID AS $$
BEGIN
  PERFORM setval(
    'public.registrations_attendee_number_seq',
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

  COMMIT;
