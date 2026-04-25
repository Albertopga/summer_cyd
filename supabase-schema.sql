-- Schema para la tabla de registros de asistentes al evento
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Crear la tabla de registros
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID DEFAULT gen_random_uuid() NOT NULL,
  family_role TEXT NOT NULL DEFAULT 'holder' CHECK (family_role IN ('holder', 'partner', 'child')),
  family_contact_email TEXT,
  
  -- Datos personales
  full_name TEXT NOT NULL,
  nickname TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE NOT NULL,
  is_minor BOOLEAN NOT NULL DEFAULT false,
  
  -- Contacto de emergencia
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Logística del retiro
  arrival_date TIMESTAMPTZ NOT NULL,
  departure_date TIMESTAMPTZ,
  accommodation TEXT NOT NULL CHECK (accommodation IN ('albergue', 'chozos', 'chozo-individual', 'especial')),
  child_shares_parent_chozo BOOLEAN NOT NULL DEFAULT false,
  diet TEXT[] DEFAULT '{}',
  comments TEXT,
  diet_comments TEXT,
  
  -- Consentimiento
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  image_consent_accepted BOOLEAN NOT NULL DEFAULT false,
  
  -- Estado de pago
  accommodation_paid BOOLEAN NOT NULL DEFAULT false,
  attendee_number INTEGER,
  temp_attendee_number INTEGER,
  last_payment_reminder_sent_at TIMESTAMPTZ,
  payment_reminder_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índice único compuesto (email, full_name, birth_date) para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS registrations_unique_person ON public.registrations(email, full_name, birth_date);

-- Crear índice en created_at para consultas ordenadas por fecha
CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON public.registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS registrations_family_group_id_idx ON public.registrations(family_group_id);
CREATE INDEX IF NOT EXISTS registrations_family_role_idx ON public.registrations(family_role);

-- Crear índice en accommodation para filtros
CREATE INDEX IF NOT EXISTS registrations_accommodation_idx ON public.registrations(accommodation);

-- Crear índice en accommodation_paid para consultas rápidas por estado de pago
CREATE INDEX IF NOT EXISTS registrations_accommodation_paid_idx ON public.registrations(accommodation_paid);
CREATE UNIQUE INDEX IF NOT EXISTS registrations_attendee_number_unique_idx
  ON public.registrations(attendee_number)
  WHERE attendee_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS registrations_temp_attendee_number_unique_idx
  ON public.registrations(temp_attendee_number)
  WHERE temp_attendee_number IS NOT NULL;

-- Índice para controlar cadencia de recordatorios de pago
CREATE INDEX IF NOT EXISTS registrations_last_payment_reminder_sent_at_idx
  ON public.registrations(last_payment_reminder_sent_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar número de asistente al confirmar pago
CREATE OR REPLACE FUNCTION assign_attendee_number_on_payment()
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

-- Función para asignar número temporal al insertar registro
CREATE OR REPLACE FUNCTION assign_temp_attendee_number_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.temp_attendee_number IS NULL THEN
    NEW.temp_attendee_number := nextval('public.registrations_temp_attendee_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para propagar pago a miembros de la familia cuando paga el titular
CREATE OR REPLACE FUNCTION sync_family_payment_from_holder()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.family_role = 'holder'
     AND NEW.accommodation_paid = true
     AND (OLD.accommodation_paid IS DISTINCT FROM true)
     AND NEW.family_group_id IS NOT NULL THEN
    UPDATE public.registrations
    SET accommodation_paid = true
    WHERE family_group_id = NEW.family_group_id
      AND id <> NEW.id
      AND accommodation_paid IS DISTINCT FROM true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función RPC para resincronizar la secuencia tras reasignaciones manuales
CREATE OR REPLACE FUNCTION sync_attendee_number_sequence()
RETURNS VOID AS $$
BEGIN
  PERFORM setval(
    'public.registrations_attendee_number_seq',
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 1),
    COALESCE((SELECT MAX(attendee_number) FROM public.registrations), 0) > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at automáticamente
-- Solo crear el trigger si no existe (evita el DROP que genera advertencia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_registrations_updated_at'
  ) THEN
    CREATE TRIGGER update_registrations_updated_at
      BEFORE UPDATE ON public.registrations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger para sincronizar estado de pago de familia desde titular
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'sync_family_payment_from_holder_trigger'
  ) THEN
    CREATE TRIGGER sync_family_payment_from_holder_trigger
      AFTER UPDATE ON public.registrations
      FOR EACH ROW
      EXECUTE FUNCTION sync_family_payment_from_holder();
  END IF;
END $$;

-- Secuencia para generar números de asistente
CREATE SEQUENCE IF NOT EXISTS public.registrations_attendee_number_seq
  AS INTEGER
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.registrations_temp_attendee_number_seq
  AS INTEGER
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Trigger para asignar número de asistente al marcar pago
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_attendee_number_on_payment'
  ) THEN
    CREATE TRIGGER set_attendee_number_on_payment
      BEFORE UPDATE ON public.registrations
      FOR EACH ROW
      EXECUTE FUNCTION assign_attendee_number_on_payment();
  END IF;
END $$;

-- Trigger para asignar número temporal al crear registro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_temp_attendee_number_on_insert'
  ) THEN
    CREATE TRIGGER set_temp_attendee_number_on_insert
      BEFORE INSERT ON public.registrations
      FOR EACH ROW
      EXECUTE FUNCTION assign_temp_attendee_number_on_insert();
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para políticas RLS
CREATE OR REPLACE FUNCTION always_true()
RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Permitir inserción de registros" ON public.registrations;
DROP POLICY IF EXISTS "allow_insert_registrations" ON public.registrations;
DROP POLICY IF EXISTS "allow_select_recent_registrations" ON public.registrations;

-- Política: Permitir inserción de datos (cualquiera puede registrarse)
CREATE POLICY "allow_insert_registrations"
  ON public.registrations
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (always_true());

-- Política: Permitir SELECT de registros recientes (necesario para .select() después de .insert())
-- Permite leer registros creados en el último minuto para verificar la inserción
CREATE POLICY "allow_select_recent_registrations"
  ON public.registrations
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (created_at > NOW() - INTERVAL '1 minute');

-- Comentarios en la tabla para documentación
COMMENT ON TABLE public.registrations IS 'Registros de asistentes al Retiro Lúdico de Castilla y Dragón';
COMMENT ON COLUMN public.registrations.id IS 'Identificador único del registro';
COMMENT ON COLUMN public.registrations.family_group_id IS 'Identificador del grupo familiar asociado a la inscripción';
COMMENT ON COLUMN public.registrations.family_role IS 'Rol dentro del grupo familiar: titular, pareja o hijo/a';
COMMENT ON COLUMN public.registrations.family_contact_email IS 'Email de contacto del titular de la familia';
COMMENT ON COLUMN public.registrations.full_name IS 'Nombre y apellidos del asistente';
COMMENT ON COLUMN public.registrations.nickname IS 'Mote/Alias del asistente para el evento';
COMMENT ON COLUMN public.registrations.email IS 'Correo electrónico (parte de índice único compuesto con full_name y birth_date)';
COMMENT ON COLUMN public.registrations.phone IS 'Teléfono de contacto';
COMMENT ON COLUMN public.registrations.birth_date IS 'Fecha de nacimiento';
COMMENT ON COLUMN public.registrations.is_minor IS 'Indica si el asistente es menor de edad';
COMMENT ON COLUMN public.registrations.emergency_contact_name IS 'Nombre del contacto de emergencia';
COMMENT ON COLUMN public.registrations.emergency_contact_phone IS 'Teléfono del contacto de emergencia';
COMMENT ON COLUMN public.registrations.arrival_date IS 'Fecha y hora de llegada estimada';
COMMENT ON COLUMN public.registrations.departure_date IS 'Fecha y hora de salida estimada';
COMMENT ON COLUMN public.registrations.accommodation IS 'Tipo de alojamiento seleccionado';
COMMENT ON COLUMN public.registrations.child_shares_parent_chozo IS 'Para menores: indica si comparte chozo con progenitores';
COMMENT ON COLUMN public.registrations.diet IS 'Array de restricciones alimentarias';
COMMENT ON COLUMN public.registrations.comments IS 'Comentarios adicionales sobre alojamiento';
COMMENT ON COLUMN public.registrations.diet_comments IS 'Comentarios adicionales sobre restricciones alimentarias';
COMMENT ON COLUMN public.registrations.terms_accepted IS 'Indica si se aceptaron los términos y condiciones';
COMMENT ON COLUMN public.registrations.image_consent_accepted IS 'Consentimiento específico para tratamiento de imagen (difusión) según política de privacidad';
COMMENT ON COLUMN public.registrations.accommodation_paid IS 'Indica si el alojamiento está pagado';
COMMENT ON COLUMN public.registrations.attendee_number IS 'Número oficial de asistente, asignado al confirmar el pago del alojamiento';
COMMENT ON COLUMN public.registrations.temp_attendee_number IS 'Número temporal asignado al crear el registro, útil para identificación previa al pago';
COMMENT ON COLUMN public.registrations.last_payment_reminder_sent_at IS 'Fecha/hora del último email de recordatorio de pago enviado al asistente';
COMMENT ON COLUMN public.registrations.payment_reminder_count IS 'Número de emails de recordatorio de pago enviados';
COMMENT ON COLUMN public.registrations.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN public.registrations.updated_at IS 'Fecha y hora de última actualización';

