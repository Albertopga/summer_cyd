-- Configuración de Storage para documentos de actividades
-- Ejecuta este SQL en el SQL Editor de Supabase después de crear la tabla activities

-- Crear el bucket para almacenar documentos de actividades
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-documents', 'activity-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir subir archivos (cualquiera puede subir)
CREATE POLICY "Permitir subida de documentos de actividades"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'activity-documents' AND
  (storage.foldername(name))[1] = 'activities'
);

-- Política para permitir lectura de archivos (solo autenticados o según necesidad)
-- Por defecto, los archivos son privados, pero puedes ajustar según tus necesidades
CREATE POLICY "Permitir lectura de documentos de actividades"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'activity-documents' AND
  (storage.foldername(name))[1] = 'activities'
);

-- Política para permitir eliminación (solo autenticados, opcional)
CREATE POLICY "Permitir eliminación de documentos de actividades"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-documents' AND
  (storage.foldername(name))[1] = 'activities'
);

