# Configuración de Actividades en Supabase

Esta guía te ayudará a configurar Supabase para almacenar las actividades propuestas por los participantes.

## Reglas en base de datos (organizador inscrito y máximo 2 actividades)

### Inserción desde el panel admin (equipo organizador)

- Si el `INSERT` se hace con **sesión de Supabase Auth** (`auth.uid()` no nulo), el trigger **omite** la comprobación de `registrations` y el **límite de 2** actividades por correo.
- El formulario público sigue sin sesión (rol **anon**): ahí sí aplican inscripción + máximo 2.
- En la aplicación, la pestaña **Actividades** de `/admin` incluye el botón **Crear actividad** para dar de alta propuestas de la organización.

### Email del organizador en `registrations` (solo formulario público)

- Con **anon**, el valor de `organizer_email` debe existir en **`registrations`**, comparando en **minúsculas** (`lower(trim(email))`).
- Si no hay ninguna fila de registro con ese correo, el `INSERT` falla con `ACTIVITIES_ORGANIZER_NOT_REGISTERED`.
- El trigger es **`SECURITY DEFINER`** para que el rol `anon` no necesite permisos `SELECT` sobre `registrations`.

### Límite de 2 actividades por correo (solo formulario público)

- Con **anon**, cada **correo de organizador** puede tener como máximo **2 filas** en `activities`.
- El recuento en el trigger también usa **`SECURITY DEFINER`**, para que no quede limitado por la política RLS que solo deja ver actividades muy recientes al rol `anon`.
- Cuentan **todas** las filas de ese email, **incluidos** estados `cancelled` y `rejected`.

### RPC usadas desde el formulario

- `count_activities_for_organizer(p_email)` y `is_attendee_email_registered(p_email)` permiten avisos antes de enviar. Ambas son `SECURITY DEFINER` y permiten a `anon` consultar solo esos datos agregados (sigue existiendo un riesgo menor de enumeración de correos).

### Migración en proyectos ya desplegados

- Vuelve a ejecutar el SQL actualizado de **`supabase-activities-rls-cap-migration.sql`** si aún tenías el trigger antiguo solo de “máximo 2” o sin comprobar `registrations`.

## Paso 1: Crear la Tabla de Actividades

1. En el panel de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en **New Query**
3. Copia y pega el contenido completo del archivo `supabase-activities-schema.sql` que está en la raíz del proyecto
4. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
5. Deberías ver un mensaje de éxito confirmando que la tabla se creó correctamente

Este script incluye: políticas RLS (público + panel admin), trigger de validación (`registrations` + máximo 2 por email) y las RPC de recuento y de comprobación de correo inscrito.

### Verificar que la tabla se creó

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver una tabla llamada `activities`
3. Haz clic en ella para ver su estructura y confirmar que tiene todas las columnas correctas, incluyendo el campo `documents` (tipo JSONB)

## Proyectos ya existentes: migración RLS y límite de 2 actividades

Si ya ejecutaste una versión antigua de `supabase-activities-schema.sql` (por ejemplo con una sola política `SELECT` limitada al último minuto para todos los roles), el panel de administración podría **no listar** actividades antiguas.

1. Abre **SQL Editor** en Supabase.
2. Ejecuta el contenido completo de **`supabase-activities-rls-cap-migration.sql`** (raíz del repositorio).
3. Comprueba en **Table Editor** o con una consulta SQL que las actividades se listan correctamente con un usuario autenticado en `/admin`.

### Políticas RLS resumidas

| Rol | INSERT | SELECT | UPDATE | DELETE |
|-----|--------|--------|--------|--------|
| `anon` | Sí | Solo filas con `created_at` en el último minuto (útil para `insert().select()` del formulario) | No | No |
| `authenticated` | Sí | Todas las filas | Sí (edición desde el panel admin) | Sí (borrado desde el panel admin) |

## Paso 2: Configurar Storage para Documentos

1. En el panel de Supabase, ve a **SQL Editor** nuevamente
2. Haz clic en **New Query**
3. Copia y pega el contenido completo del archivo `supabase-storage-setup.sql` que está en la raíz del proyecto
4. Haz clic en **Run**
5. Deberías ver un mensaje de éxito

### Verificar que el bucket se creó

1. Ve a **Storage** en el menú lateral de Supabase
2. Deberías ver un bucket llamado `activity-documents`
3. Haz clic en él para verificar que está configurado correctamente

## Estructura de Datos

### Tabla `activities`

Cada actividad se guarda como una fila separada con los siguientes campos:

- **Información del organizador**: `organizer_email`, `organizer_name`
- **Información de la actividad**: `type`, `name`, `description`
- **Participantes**: `min_participants`, `max_participants`
- **Horario**: `preferred_time_slot`, `duration`
- **Necesidades**: `participant_needs`, `organization_needs`, `space_need`, `setup`, `observations`
- **Documentos**: `documents` (JSONB) - Array con información de archivos subidos:
  ```json
  [
    {
      "name": "archivo.pdf",
      "url": "https://...",
      "path": "activities/email_activity0_file0_1710000000000.pdf",
      "size": 12345,
      "type": "application/pdf"
    }
  ]
  ```
- **Estado**: `status` (pending, approved, rejected, cancelled)
- **Metadatos**: `id`, `created_at`, `updated_at`

### Storage `activity-documents`

Los archivos se organizan en la siguiente estructura:

```
activity-documents/
  └── activities/
      └── {email_organizador}/
          └── {email}_activity{index}_file{index}_{timestamp}.{extension}
```
