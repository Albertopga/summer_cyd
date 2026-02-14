# Configuración de Gestión de Usuarios

Esta guía te ayudará a configurar la funcionalidad de gestión de usuarios en el panel de administración.

## ⚠️ Importante: Seguridad

La clave de servicio (`service_role` key) de Supabase tiene **permisos completos** sobre tu base de datos. **NUNCA** la expongas públicamente ni la subas a repositorios públicos.

- ✅ Úsala solo en entornos seguros (backend, servidor privado)
- ❌ NO la expongas en el código frontend en producción pública
- ❌ NO la compartas públicamente

## Paso 1: Obtener la Service Role Key

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API** en el menú lateral
3. En la sección **Project API keys**, encontrarás:
   - **anon public**: Esta es la clave que ya estás usando (`VITE_SUPABASE_ANON_KEY`)
   - **service_role**: Esta es la clave que necesitas para gestionar usuarios

4. Copia el valor de **service_role** (manténlo seguro, no lo compartas)

## Paso 2: Configurar la Variable de Entorno

### Desarrollo Local

1. Abre tu archivo `.env` en la raíz del proyecto
2. Añade la siguiente línea:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

3. Reinicia tu servidor de desarrollo:

```bash
npm run dev
```

### Producción (Vercel, Netlify, etc.)

1. Ve a la configuración de tu proyecto en la plataforma de hosting
2. Ve a **Environment Variables** o **Variables de Entorno**
3. Añade una nueva variable:
   - **Nombre**: `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - **Valor**: Tu service_role key de Supabase
4. Guarda los cambios y vuelve a desplegar la aplicación

## Paso 3: Verificar la Configuración

1. Inicia sesión en el panel de administración (`/admin`)
2. Ve a la pestaña **Usuarios**
3. Si la configuración es correcta, verás:
   - Un botón "Crear usuario"
   - La lista de usuarios existentes (si hay alguno)

Si ves un mensaje de advertencia sobre la configuración, verifica que:

- La variable de entorno esté correctamente configurada
- El servidor se haya reiniciado después de añadir la variable
- El valor de la clave sea correcto (sin espacios ni comillas adicionales)

## Funcionalidades Disponibles

Una vez configurado, podrás:

### Crear Usuarios

1. Haz clic en "Crear usuario"
2. Completa el formulario:
   - **Email**: El correo electrónico del nuevo usuario
   - **Contraseña**: Mínimo 6 caracteres
   - **Email confirmado**: Marca esta opción para que el usuario pueda iniciar sesión inmediatamente
3. Haz clic en "Crear usuario"

### Editar Usuarios

1. Haz clic en "Editar" junto al usuario que quieres modificar
2. Puedes:
   - Cambiar la contraseña (deja en blanco si no quieres cambiarla)
   - Confirmar o desconfirmar el email
3. Haz clic en "Guardar cambios"

### Eliminar Usuarios

1. Haz clic en "Eliminar" junto al usuario que quieres eliminar
2. Confirma la eliminación en el modal
3. **⚠️ Advertencia**: Esta acción no se puede deshacer

## Información Mostrada

Para cada usuario, verás:

- **Email**: Correo electrónico del usuario
- **Email confirmado**: Si el email ha sido confirmado (necesario para iniciar sesión)
- **Última sesión**: Fecha y hora de la última vez que inició sesión
- **Fecha creación**: Cuándo se creó la cuenta

## Solución de Problemas

### Error: "Cliente de administración no configurado"

- Verifica que `VITE_SUPABASE_SERVICE_ROLE_KEY` esté en tu archivo `.env`
- Reinicia el servidor de desarrollo
- Verifica que no haya espacios o comillas alrededor del valor

### Error: "Error al crear el usuario"

- Verifica que el email no esté ya registrado
- Asegúrate de que la contraseña tenga al menos 6 caracteres
- Verifica que la service_role key sea válida y no haya expirado

### Los usuarios no pueden iniciar sesión

- Verifica que el checkbox "Email confirmado" esté marcado al crear el usuario
- Si el usuario ya existe, edítalo y marca "Email confirmado"

## Alternativa Segura (Recomendada para Producción)

Para mayor seguridad en producción, considera crear un endpoint backend que:

1. Reciba las peticiones del frontend
2. Use la service_role key solo en el servidor (nunca en el cliente)
3. Valide las peticiones antes de ejecutar operaciones administrativas

Esto mantiene la service_role key completamente fuera del código frontend.
