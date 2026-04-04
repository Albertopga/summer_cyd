-- Migración: RLS para que el panel admin vea todas las actividades, límite 2 por organizador, RPC de recuento.
-- Ejecutar en SQL Editor de Supabase (proyectos ya desplegados con supabase-activities-schema.sql).

-- ---------------------------------------------------------------------------
-- 1) Políticas RLS: admin (authenticated) ve y actualiza todo; anon solo insert + select reciente
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "allow_select_activities" ON public.activities;
DROP POLICY IF EXISTS "allow_anon_select_recent_activities" ON public.activities;
DROP POLICY IF EXISTS "allow_authenticated_select_all_activities" ON public.activities;
DROP POLICY IF EXISTS "allow_authenticated_update_activities" ON public.activities;

-- Público: necesario para que .insert().select() devuelva filas recién creadas
CREATE POLICY "allow_anon_select_recent_activities"
  ON public.activities
  AS PERMISSIVE
  FOR SELECT
  TO anon
  USING (created_at > NOW() - INTERVAL '1 minute');

-- Panel de administración (sesión Supabase Auth)
CREATE POLICY "allow_authenticated_select_all_activities"
  ON public.activities
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_authenticated_update_activities"
  ON public.activities
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2) INSERT: email en registrations + máximo 2 actividades por organizer_email (SECURITY DEFINER)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS activities_max_per_organizer_trigger ON public.activities;
DROP TRIGGER IF EXISTS activities_before_insert_enforce_rules_trigger ON public.activities;

CREATE OR REPLACE FUNCTION public.activities_before_insert_enforce_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  -- Panel admin (Supabase Auth): sin límite de 2 ni exigencia de email en registrations
  IF (SELECT auth.uid()) IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Formulario público (rol anon): participante debe estar inscrito y máximo 2 actividades por email
  IF NOT EXISTS (
    SELECT 1
    FROM public.registrations
    WHERE lower(trim(email)) = NEW.organizer_email
  ) THEN
    RAISE EXCEPTION 'ACTIVITIES_ORGANIZER_NOT_REGISTERED'
      USING ERRCODE = 'P0001';
  END IF;

  SELECT COUNT(*)::integer
  INTO current_count
  FROM public.activities
  WHERE organizer_email = NEW.organizer_email;

  IF current_count >= 2 THEN
    RAISE EXCEPTION 'ACTIVITIES_MAX_PER_ORGANIZER'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER activities_before_insert_enforce_rules_trigger
  BEFORE INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.activities_before_insert_enforce_rules();

COMMENT ON FUNCTION public.activities_before_insert_enforce_rules() IS
  'Antes de INSERT: si auth.uid() es null (anon), exige email en registrations y máximo 2 por organizer_email; si hay sesión (admin), no aplica esas reglas.';

DROP FUNCTION IF EXISTS public.activities_enforce_max_per_organizer();

-- ---------------------------------------------------------------------------
-- 3) RPC: recuento por email (permite aviso en el formulario público; posible enumeración de emails)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.count_activities_for_organizer(p_email text)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.activities
  WHERE organizer_email = lower(trim(p_email));
$$;

REVOKE ALL ON FUNCTION public.count_activities_for_organizer(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_activities_for_organizer(text) TO anon, authenticated;

COMMENT ON FUNCTION public.count_activities_for_organizer(text) IS
  'Devuelve cuántas actividades hay para el email del organizador (mismo criterio que el trigger).';

-- ---------------------------------------------------------------------------
-- 4) RPC: comprobar si el correo está en registrations (formulario público)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_attendee_email_registered(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registrations
    WHERE lower(trim(email)) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.is_attendee_email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_attendee_email_registered(text) TO anon, authenticated;

COMMENT ON FUNCTION public.is_attendee_email_registered(text) IS
  'true si el correo aparece en registrations (comparación en minúsculas).';
