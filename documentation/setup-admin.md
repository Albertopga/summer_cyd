# Configuración del Panel de Administración

Esta guía te ayudará a configurar el panel de administración para gestionar los registros de asistentes.

## Paso 1: Crear Usuario Administrador en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** → **Users** en el menú lateral
3. Haz clic en **Add user** → **Create new user**
4. Completa el formulario:
   - **Email**: El email que usarás para iniciar sesión como administrador
   - **Password**: Crea una contraseña segura
   - **Auto Confirm User**: Activa esta opción para que el usuario pueda iniciar sesión inmediatamente
5. Haz clic en **Create user**

## Paso 2: Configurar Políticas RLS para Administradores

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el archivo `supabase-admin-policies.sql` que está en la raíz del proyecto
3. Esto creará las políticas necesarias para que los usuarios autenticados puedan:
   - Leer todos los registros (SELECT)
   - Actualizar registros (UPDATE)

## Paso 3: Configurar Variables de Entorno (si es necesario)

Las mismas variables de entorno que ya tienes configuradas funcionan para el panel de administración:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

## Paso 4: Acceder al Panel de Administración

1. Inicia tu servidor de desarrollo:

   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:5173/admin` (o la URL de tu aplicación + `/admin`)

3. Inicia sesión con las credenciales del usuario administrador que creaste

## Funcionalidades del Panel

### Listado de Registros

- Ver todos los registros de asistentes ordenados por fecha de creación (más recientes primero)
- Ver información básica: nombre, email, teléfono, alojamiento, fecha de registro
- Contador total de registros

### Edición de Registros

Puedes editar los siguientes campos (configurables en el componente):

- **Teléfono** (`phone`)
- **Contacto de emergencia - Nombre** (`emergency_contact_name`)
- **Contacto de emergencia - Teléfono** (`emergency_contact_phone`)
- **Fecha de llegada** (`arrival_date`)
- **Fecha de salida** (`departure_date`)
- **Alojamiento** (`accommodation`)
- **Restricciones alimentarias** (`diet`)
- **Comentarios adicionales** (`comments`)
- **Comentarios sobre dieta** (`diet_comments`)

### Personalizar Campos Editables

Para cambiar qué campos se pueden editar, modifica el array `editableFields` en `src/views/AdminView.vue`:

```javascript
const editableFields = ref([
  'phone',
  'emergency_contact_name',
  'emergency_contact_phone',
  'arrival_date',
  'departure_date',
  'accommodation',
  'diet',
  'comments',
  'diet_comments',
])
```

Simplemente añade o elimina campos del array según tus necesidades.

## Seguridad

- El panel requiere autenticación mediante Supabase Auth
- Solo usuarios autenticados pueden acceder a los datos
- Las políticas RLS garantizan que solo usuarios autenticados puedan leer y actualizar registros
- Los usuarios anónimos solo pueden crear registros (INSERT), no leerlos ni modificarlos

## Solución de Problemas

### Error: "Invalid login credentials"

- Verifica que el usuario administrador existe en Supabase
- Verifica que el usuario tiene "Auto Confirm User" activado
- Verifica que estás usando el email y contraseña correctos

### Error: "new row violates row-level security policy"

- Asegúrate de haber ejecutado `supabase-admin-policies.sql`
- Verifica que estás autenticado correctamente
- Verifica que las políticas RLS están activas en la tabla `registrations`

### No puedo ver los registros

- Verifica que estás autenticado (deberías ver "Cerrar sesión" en la parte superior)
- Verifica que las políticas de SELECT están creadas correctamente
- Revisa la consola del navegador para ver errores específicos

### No puedo editar registros

- Verifica que las políticas de UPDATE están creadas correctamente
- Verifica que los campos que intentas editar están en el array `editableFields`
- Revisa la consola del navegador para ver errores específicos

## Próximos Pasos

- Considera añadir paginación para listas grandes de registros
- Puedes añadir filtros y búsqueda para encontrar registros específicos
- Considera añadir exportación de datos a CSV o Excel
- Puedes añadir más campos editables según tus necesidades
