# Webhook de registro: diagnóstico y operación

Esta guía deja el flujo de confirmación de registro en estado operativo y verificable:

`registrations (INSERT/UPDATE) -> webhook Supabase -> /api/registration-confirmation -> Resend`

## 1) Configuración final esperada

- Un único webhook para `public.registrations` con nombre recomendado: `registration-confirmation-email`.
- Eventos habilitados: solo `INSERT` y `UPDATE`.
- Evento `DELETE`: deshabilitado.
- URL: `https://retiroludico.castillaydragon.com/api/registration-confirmation`
- Header fijo: `X-Webhook-Secret`
- Timeout: `5000 ms`.

## 2) Checklist de variables (Vercel)

Variables requeridas en el proyecto desplegado:

- `REGISTRATION_WEBHOOK_SECRET`
- `REGISTRATION_CONFIRMATION_EMAIL_ENABLED` (`true` para activar)
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` (opcional)

Al cambiar cualquier variable:

1. Guardar.
2. Redeploy.
3. Repetir pruebas de esta guía.

## 3) SQL de verificación en Supabase

Ejecutar en SQL Editor para comprobar triggers/webhooks actuales sobre `registrations`:

```sql
SELECT
  n.nspname AS table_schema,
  c.relname AS table_name,
  t.tgname AS trigger_name,
  pg_get_triggerdef(t.oid, true) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal
  AND n.nspname = 'public'
  AND c.relname = 'registrations'
ORDER BY t.tgname;
```

Si hay más de un webhook para registro, o alguno incluye `DELETE`, eliminar los sobrantes desde **Database -> Webhooks** y dejar solo el webhook esperado.

## 4) SQL para revisar respuestas de `pg_net`

```sql
SELECT
  id,
  status_code,
  created,
  timed_out,
  error_msg,
  content
FROM net._http_response
ORDER BY created DESC
LIMIT 30;
```

Criterio de éxito:

- `status_code = 200` en entregas recientes del webhook de registro.
- Sin entradas nuevas con `FUNCTION_INVOCATION_FAILED`.

## 5) Pruebas operativas

### Prueba A: endpoint manual con secreto válido

```bash
curl -i -X POST "https://retiroludico.castillaydragon.com/api/registration-confirmation" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: <SECRET_CORRECTO>" \
  --data '{
    "type":"INSERT",
    "table":"registrations",
    "schema":"public",
    "record":{"email":"buzon-pruebas@tu-dominio.com","full_name":"Prueba Manual"}
  }'
```

Esperado: `200` con `{ "ok": true, ... }` o `{ "ok": true, "skipped": ... }`.

### Prueba B: endpoint manual con secreto inválido

Misma petición con secreto incorrecto.

Esperado: `401 Unauthorized`.

### Prueba C: flujo real desde app (INSERT)

1. Crear inscripción desde la UI.
2. Verificar fila en `public.registrations`.
3. Verificar entrega `200` en `net._http_response`.
4. Verificar logs de Vercel sin error.
5. Verificar recepción del email.

### Prueba D: flujo real desde admin (UPDATE)

1. Editar un campo relevante de la inscripción.
2. Verificar entrega `200` y envío de correo de actualización.

## 6) Criterios de cierre

- Cero errores `500 FUNCTION_INVOCATION_FAILED` en ejecuciones recientes.
- Endpoint responde correctamente en positiva y negativa (`200` / `401` / `400` / `503` / `502` según caso).
- Confirmación de envío en Resend y recepción en buzón de pruebas.

## 7) Nota de seguridad

- Rotar `REGISTRATION_WEBHOOK_SECRET` si se expuso en chats, capturas o logs.
- No copiar secretos en documentación ni commits.
