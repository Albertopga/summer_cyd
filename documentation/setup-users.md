# Pestaña Mi panel (cuenta y usuarios)

Esta guía describe cómo encaja la pestaña **Mi panel** del **Panel de Administración** (ruta `/admin`) con Supabase Auth y qué puedes hacer desde la aplicación frente al dashboard de Supabase.

## Contexto de seguridad

La aplicación es una **SPA** que usa la clave **anon** (`VITE_SUPABASE_ANON_KEY`). **No** se usa la clave `service_role` en el frontend: las operaciones sensibles sobre cuentas ajenas no están expuestas en el cliente.

## Crear el primer administrador

Hazlo desde Supabase (recomendado):

1. **Authentication** → **Users** → **Add user** → **Create new user**
2. Email y contraseña seguros
3. Activa **Auto Confirm User** para poder iniciar sesión sin confirmar correo
4. Ejecuta también `supabase-admin-policies.sql` para RLS en `registrations` (ver [setup-admin.md](./setup-admin.md))

## Qué permite la pestaña Mi panel

En la interfaz solo puedes **crear usuarios** nuevos y **cambiar la contraseña de tu propia cuenta** (botón Editar en tu fila).

- **Listado:** solo aparece el **usuario con sesión iniciada** (no hay listado global de Auth con la clave anon).
- **Crear usuario:** vía **`signUp`**; el nuevo usuario recibe correo de **confirmación** salvo que cambies el flujo en Supabase. Para altas con **Auto Confirm User**, usa el dashboard de Supabase.
- **Eliminar:** no está disponible aquí; en **Authentication** → **Users** del dashboard de Supabase.

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
