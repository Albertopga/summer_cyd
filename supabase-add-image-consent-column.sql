-- Añade el consentimiento específico de imagen a registros ya existentes.
-- Ejecutar en el SQL Editor de Supabase si la tabla ya fue creada sin esta columna.

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS image_consent_accepted BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.registrations.image_consent_accepted IS 'Consentimiento específico para tratamiento de imagen (difusión) según política de privacidad';
