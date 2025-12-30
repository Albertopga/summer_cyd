# Configuración de Variables de Entorno en Vercel

Esta guía te ayudará a configurar las variables de entorno necesarias para que la aplicación funcione correctamente en Vercel.

## Paso 1: Acceder a la Configuración de Vercel

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**

## Paso 2: Añadir las Variables de Entorno

Añade las siguientes variables de entorno:

### Variables Requeridas

1. **`VITE_SUPABASE_URL`**
   - **Value**: Tu URL de proyecto de Supabase
   - **Ejemplo**: `https://wirsdcclxydciogimwqg.supabase.co`
   - **Environment**: Selecciona todas las opciones (Production, Preview, Development)
   - ⚠️ **IMPORTANTE**: No incluyas comillas simples (`'`) o dobles (`"`) en los valores. Pega el valor directamente sin comillas.

2. **`VITE_SUPABASE_ANON_KEY`**
   - **Value**: Tu clave anónima (anon public key) de Supabase
   - **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Environment**: Selecciona todas las opciones (Production, Preview, Development)
   - ⚠️ **IMPORTANTE**: No incluyas comillas simples (`'`) o dobles (`"`) en los valores. Pega el valor directamente sin comillas.

### Cómo Obtener los Valores

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia los valores:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Paso 3: Guardar y Redesplegar

1. Haz clic en **Save** después de añadir cada variable
2. Ve a **Deployments**
3. Haz clic en los tres puntos (⋯) del último deployment
4. Selecciona **Redeploy**
5. Confirma el redespliegue

## Paso 4: Verificar

1. Espera a que termine el redespliegue
2. Abre tu aplicación desplegada
3. Debería funcionar correctamente sin errores de configuración

## Solución de Problemas

### Error: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**Causa**: La variable `VITE_SUPABASE_URL` no está configurada o tiene un valor incorrecto.

**Solución**:

1. Verifica que la variable esté añadida en Vercel
2. Verifica que el valor comience con `https://` (no debe tener espacios ni caracteres extra)
3. Verifica que hayas seleccionado el entorno correcto (Production, Preview, Development)
4. Redesplega la aplicación después de añadir/modificar las variables

### Error: "Faltan las variables de entorno de Supabase"

**Causa**: Una o ambas variables no están configuradas.

**Solución**:

1. Ve a **Settings** → **Environment Variables** en Vercel
2. Verifica que ambas variables existan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Verifica que los valores sean correctos (sin espacios al inicio/final)
4. Redesplega la aplicación

### Las variables están configuradas pero sigue sin funcionar

1. **Verifica que hayas redesplegado**: Las variables de entorno solo se aplican en nuevos deployments
2. **Verifica el entorno**: Asegúrate de que las variables estén configuradas para el entorno correcto (Production, Preview, Development)
3. **Verifica los valores**: Copia y pega los valores directamente desde Supabase para evitar errores de tipeo
4. **Revisa los logs**: Ve a **Deployments** → Selecciona el deployment → **Build Logs** para ver si hay errores

## Notas Importantes

- ⚠️ **Las variables de entorno con prefijo `VITE_` son públicas**: Se incluyen en el bundle del cliente. Esto es normal y seguro para las claves anónimas de Supabase.
- ✅ **No compartas las claves**: Aunque las claves anónimas son públicas, no las compartas públicamente.
- 🔄 **Redespliegue necesario**: Después de añadir o modificar variables de entorno, debes redesplegar la aplicación.
- 🌍 **Entornos múltiples**: Puedes tener valores diferentes para Production, Preview y Development si lo necesitas.

## Verificación Rápida

Para verificar que las variables están configuradas correctamente:

1. Ve a tu aplicación desplegada en Vercel
2. Abre la consola del navegador (F12)
3. Si ves el error "Invalid supabaseUrl", las variables no están configuradas
4. Si no hay errores y la aplicación funciona, las variables están correctas
