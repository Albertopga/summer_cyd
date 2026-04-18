/**
 * Vercel Serverless: envío de correo de confirmación tras INSERT en `registrations`.
 *
 * Configuración en Supabase (Database → Webhooks):
 * - Tabla: public.registrations
 * - Evento: INSERT
 * - URL: https://<tu-dominio-vercel>/api/registration-confirmation
 * - Método: POST
 * - Cabecera HTTP fija: X-Webhook-Secret = (mismo valor que REGISTRATION_WEBHOOK_SECRET en Vercel)
 *
 * Variables de entorno en Vercel:
 * - REGISTRATION_WEBHOOK_SECRET (obligatoria)
 * - REGISTRATION_CONFIRMATION_EMAIL_ENABLED: "true" | "1" | "yes" (insensible a mayúsculas) para
 *   enviar con Resend; cualquier otro valor o ausencia = no envía (ahorra cuota del tier gratuito).
 * - RESEND_API_KEY, EMAIL_FROM (obligatorias solo si el envío está activado)
 * - opcional: EMAIL_REPLY_TO
 *
 * En el front, para el mismo texto de éxito: VITE_REGISTRATION_CONFIRMATION_EMAIL_ENABLED=true
 */

import { timingSafeEqual } from 'node:crypto'
import { Resend } from 'resend'

function safeHeaderEqual(received, expected) {
  if (typeof received !== 'string' || typeof expected !== 'string') {
    return false
  }
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) {
    return false
  }
  return timingSafeEqual(a, b)
}

function escapeHtml(value) {
  if (value == null) {
    return ''
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildConfirmationEmailHtml({ firstName, lastName }) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim()
  const greeting = name ? `Hola, ${escapeHtml(name)}:` : 'Hola:'
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #222;">
  <p>${greeting}</p>
  <p>Hemos recibido correctamente tu inscripción al <strong>Retiro Lúdico Castilla y Dragón</strong>.</p>
  <p>Guarda este correo como confirmación. Si necesitas corregir algún dato, responde a este mensaje.</p>
  <p style="margin-top: 2rem; color: #555; font-size: 0.9rem;">— El equipo del retiro</p>
</body>
</html>`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isConfirmationEmailEnabled() {
  const raw = process.env.REGISTRATION_CONFIRMATION_EMAIL_ENABLED
  if (raw == null || String(raw).trim() === '') {
    return false
  }
  return /^(1|true|yes)$/i.test(String(raw).trim())
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed')
    return
  }

  const expectedSecret = process.env.REGISTRATION_WEBHOOK_SECRET
  if (!expectedSecret) {
    res.status(503).json({ error: 'Server misconfiguration' })
    return
  }

  const receivedSecret = req.headers['x-webhook-secret']
  if (!safeHeaderEqual(receivedSecret, expectedSecret)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      res.status(400).json({ error: 'Invalid JSON' })
      return
    }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid body' })
    return
  }

  if (body.type !== 'INSERT' || body.table !== 'registrations' || body.schema !== 'public') {
    res.status(200).json({ ok: true, skipped: true })
    return
  }

  const record = body.record
  if (!record || typeof record !== 'object') {
    res.status(400).json({ error: 'Missing record' })
    return
  }

  const to = record.email
  if (typeof to !== 'string' || !EMAIL_RE.test(to.trim())) {
    res.status(400).json({ error: 'Invalid recipient' })
    return
  }

  if (!isConfirmationEmailEnabled()) {
    res.status(200).json({ ok: true, skipped: 'confirmation_email_disabled' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    res.status(503).json({ error: 'Email service misconfiguration' })
    return
  }

  const firstName = record.first_name
  const lastName = record.last_name
  const html = buildConfirmationEmailHtml({
    firstName: typeof firstName === 'string' ? firstName : '',
    lastName: typeof lastName === 'string' ? lastName : '',
  })

  const resend = new Resend(apiKey)
  const replyTo = process.env.EMAIL_REPLY_TO
  const { data, error } = await resend.emails.send({
    from,
    to: to.trim().toLowerCase(),
    subject: 'Confirmación de inscripción – Retiro Lúdico Castilla y Dragón',
    html,
    ...(replyTo && typeof replyTo === 'string' && EMAIL_RE.test(replyTo.trim())
      ? { replyTo: replyTo.trim() }
      : {}),
  })

  if (error) {
    res.status(502).json({ error: 'Resend error', details: error })
    return
  }

  res.status(200).json({ ok: true, id: data?.id })
}
