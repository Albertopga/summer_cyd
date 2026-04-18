/**
 * Vercel Serverless: emails automáticos por cambios en `registrations`.
 *
 * Configuración en Supabase (Database → Webhooks):
 * - Tabla: public.registrations
 * - Eventos: INSERT y UPDATE (DELETE opcional)
 * - URL: https://<tu-dominio-vercel>/api/registration-confirmation
 * - Método: POST
 * - Cabecera HTTP fija: X-Webhook-Secret = (mismo valor que REGISTRATION_WEBHOOK_SECRET en Vercel)
 *
 * Variables de entorno:
 * - REGISTRATION_WEBHOOK_SECRET (obligatoria)
 * - REGISTRATION_CONFIRMATION_EMAIL_ENABLED: true|1|yes para activar envíos
 * - RESEND_API_KEY, EMAIL_FROM (obligatorias solo si envíos activos)
 * - EMAIL_REPLY_TO (opcional)
 */

import { timingSafeEqual } from 'node:crypto'
import { Resend } from 'resend'
import {
  buildRegistrationCreatedEmail,
  buildRegistrationUpdatedEmail,
  detectRegistrationChanges,
  isValidEmail,
} from './email-templates/registrationEmails'

const ALLOWED_TYPES = new Set(['INSERT', 'UPDATE'])

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

  if (body.table !== 'registrations' || body.schema !== 'public' || !ALLOWED_TYPES.has(body.type)) {
    res.status(200).json({ ok: true, skipped: 'unsupported_event' })
    return
  }

  const record = body.record
  if (!record || typeof record !== 'object') {
    res.status(400).json({ error: 'Missing record' })
    return
  }

  const to = record.email
  if (!isValidEmail(to)) {
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

  const firstName = typeof record.first_name === 'string' ? record.first_name : ''
  const lastName = typeof record.last_name === 'string' ? record.last_name : ''
  let message

  if (body.type === 'INSERT') {
    message = buildRegistrationCreatedEmail({ firstName, lastName })
  } else {
    const oldRecord = body.old_record
    const changes = detectRegistrationChanges(record, oldRecord)
    if (changes.length === 0) {
      res.status(200).json({ ok: true, skipped: 'no_relevant_changes' })
      return
    }
    message = buildRegistrationUpdatedEmail({ firstName, lastName, changes })
  }

  const resend = new Resend(apiKey)
  const replyTo = process.env.EMAIL_REPLY_TO
  const { data, error } = await resend.emails.send({
    from,
    to: to.trim().toLowerCase(),
    subject: message.subject,
    html: message.html,
    ...(replyTo && isValidEmail(replyTo)
      ? { replyTo: replyTo.trim() }
      : {}),
  })

  if (error) {
    res.status(502).json({ error: 'Resend error', details: error })
    return
  }

  res.status(200).json({ ok: true, id: data?.id })
}
