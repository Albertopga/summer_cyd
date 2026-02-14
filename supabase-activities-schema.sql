-- Schema para la tabla de actividades propuestas por participantes
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Crear la tabla de actividades
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información del organizador (para vincular con el registro)
  organizer_email TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  
  -- Información de la actividad
  type TEXT NOT NULL CHECK (type IN ('rol-vivo', 'rol-mesa', 'juego-mesa', 'torneo', 'taller', 'demo', 'otra')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Participantes
  min_participants INTEGER NOT NULL CHECK (min_participants > 0),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  CHECK (min_participants <= max_participants),
  
  -- Horario y duración
  preferred_time_slot TEXT NOT NULL CHECK (preferred_time_slot IN (
    'viernes-tarde', 'viernes-noche', 'sabado-manana', 'sabado-tarde', 
    'sabado-noche', 'domingo-manana', 'domingo-tarde'
  )),
  duration TEXT NOT NULL,
  
  -- Necesidades y requisitos
  participant_needs TEXT,
  organization_needs TEXT,
  space_need TEXT CHECK (space_need IN (
    'sala-interior', 'sala-exterior', 'espacio-abierto', 'aula', 
    'comedor', 'sin-requisitos', ''
  )),
  setup TEXT,
  observations TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Estado de la actividad
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by TEXT,
  approval_notes TEXT,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Crear índice en organizer_email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS activities_organizer_email_idx ON public.activities(organizer_email);

-- Crear índice en type para filtros por tipo de actividad
CREATE INDEX IF NOT EXISTS activities_type_idx ON public.activities(type);

-- Crear índice en preferred_time_slot para filtros por horario
CREATE INDEX IF NOT EXISTS activities_time_slot_idx ON public.activities(preferred_time_slot);

-- Crear índice en status para filtros por estado
CREATE INDEX IF NOT EXISTS activities_status_idx ON public.activities(status);

-- Crear índice en created_at para consultas ordenadas por fecha
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON public.activities(created_at DESC);

-- Función auxiliar para políticas RLS (reutilizar la existente o crear si no existe)
CREATE OR REPLACE FUNCTION always_true()
RETURNS boolean AS $$
BEGIN
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar updated_at automáticamente (reutilizar la existente o crear específica)
-- La función update_updated_at_column() ya existe en el schema de registrations, podemos reutilizarla

-- Trigger para actualizar updated_at automáticamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_activities_updated_at'
  ) THEN
    CREATE TRIGGER update_activities_updated_at
      BEFORE UPDATE ON public.activities
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "allow_insert_activities" ON public.activities;
DROP POLICY IF EXISTS "allow_select_activities" ON public.activities;

-- Política: Permitir inserción de actividades (cualquiera puede proponer actividades)
CREATE POLICY "allow_insert_activities"
  ON public.activities
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (always_true());

-- Política: Permitir SELECT de actividades recientes (necesario para .select() después de .insert())
-- Permite leer actividades creadas en el último minuto para verificar la inserción
CREATE POLICY "allow_select_activities"
  ON public.activities
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (created_at > NOW() - INTERVAL '1 minute');

-- Comentarios en la tabla para documentación
COMMENT ON TABLE public.activities IS 'Actividades propuestas por participantes para el Retiro Lúdico';
COMMENT ON COLUMN public.activities.id IS 'Identificador único de la actividad';
COMMENT ON COLUMN public.activities.organizer_email IS 'Email del organizador (para vincular con registro)';
COMMENT ON COLUMN public.activities.organizer_name IS 'Nombre del organizador de la actividad';
COMMENT ON COLUMN public.activities.type IS 'Tipo de actividad (rol-vivo, rol-mesa, juego-mesa, etc.)';
COMMENT ON COLUMN public.activities.name IS 'Nombre de la actividad';
COMMENT ON COLUMN public.activities.description IS 'Descripción detallada de la actividad';
COMMENT ON COLUMN public.activities.min_participants IS 'Mínimo de participantes requeridos';
COMMENT ON COLUMN public.activities.max_participants IS 'Máximo de participantes permitidos';
COMMENT ON COLUMN public.activities.preferred_time_slot IS 'Franja horaria preferida para la actividad';
COMMENT ON COLUMN public.activities.duration IS 'Duración estimada de la actividad';
COMMENT ON COLUMN public.activities.participant_needs IS 'Necesidades que deben cubrir los participantes';
COMMENT ON COLUMN public.activities.organization_needs IS 'Necesidades que debe cubrir la organización';
COMMENT ON COLUMN public.activities.space_need IS 'Tipo de espacio necesario';
COMMENT ON COLUMN public.activities.setup IS 'Descripción de la puesta en marcha';
COMMENT ON COLUMN public.activities.observations IS 'Observaciones adicionales';
COMMENT ON COLUMN public.activities.documents IS 'Array JSON con URLs de documentos subidos (formato: [{"name": "archivo.pdf", "url": "https://...", "size": 12345}])';
COMMENT ON COLUMN public.activities.status IS 'Estado de la actividad (pending, approved, rejected, cancelled)';
COMMENT ON COLUMN public.activities.approved_by IS 'Usuario que aprobó/rechazó la actividad';
COMMENT ON COLUMN public.activities.approval_notes IS 'Notas de aprobación/rechazo';
COMMENT ON COLUMN public.activities.created_at IS 'Fecha y hora de creación de la actividad';
COMMENT ON COLUMN public.activities.updated_at IS 'Fecha y hora de última actualización';

