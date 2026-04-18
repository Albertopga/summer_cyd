/**
 * Endpoint para enviar recordatorios de pago de plazas no abonadas.
 *
 * Recomendado para ejecución desde cron/job externo (POST):
 * - Header: X-Reminder-Secret = PAYMENT_REMINDER_WEBHOOK_SECRET
 *
 * Variables de entorno:
 * - PAYMENT_REMINDER_WEBHOOK_SECRET (obligatoria)
 * - PAYMENT_REMINDER_EMAIL_ENABLED: true|1|yes
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY (para validar token Bearer de admin)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - RESEND_API_KEY
 * - EMAIL_FROM
 * - EMAIL_REPLY_TO (opcional)
 * - PAYMENT_REMINDER_MIN_DAYS (opcional, default 5) Define cuántos días mínimos deben pasar desde que se creó la inscripción (created_at) para que el usuario entre en la cola de recordatorio de pago
 * - PAYMENT_REMINDER_COOLDOWN_DAYS (opcional, default 7) Define el tiempo mínimo entre recordatorios para el mismo usuario, usando last_payment_reminder_sent_at
 * - PAYMENT_REMINDER_BATCH_SIZE (opcional, default 50) Límite máximo de recordatorios a enviar por ejecución del endpoint /api/payment-reminders. Sirve para controlar coste, carga y riesgo de sobreenvío.
 */

import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildPaymentReminderEmail, isValidEmail } from './email-templates/registrationEmails'

function isEnabled(value) {
  if (value == null || String(value).trim() === '') {
    return false
  }
  return /^(1|true|yes)$/i.test(String(value).trim())
}

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

function parsePositiveInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n) || n <= 0) {
    return fallback
  }
  return n
}

async function getAuthenticatedAdminFromBearer(req, supabaseUrl, supabaseAnonKey) {
  const authHeader = req.headers.authorization
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return { ok: false, reason: 'missing_bearer' }
  }
  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return { ok: false, reason: 'missing_token' }
  }
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data?.user) {
    return { ok: false, reason: 'invalid_token' }
  }
  return { ok: true, user: data.user }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed')
    return
  }

  if (!isEnabled(process.env.PAYMENT_REMINDER_EMAIL_ENABLED)) {
    res.status(200).json({ ok: true, skipped: 'payment_reminders_disabled' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !apiKey || !from) {
    res.status(503).json({
      error:
        'Server misconfiguration: missing SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY or EMAIL_FROM',
    })
    return
  }

  const expectedSecret = process.env.PAYMENT_REMINDER_WEBHOOK_SECRET
  const receivedSecret = req.headers['x-reminder-secret']
  const secretOk =
    typeof expectedSecret === 'string' &&
    expectedSecret.trim() !== '' &&
    safeHeaderEqual(receivedSecret, expectedSecret)

  let triggeredBy = 'secret'
  if (!secretOk) {
    const adminAuth = await getAuthenticatedAdminFromBearer(req, supabaseUrl, supabaseAnonKey)
    if (!adminAuth.ok) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    triggeredBy = `admin:${adminAuth.user.id}`
  }

  const minDays = parsePositiveInt(process.env.PAYMENT_REMINDER_MIN_DAYS, 5)
  const cooldownDays = parsePositiveInt(process.env.PAYMENT_REMINDER_COOLDOWN_DAYS, 7)
  const batchSize = parsePositiveInt(process.env.PAYMENT_REMINDER_BATCH_SIZE, 50)
  const minCreatedAt = new Date(Date.now() - minDays * 24 * 60 * 60 * 1000).toISOString()
  const reminderCutoff = new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: pendingRows, error: pendingError } = await supabase
    .from('registrations')
    .select(
      'id, first_name, last_name, email, accommodation_paid, created_at, last_payment_reminder_sent_at, payment_reminder_count',
    )
    .eq('accommodation_paid', false)
    .lte('created_at', minCreatedAt)
    .order('created_at', { ascending: true })
    .limit(batchSize * 3)

  if (pendingError) {
    res.status(502).json({ error: 'Error querying pending registrations', details: pendingError.message })
    return
  }

  if (!Array.isArray(pendingRows) || pendingRows.length === 0) {
    res.status(200).json({ ok: true, sent: 0, skipped: 0, total: 0 })
    return
  }

  const eligibleRows = pendingRows
    .filter((row) => {
      const lastReminder = row?.last_payment_reminder_sent_at
      if (!lastReminder) {
        return true
      }
      const lastReminderDate = new Date(lastReminder)
      if (Number.isNaN(lastReminderDate.getTime())) {
        return true
      }
      return lastReminderDate <= reminderCutoff
    })
    .slice(0, batchSize)

  if (eligibleRows.length === 0) {
    res.status(200).json({
      ok: true,
      sent: 0,
      skipped: pendingRows.length,
      total: 0,
      criteria: { minDays, cooldownDays, batchSize, minCreatedAt, unpaidOnly: true },
    })
    return
  }

  const resend = new Resend(apiKey)
  const replyTo = process.env.EMAIL_REPLY_TO
  const canUseReplyTo = isValidEmail(replyTo)
  let sent = 0
  let skipped = 0
  const errors = []

  for (const row of eligibleRows) {
    const email = row?.email
    if (!isValidEmail(email)) {
      skipped += 1
      continue
    }

    const message = buildPaymentReminderEmail({
      firstName: typeof row.first_name === 'string' ? row.first_name : '',
      lastName: typeof row.last_name === 'string' ? row.last_name : '',
    })

    const { error } = await resend.emails.send({
      from,
      to: email.trim().toLowerCase(),
      subject: message.subject,
      html: message.html,
      ...(canUseReplyTo ? { replyTo: replyTo.trim() } : {}),
    })

    if (error) {
      errors.push({ id: row.id, email, error: error.message || 'send_error' })
      continue
    }

    const currentCount = Number.isFinite(row.payment_reminder_count) ? row.payment_reminder_count : 0
    const { error: updateError } = await supabase
      .from('registrations')
      .update({
        last_payment_reminder_sent_at: new Date().toISOString(),
        payment_reminder_count: currentCount + 1,
      })
      .eq('id', row.id)

    if (updateError) {
      errors.push({ id: row.id, email, error: `tracking_update_failed: ${updateError.message}` })
      continue
    }

    sent += 1
  }

  res.status(200).json({
    ok: true,
    triggeredBy,
    sent,
    skipped,
    total: eligibleRows.length,
    errors,
    criteria: { minDays, cooldownDays, batchSize, minCreatedAt, unpaidOnly: true },
  })
}
