# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para almacenar los registros de asistentes al evento.

## Paso 1: Crear un Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Completa la información:
   - **Name**: Nombre de tu proyecto (ej: `summer-cyd-registrations`)
   - **Database Password**: Crea una contraseña segura (guárdala en un lugar seguro)
   - **Region**: Elige la región más cercana a tus usuarios
   - **Pricing Plan**: Selecciona el plan gratuito para empezar

## Paso 2: Obtener las Credenciales de API

1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Encontrarás dos valores importantes:
   - **Project URL**: Esta es tu `VITE_SUPABASE_URL`
   - **anon public key**: Esta es tu `VITE_SUPABASE_ANON_KEY`

## Paso 3: Crear la Tabla en la Base de Datos

1. En el panel de Supabase, ve a **SQL Editor** (icono de base de datos en el menú lateral)
2. Haz clic en **New Query**
3. Copia y pega el contenido completo del archivo `supabase-schema.sql` que está en la raíz del proyecto
4. Haz clic en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
5. Si aparece una advertencia sobre "destructive operation", puedes continuar con confianza. El schema está diseñado para ser seguro y no eliminará datos existentes (usa `IF NOT EXISTS` y `IF EXISTS` para evitar problemas)
6. Deberías ver un mensaje de éxito confirmando que la tabla se creó correctamente

### Verificar que la tabla se creó

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver una tabla llamada `registrations`
3. Haz clic en ella para ver su estructura y confirmar que tiene todas las columnas correctas

## Paso 4: Configurar las Variables de Entorno

1. En la raíz del proyecto, copia el archivo `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y rellena los valores:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```

3. **IMPORTANTE**: El archivo `.env` está en `.gitignore`, así que tus credenciales no se subirán al repositorio

## Paso 5: Verificar la Configuración

1. Reinicia el servidor de desarrollo si está corriendo:

   ```bash
   npm run dev
   ```

2. Ve a la página de registro en tu aplicación
3. Completa el formulario y envía un registro de prueba
4. Ve a Supabase → **Table Editor** → **registrations** y verifica que el registro aparezca

## Estructura de la Tabla

La tabla `registrations` contiene los siguientes campos:

- **id**: UUID único generado automáticamente
- **first_name**: Nombre del asistente
- **last_name**: Apellidos del asistente
- **nickname**: Mote/Alias (opcional)
- **email**: Correo electrónico (parte de índice único compuesto con first_name y birth_date)
- **phone**: Teléfono de contacto
- **birth_date**: Fecha de nacimiento
- **is_minor**: Boolean que indica si es menor de edad
- **emergency_contact_name**: Nombre del contacto de emergencia (opcional)
- **emergency_contact_phone**: Teléfono del contacto de emergencia (opcional)
- **arrival_date**: Fecha y hora de llegada estimada
- **departure_date**: Fecha y hora de salida estimada (opcional)
- **accommodation**: Tipo de alojamiento seleccionado
- **diet**: Array de restricciones alimentarias
- **comments**: Comentarios adicionales sobre alojamiento (opcional)
- **diet_comments**: Comentarios sobre restricciones alimentarias (opcional)
- **terms_accepted**: Boolean que indica si se aceptaron los términos
- **created_at**: Fecha y hora de creación (automático)
- **updated_at**: Fecha y hora de última actualización (automático)

## Seguridad (Row Level Security)

El schema incluye Row Level Security (RLS) configurado de la siguiente manera:

- **INSERT**: Cualquiera puede crear registros (necesario para el formulario público)
- **SELECT**: Por defecto deshabilitado desde la aplicación (solo puedes ver los datos desde el dashboard de Supabase)

Si necesitas permitir lectura desde la aplicación, descomenta y ajusta la política en el archivo `supabase-schema.sql`.

## Consultas Útiles

### Ver todos los registros

```sql
SELECT * FROM registrations ORDER BY created_at DESC;
```

### Contar registros por tipo de alojamiento

```sql
SELECT accommodation, COUNT(*) as total
FROM registrations
GROUP BY accommodation;
```

### Ver registros de menores de edad

```sql
SELECT first_name, last_name, email, birth_date
FROM registrations
WHERE is_minor = true;
```

### Ver registros con restricciones alimentarias

```sql
SELECT first_name, last_name, email, diet, diet_comments
FROM registrations
WHERE array_length(diet, 1) > 0;
```

## Solución de Problemas

### Error: "Missing Supabase environment variables"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error: "relation 'registrations' does not exist"

- Asegúrate de haber ejecutado el SQL del archivo `supabase-schema.sql`
- Verifica que estás conectado al proyecto correcto de Supabase

### Error: "duplicate key value violates unique constraint"

- Esto significa que ya existe un registro con la misma combinación de email, nombre y fecha de nacimiento
- El sistema está funcionando correctamente, solo evita duplicados de la misma persona

### Error: "new row violates row-level security policy" (Código 42501)

Este error indica que la política de Row Level Security (RLS) está bloqueando la inserción. Sigue estos pasos en orden:

#### Paso 1: Diagnosticar el problema

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el archivo `supabase-diagnose-rls.sql` para ver el estado actual de las políticas
3. Revisa los resultados para ver qué políticas existen

#### Paso 2: Solución recomendada

1. Ejecuta el archivo `supabase-fix-rls-complete.sql` en el SQL Editor
2. Este script elimina todas las políticas existentes y crea una nueva con nombre simple
3. Intenta guardar el registro de nuevo

#### Paso 3: Si aún no funciona (solo para desarrollo)

Si el problema persiste y estás en desarrollo/testing:

1. Ejecuta `supabase-disable-rls-temporary.sql` para deshabilitar RLS temporalmente
2. ⚠️ **ADVERTENCIA**: Esto desactiva la seguridad. Solo úsalo para desarrollo
3. Una vez que funcione, vuelve a habilitar RLS y crea las políticas correctas

#### Verificación manual

También puedes verificar manualmente:

1. Ve a **Authentication** → **Policies** en Supabase
2. Selecciona la tabla `registrations`
3. Verifica que existe una política de INSERT para roles `anon` y `authenticated`
4. Si no existe o está mal configurada, ejecuta `supabase-fix-rls-complete.sql`

### Los datos no aparecen en Supabase

- Verifica que las credenciales en `.env` son correctas
- Revisa la consola del navegador para ver errores
- Verifica que RLS permite INSERT en la tabla
- Si ves el error 42501, ejecuta el script `supabase-fix-rls.sql`

## Exportar Datos

Para exportar los datos desde Supabase:

1. Ve a **Table Editor** → **registrations**
2. Haz clic en el botón de exportar (icono de descarga)
3. Elige el formato (CSV, JSON, etc.)

## Próximos Pasos

- Considera añadir un panel de administración para ver los registros desde la aplicación
- Puedes configurar notificaciones por email cuando se cree un nuevo registro
- Considera añadir validaciones adicionales en la base de datos
