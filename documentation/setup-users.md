# Usuarios del panel de administración



Esta guía describe cómo encaja la pestaña **Usuarios** de `/admin` con Supabase Auth y qué puedes hacer desde la aplicación frente al dashboard de Supabase.



## Contexto de seguridad



La aplicación es una **SPA** que usa la clave **anon** (`VITE_SUPABASE_ANON_KEY`). **No** se usa la clave `service_role` en el frontend ni en variables `VITE_*`.



El **listado completo** de usuarios de Auth y el **borrado** de cuentas (excepto la propia sesión) se hacen mediante la **Edge Function** `admin-users`, donde Supabase inyecta `SUPABASE_SERVICE_ROLE_KEY` solo en el entorno de la función.



## Edge Function `admin-users`



Ubicación en el repo: `supabase/functions/admin-users/index.ts`.



- **GET**: devuelve todos los usuarios de Auth (paginado en servidor), con campos seguros: `id`, `email`, `email_confirmed_at`, `last_sign_in_at`, `created_at`.

- **POST** con cuerpo `{ "userId": "<uuid>" }`: elimina ese usuario. Si `userId` coincide con el usuario del JWT, responde **403**.



Requisitos del cliente en cada petición:



- Cabecera `Authorization: Bearer <access_token>` de la sesión actual.

- Cabecera `apikey: <anon key>` (la misma que usa el cliente JS).



### Despliegue (resumen)

1. Tener instalada la **CLI de Supabase** en tu PC (ver abajo).
2. Abrir una terminal **en la carpeta del proyecto** (`summer_cyd`), donde está la carpeta `supabase/`.
3. Ejecutar: `supabase login` → `supabase link --project-ref ...` → `supabase functions deploy admin-users`.

En `supabase/config.toml` está `[functions.admin-users] verify_jwt = true` para que el gateway valide el JWT antes de ejecutar el código.

**Nota de seguridad:** Cualquier usuario **autenticado** en tu proyecto puede invocar esta función y listar o borrar otros usuarios de Auth. Si solo unos correos deben ser admins, habría que restringir en la función (p. ej. lista o tabla de emails permitidos).

### Despliegue paso a paso (si no has usado nunca la CLI)

**1. Instalar la CLI en Windows**

Elige **una** opción (la que te resulte más simple):

- **Con Node.js (npm):** si ya usas Node para este proyecto, en PowerShell o CMD:

  ```bash
  npm install -g supabase
  ```

  Comprueba que funciona:

  ```bash
  supabase --version
  ```

- **Instrucciones oficiales y otras formas (Scoop, etc.):** [Getting started with Supabase CLI](https://supabase.com/docs/guides/cli/getting-started).

Si `supabase` no se reconoce como comando, cierra y vuelve a abrir la terminal, o reinicia el PC tras instalar.

- **Sin instalar la CLI global (solo con Node):** desde la carpeta del proyecto puedes usar `npx` (la primera vez tarda un poco al descargar):

  ```bash
  npx supabase@latest login
  npx supabase@latest link --project-ref TU_PROJECT_REF
  npx supabase@latest functions deploy admin-users
  ```

**2. Saber tu `project ref`**

Es el identificador corto de tu proyecto en Supabase (no es la URL completa ni la anon key).

- Entra en [Supabase Dashboard](https://supabase.com/dashboard) y abre **tu proyecto**.
- En **Settings** (engranaje) → **General**, busca **Reference ID** (a veces aparece como “Project ID”). Son letras y números, por ejemplo `abcdefghijklmno`.
- También suele verse en la URL del navegador: `.../project/abcdefghijklmno/...` — esa parte es el `project ref`.

**3. Abrir terminal en la carpeta del repo**

En VS Code / Cursor: menú **Terminal → New Terminal**. Asegúrate de que la ruta sea la raíz del proyecto, donde ves carpetas como `src` y `supabase`:

```text
c:\Projects\summer_cyd>
```

**4. Iniciar sesión en Supabase desde la CLI**

```bash
supabase login
```

Se abrirá el navegador para autorizar; acepta y vuelve a la terminal.

**5. Enlazar este repo con ese proyecto**

Sustituye `TU_PROJECT_REF` por el Reference ID del paso 2:

```bash
supabase link --project-ref TU_PROJECT_REF
```

Te puede pedir la **database password** del proyecto (la definiste al crear el proyecto; si no la recuerdas, en el dashboard: **Settings → Database**). El `link` es necesario para que la CLI sepa a qué proyecto subir la función.

**6. Desplegar la función**

```bash
supabase functions deploy admin-users
```

Si termina sin error, la URL de la función será del estilo:

`https://<tu-ref>.supabase.co/functions/v1/admin-users`

Esa URL debe corresponder al mismo host que tienes en `VITE_SUPABASE_URL` en tu `.env`.

**7. Probar en la app**

Recarga `/admin` → pestaña **Usuarios**. Debería cargar el listado en lugar del mensaje de “desplegar admin-users”.

**Problemas frecuentes**

- **“command not found: supabase”:** la CLI no está en el PATH; reinstala con npm global o sigue la guía oficial.
- **Error al `link`:** comprueba el `project ref` y la contraseña de la base de datos.
- **Listado sigue fallando:** confirma que desplegaste en el **mismo** proyecto que usa tu `.env` (`VITE_SUPABASE_URL`).



## Crear el primer administrador



Hazlo desde Supabase (recomendado):



1. **Authentication** → **Users** → **Add user** → **Create new user**

2. Email y contraseña seguros

3. Activa **Auto Confirm User** para poder iniciar sesión sin confirmar correo

4. Ejecuta también `supabase-admin-policies.sql` para RLS en `registrations` (ver [setup-admin.md](./setup-admin.md))



## Qué permite la pestaña Usuarios en `/admin`



### Listado



- Muestra **todos** los usuarios de Auth devueltos por la Edge Function `admin-users` (tras desplegarla). Si la función no existe, verás un mensaje que indica desplegarla.



### Crear usuario



- Crea una cuenta vía **`signUp`**: el usuario recibirá correo de **confirmación** y no podrá entrar hasta confirmar (salvo que cambies el flujo en Supabase).

- Para dar de alta administradores que entren **al momento**, sigue usando **Supabase Dashboard** con **Auto Confirm User**.



### Editar



- Solo puedes cambiar la **contraseña del usuario actual** (tú, con sesión iniciada). Para otros correos, usa el dashboard de Supabase.



### Eliminar



- Puedes eliminar **cualquier otro** usuario; el de la **sesión actual** no se puede borrar (botón deshabilitado y validación en servidor).



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



### El listado de usuarios falla o habla de desplegar `admin-users`



- Ejecuta `supabase functions deploy admin-users` y vuelve a cargar `/admin` → Usuarios.

- Comprueba que la URL del proyecto en `.env` (`VITE_SUPABASE_URL`) coincide con el proyecto donde desplegaste la función.


