-- Políticas RLS para administradores
-- Ejecuta este script después de crear usuarios administradores en Supabase

-- Política: Permitir SELECT de todos los registros para usuarios autenticados (administradores)
CREATE POLICY "allow_admin_select_all_registrations"
  ON public.registrations
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Permitir UPDATE de registros para usuarios autenticados (administradores)
CREATE POLICY "allow_admin_update_registrations"
  ON public.registrations
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Permitir DELETE de registros para usuarios autenticados (administradores)
CREATE POLICY "allow_admin_delete_registrations"
  ON public.registrations
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (true);

-- Verificar políticas creadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'registrations'
ORDER BY cmd, policyname;

