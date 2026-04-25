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
import { createClient } from '@supabase/supabase-js'
import {
  buildPaymentConfirmedEmail,
  buildRegistrationCreatedEmail,
  buildRegistrationUpdatedEmail,
  detectRegistrationChanges,
  isValidEmail,
} from './email-templates/registrationEmails.js'

const ALLOWED_TYPES = new Set(['INSERT', 'UPDATE'])
const FAMILY_MEMBERS_MAX_READ_RETRIES = 5
const FAMILY_MEMBERS_RETRY_DELAY_MS = 250
const FAMILY_PAYMENT_MAX_READ_RETRIES = 20
const FAMILY_PAYMENT_RETRY_DELAY_MS = 300

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

function getSafeErrorMeta(error) {
  if (!error || typeof error !== 'object') {
    return { message: 'unknown_error' }
  }
  return {
    name: typeof error.name === 'string' ? error.name : 'Error',
    message: typeof error.message === 'string' ? error.message : 'Unhandled error',
    statusCode: Number.isFinite(error.statusCode) ? error.statusCode : undefined,
    code: typeof error.code === 'string' ? error.code : undefined,
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function loadFamilyMembersWithRetry({
  record,
  eventMeta,
  requireDefinitiveNumbers = false,
  maxRetries = FAMILY_MEMBERS_MAX_READ_RETRIES,
  retryDelayMs = FAMILY_MEMBERS_RETRY_DELAY_MS,
}) {
  const fallbackMembers = [record]
  const fallbackResult = { members: fallbackMembers, incomplete: false }
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseReadKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!record?.family_group_id || !supabaseUrl || !supabaseReadKey) {
    return fallbackResult
  }

  const serviceClient = createClient(supabaseUrl, supabaseReadKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let lastRows = fallbackMembers
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const { data: familyRows, error: familyRowsError } = await serviceClient
      .from('registrations')
      .select(
        'id,created_at,full_name,family_role,is_minor,accommodation,zipline_requested,child_shares_parent_chozo,temp_attendee_number,attendee_number,accommodation_paid',
      )
      .eq('family_group_id', record.family_group_id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })

    if (familyRowsError) {
      console.warn('[registration-confirmation] could not load family rows', {
        ...eventMeta,
        family_group_id: record.family_group_id,
        attempt: attempt + 1,
        error: familyRowsError.message,
      })
      return fallbackResult
    }

    if (Array.isArray(familyRows) && familyRows.length > 0) {
      lastRows = familyRows
      const explicitHolder = familyRows.find((row) => row.family_role === 'holder')
      const notificationOwner = explicitHolder || familyRows[0]
      if (notificationOwner?.id && record.id !== notificationOwner.id) {
        return { members: familyRows, incomplete: false, skipSend: 'family_member_insert_non_owner' }
      }
      const hasMultipleMembers = familyRows.length > 1
      const hasCompleteDefinitiveNumbers = familyRows.every((row) =>
        Number.isInteger(Number(row?.attendee_number)),
      )
      const familyIsReady = requireDefinitiveNumbers
        ? hasMultipleMembers && hasCompleteDefinitiveNumbers
        : hasMultipleMembers
      if (familyIsReady) {
        return { members: familyRows, incomplete: false }
      }
    }

    const hasMoreAttempts = attempt < maxRetries - 1
    if (!hasMoreAttempts) {
      break
    }
    await sleep(retryDelayMs)
  }

  return {
    members: Array.isArray(lastRows) && lastRows.length > 0 ? lastRows : fallbackMembers,
    incomplete: true,
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed')
      return
    }

    const expectedSecret = process.env.REGISTRATION_WEBHOOK_SECRET
    if (!expectedSecret) {
      console.error('[registration-confirmation] missing REGISTRATION_WEBHOOK_SECRET')
      res.status(503).json({ error: 'Server misconfiguration' })
      return
    }

    const receivedSecret = req.headers['x-webhook-secret']
    if (!safeHeaderEqual(receivedSecret, expectedSecret)) {
      console.warn('[registration-confirmation] unauthorized request', {
        hasSecretHeader: typeof receivedSecret === 'string',
      })
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

    const eventMeta = {
      schema: body.schema,
      table: body.table,
      type: body.type,
      hasRecord: Boolean(body.record && typeof body.record === 'object'),
      hasOldRecord: Boolean(body.old_record && typeof body.old_record === 'object'),
    }

    if (body.table !== 'registrations' || body.schema !== 'public' || !ALLOWED_TYPES.has(body.type)) {
      console.info('[registration-confirmation] skipped unsupported event', eventMeta)
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
      console.warn('[registration-confirmation] invalid recipient email', {
        ...eventMeta,
        hasEmail: Boolean(to),
      })
      res.status(400).json({ error: 'Invalid recipient' })
      return
    }

    if (!isConfirmationEmailEnabled()) {
      console.info('[registration-confirmation] skipped because email is disabled', eventMeta)
      res.status(200).json({ ok: true, skipped: 'confirmation_email_disabled' })
      return
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM
    if (!apiKey || !from) {
      console.error('[registration-confirmation] missing email configuration', {
        hasResendApiKey: Boolean(apiKey),
        hasEmailFrom: Boolean(from),
      })
      res.status(503).json({ error: 'Email service misconfiguration' })
      return
    }

    const fullName = typeof record.full_name === 'string' ? record.full_name.trim() : ''
    let message

    if (body.type === 'INSERT') {
      if (record.family_group_id && record.family_role && record.family_role !== 'holder') {
        res.status(200).json({ ok: true, skipped: 'family_member_insert_non_holder' })
        return
      }

      const familyLoad = await loadFamilyMembersWithRetry({ record, eventMeta })
      if (familyLoad.skipSend) {
        res.status(200).json({ ok: true, skipped: familyLoad.skipSend })
        return
      }

      message = buildRegistrationCreatedEmail({
        fullName,
        accommodation: record.accommodation,
        ziplineRequested: Boolean(record.zipline_requested),
        tempAttendeeNumber: record.temp_attendee_number,
        familyMembers: familyLoad.members,
        familyDataIncomplete: familyLoad.incomplete,
      })
    } else {
      const oldRecord = body.old_record
      const paymentJustConfirmed =
        oldRecord &&
        Boolean(oldRecord.accommodation_paid) === false &&
        Boolean(record.accommodation_paid) === true

      if (paymentJustConfirmed) {
        if (record.family_group_id && record.family_role && record.family_role !== 'holder') {
          res.status(200).json({ ok: true, skipped: 'family_payment_update_non_holder' })
          return
        }

        const familyLoad = await loadFamilyMembersWithRetry({
          record,
          eventMeta,
          requireDefinitiveNumbers: true,
          maxRetries: FAMILY_PAYMENT_MAX_READ_RETRIES,
          retryDelayMs: FAMILY_PAYMENT_RETRY_DELAY_MS,
        })
        if (familyLoad.skipSend) {
          res.status(200).json({ ok: true, skipped: familyLoad.skipSend })
          return
        }

        message = buildPaymentConfirmedEmail({
          fullName,
          attendeeNumber: record.attendee_number,
          familyMembers: familyLoad.members,
        })
      } else {
      const changes = detectRegistrationChanges(record, oldRecord)
      if (changes.length === 0) {
        console.info('[registration-confirmation] skipped update without relevant changes', eventMeta)
        res.status(200).json({ ok: true, skipped: 'no_relevant_changes' })
        return
      }
      message = buildRegistrationUpdatedEmail({ fullName, changes })
      }
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
      const resendError = getSafeErrorMeta(error)
      console.error('[registration-confirmation] resend send failed', {
        ...eventMeta,
        resendError,
      })
      res.status(502).json({ error: 'Resend error', details: resendError })
      return
    }

    console.info('[registration-confirmation] email sent', {
      ...eventMeta,
      messageId: data?.id || null,
    })
    res.status(200).json({ ok: true, id: data?.id || null })
  } catch (error) {
    const safeError = getSafeErrorMeta(error)
    console.error('[registration-confirmation] unhandled error', safeError)
    res.status(500).json({ error: 'Unhandled server error' })
  }
}
