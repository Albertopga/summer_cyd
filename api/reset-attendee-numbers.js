import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function safeHeaderEqual(received, expected) {
  if (typeof received !== 'string' || typeof expected !== 'string') return false
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

async function getAuthenticatedAdminFromBearer(req, supabaseUrl, supabaseAnonKey) {
  const authHeader = req.headers.authorization
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return { ok: false }
  }
  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return { ok: false }
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data?.user) {
    return { ok: false }
  }

  return { ok: true, user: data.user }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed')
      return
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const expectedPassword = process.env.ATTENDEE_RESET_PASSWORD
    const allowedEmail = String(process.env.ATTENDEE_RESET_ALLOWED_EMAIL || '')
      .trim()
      .toLowerCase()

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !expectedPassword) {
      res.status(503).json({
        error:
          'Server misconfiguration: missing SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY or ATTENDEE_RESET_PASSWORD',
      })
      return
    }

    const adminAuth = await getAuthenticatedAdminFromBearer(req, supabaseUrl, supabaseAnonKey)
    if (!adminAuth.ok) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const userEmail = String(adminAuth.user.email || '')
      .trim()
      .toLowerCase()
    if (allowedEmail && userEmail !== allowedEmail) {
      res.status(403).json({ error: 'Forbidden: solo el propietario puede reiniciar numeración.' })
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

    const providedPassword = String(body.password || '')
    if (!safeHeaderEqual(providedPassword, expectedPassword)) {
      res.status(401).json({ error: 'Contraseña incorrecta.' })
      return
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: paidRows, error: paidError } = await supabase
      .from('registrations')
      .select('id')
      .eq('accommodation_paid', true)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })

    if (paidError) {
      res.status(502).json({ error: 'Error loading paid registrations', details: paidError.message })
      return
    }

    const { error: clearError } = await supabase
      .from('registrations')
      .update({ attendee_number: null })
      .not('attendee_number', 'is', null)

    if (clearError) {
      res.status(502).json({ error: 'Error clearing attendee numbers', details: clearError.message })
      return
    }

    const list = Array.isArray(paidRows) ? paidRows : []
    for (let i = 0; i < list.length; i += 1) {
      const row = list[i]
      const attendeeNumber = i + 1
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ attendee_number: attendeeNumber })
        .eq('id', row.id)
      if (updateError) {
        res.status(502).json({
          error: 'Error assigning attendee number',
          details: updateError.message,
          rowId: row.id,
        })
        return
      }
    }

    const { error: syncError } = await supabase.rpc('sync_attendee_number_sequence')
    if (syncError) {
      res.status(502).json({
        error: 'Error syncing attendee number sequence',
        details: syncError.message,
      })
      return
    }

    res.status(200).json({
      ok: true,
      reassigned: list.length,
      by: adminAuth.user.id,
    })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unhandled server error' })
  }
}
