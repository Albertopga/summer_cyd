-- Migracion: campos de fecha/hora de actividad para gestion interna (admin)
-- Ejecutar en SQL Editor de Supabase

BEGIN;

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS activity_date DATE,
  ADD COLUMN IF NOT EXISTS activity_time TIME WITHOUT TIME ZONE;

COMMENT ON COLUMN public.activities.activity_date IS
  'Fecha real de actividad (gestion interna; editable solo desde admin).';
COMMENT ON COLUMN public.activities.activity_time IS
  'Hora real de actividad (gestion interna; editable solo desde admin).';

CREATE INDEX IF NOT EXISTS activities_status_activity_date_activity_time_idx
  ON public.activities(status, activity_date, activity_time);

CREATE INDEX IF NOT EXISTS activities_activity_date_activity_time_idx
  ON public.activities(activity_date, activity_time);

-- Politica publica para mostrar actividades aprobadas en Home/modal
DROP POLICY IF EXISTS "allow_anon_select_approved_activities" ON public.activities;
CREATE POLICY "allow_anon_select_approved_activities"
  ON public.activities
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (status = 'approved');

COMMIT;
