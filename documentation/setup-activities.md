# Configuración de Actividades en Supabase

Esta guía te ayudará a configurar Supabase para almacenar las actividades propuestas por los participantes.

## Paso 1: Crear la Tabla de Actividades

1. En el panel de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en **New Query**
3. Copia y pega el contenido completo del archivo `supabase-activities-schema.sql` que está en la raíz del proyecto
4. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
5. Deberías ver un mensaje de éxito confirmando que la tabla se creó correctamente

### Verificar que la tabla se creó

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver una tabla llamada `activities`
3. Haz clic en ella para ver su estructura y confirmar que tiene todas las columnas correctas, incluyendo el campo `documents` (tipo JSONB)

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
