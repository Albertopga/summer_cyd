import { beforeEach, describe, expect, test, vi } from 'vitest'

const sendMock = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}))

import handler from './registration-confirmation.js'

function createMockReq({ method = 'POST', headers = {}, body = {} } = {}) {
  return { method, headers, body }
}

function createMockRes() {
  const state = {
    statusCode: 200,
    headers: {},
    jsonBody: null,
    endedText: null,
  }

  return {
    state,
    status(code) {
      state.statusCode = code
      return this
    },
    setHeader(key, value) {
      state.headers[key] = value
      return this
    },
    json(payload) {
      state.jsonBody = payload
      return this
    },
    end(payload) {
      state.endedText = payload
      return this
    },
  }
}

describe('registration-confirmation api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.REGISTRATION_WEBHOOK_SECRET = 'valid-secret'
    process.env.REGISTRATION_CONFIRMATION_EMAIL_ENABLED = 'true'
    process.env.RESEND_API_KEY = 'resend-test-key'
    process.env.EMAIL_FROM = 'info@example.com'
    delete process.env.EMAIL_REPLY_TO
  })

  test('devuelve 401 cuando el secreto no coincide', async () => {
    const req = createMockReq({
      headers: { 'x-webhook-secret': 'invalid-secret' },
      body: {},
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(401)
    expect(res.state.jsonBody).toEqual({ error: 'Unauthorized' })
  })

  test('devuelve 400 cuando falta un email válido', async () => {
    const req = createMockReq({
      headers: { 'x-webhook-secret': 'valid-secret' },
      body: {
        type: 'INSERT',
        table: 'registrations',
        schema: 'public',
        record: { full_name: 'Persona sin email' },
      },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(400)
    expect(res.state.jsonBody).toEqual({ error: 'Invalid recipient' })
  })

  test('devuelve 200 skipped para eventos no soportados', async () => {
    const req = createMockReq({
      headers: { 'x-webhook-secret': 'valid-secret' },
      body: {
        type: 'DELETE',
        table: 'registrations',
        schema: 'public',
        record: { email: 'test@example.com', full_name: 'Test User' },
      },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(200)
    expect(res.state.jsonBody).toEqual({ ok: true, skipped: 'unsupported_event' })
  })

  test('devuelve 502 cuando Resend responde error', async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { name: 'ResendError', message: 'Rate limit', statusCode: 429 },
    })

    const req = createMockReq({
      headers: { 'x-webhook-secret': 'valid-secret' },
      body: {
        type: 'INSERT',
        table: 'registrations',
        schema: 'public',
        record: { email: 'test@example.com', full_name: 'Test User' },
      },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(502)
    expect(res.state.jsonBody).toEqual({
      error: 'Resend error',
      details: {
        name: 'ResendError',
        message: 'Rate limit',
        statusCode: 429,
        code: undefined,
      },
    })
  })

  test('envía email y devuelve 200 con id', async () => {
    sendMock.mockResolvedValueOnce({
      data: { id: 'mail_123' },
      error: null,
    })

    const req = createMockReq({
      headers: { 'x-webhook-secret': 'valid-secret' },
      body: {
        type: 'INSERT',
        table: 'registrations',
        schema: 'public',
        record: { email: 'test@example.com', full_name: 'Test User' },
      },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(res.state.statusCode).toBe(200)
    expect(res.state.jsonBody).toEqual({ ok: true, id: 'mail_123' })
  })
})
