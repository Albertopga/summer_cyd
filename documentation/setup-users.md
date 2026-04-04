# Usuarios del panel de administración

Esta guía describe cómo encaja la pestaña **Usuarios** de `/admin` con Supabase Auth y qué puedes hacer desde la aplicación frente al dashboard de Supabase.

## Contexto de seguridad

La aplicación es una **SPA** que usa la clave **anon** (`VITE_SUPABASE_ANON_KEY`). **No** se usa la clave `service_role` en el frontend: las operaciones sensibles sobre cuentas ajenas no están expuestas en el cliente.

## Crear el primer administrador

Hazlo desde Supabase (recomendado):

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email y contraseña seguros
3. Activa **Auto Confirm User** para poder iniciar sesión sin confirmar correo
4. Ejecuta también `supabase-admin-policies.sql` para RLS en `registrations` (ver [setup-admin.md](./setup-admin.md))

## Qué permite la pestaña Usuarios en `/admin`

### Listado

- Solo se muestra el **usuario con sesión iniciada** (no hay listado global de todos los usuarios de Auth desde el cliente anon).

### Crear usuario

- Crea una cuenta vía **`signUp`**: el usuario recibirá correo de **confirmación** y no podrá entrar hasta confirmar (salvo que cambies el flujo en Supabase).
- Para dar de alta administradores que entren **al momento**, sigue usando **Supabase Dashboard** con **Auto Confirm User**.

### Editar

- Solo puedes cambiar la **contraseña del usuario actual** (tú, con sesión iniciada). Para otros correos, usa el dashboard de Supabase.

### Eliminar

- El botón está deshabilitado: borrar usuarios se hace en **Authentication** → **Users** en Supabase.

## Recuperar contraseña (admin)

El flujo está integrado en `/admin`:

- **¿Olvidaste tu contraseña?** → correo con enlace → pantalla **Establecer nueva contraseña** en la app.
- Configura **Site URL** y **Redirect URLs** en Supabase (incluyendo `.../admin`); detalle en [setup-admin.md](./setup-admin.md).

## Solución de problemas

### No puedo iniciar sesión en `/admin`

- Comprueba **Auto Confirm User** o confirma el correo del usuario.
- Revisa **Authentication** → **Providers** (email habilitado).

### “Error al crear el usuario”

- Email ya registrado, contraseña demasiado corta (mínimo 6 caracteres) o restricciones de Supabase Auth.

## Futuro (opcional)

Para listar/editar/eliminar **cualquier** usuario desde una UI propia haría falta un **backend** (o Edge Function) que use `service_role` **solo en servidor**, nunca en variables `VITE_*`.
