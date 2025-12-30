-- Schema para la tabla de registros de asistentes al evento
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Crear la tabla de registros
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos personales
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
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
  diet TEXT[] DEFAULT '{}',
  comments TEXT,
  diet_comments TEXT,
  
  -- Consentimiento
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  
  -- Estado de pago
  accommodation_paid BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índice único compuesto (email, first_name, birth_date) para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS registrations_unique_person ON public.registrations(email, first_name, birth_date);

-- Crear índice en created_at para consultas ordenadas por fecha
CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON public.registrations(created_at DESC);

-- Crear índice en accommodation para filtros
CREATE INDEX IF NOT EXISTS registrations_accommodation_idx ON public.registrations(accommodation);

-- Crear índice en accommodation_paid para consultas rápidas por estado de pago
CREATE INDEX IF NOT EXISTS registrations_accommodation_paid_idx ON public.registrations(accommodation_paid);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
COMMENT ON COLUMN public.registrations.first_name IS 'Nombre del asistente';
COMMENT ON COLUMN public.registrations.last_name IS 'Apellidos del asistente';
COMMENT ON COLUMN public.registrations.nickname IS 'Mote/Alias del asistente para el evento';
COMMENT ON COLUMN public.registrations.email IS 'Correo electrónico (parte de índice único compuesto con first_name y birth_date)';
COMMENT ON COLUMN public.registrations.phone IS 'Teléfono de contacto';
COMMENT ON COLUMN public.registrations.birth_date IS 'Fecha de nacimiento';
COMMENT ON COLUMN public.registrations.is_minor IS 'Indica si el asistente es menor de edad';
COMMENT ON COLUMN public.registrations.emergency_contact_name IS 'Nombre del contacto de emergencia';
COMMENT ON COLUMN public.registrations.emergency_contact_phone IS 'Teléfono del contacto de emergencia';
COMMENT ON COLUMN public.registrations.arrival_date IS 'Fecha y hora de llegada estimada';
COMMENT ON COLUMN public.registrations.departure_date IS 'Fecha y hora de salida estimada';
COMMENT ON COLUMN public.registrations.accommodation IS 'Tipo de alojamiento seleccionado';
COMMENT ON COLUMN public.registrations.diet IS 'Array de restricciones alimentarias';
COMMENT ON COLUMN public.registrations.comments IS 'Comentarios adicionales sobre alojamiento';
COMMENT ON COLUMN public.registrations.diet_comments IS 'Comentarios adicionales sobre restricciones alimentarias';
COMMENT ON COLUMN public.registrations.terms_accepted IS 'Indica si se aceptaron los términos y condiciones';
COMMENT ON COLUMN public.registrations.accommodation_paid IS 'Indica si el alojamiento está pagado';
COMMENT ON COLUMN public.registrations.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN public.registrations.updated_at IS 'Fecha y hora de última actualización';

