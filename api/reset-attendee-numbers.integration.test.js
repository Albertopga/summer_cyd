import { beforeEach, describe, expect, test, vi } from 'vitest'

const createClientMock = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args) => createClientMock(...args),
}))

import handler from './reset-attendee-numbers.js'

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

function createServiceClientMock(paidRows) {
  const clearUpdates = vi.fn()
  const assignUpdates = vi.fn()
  const rpcMock = vi.fn().mockResolvedValue({ error: null })

  const serviceClient = {
    rpc: rpcMock,
    from: vi.fn((table) => {
      if (table !== 'registrations') {
        throw new Error(`Unexpected table ${table}`)
      }

      return {
        select: vi.fn(() => {
          const selectBuilder = {
            eq: vi.fn(() => selectBuilder),
            order: vi.fn(() => selectBuilder),
          }

          // Awaiting the query resolves after second order call in endpoint.
          selectBuilder.order
            .mockImplementationOnce(() => selectBuilder)
            .mockImplementationOnce(() => Promise.resolve({ data: paidRows, error: null }))
          return selectBuilder
        }),
        update: vi.fn((payload) => {
          if (payload && Object.prototype.hasOwnProperty.call(payload, 'attendee_number')) {
            if (payload.attendee_number === null) {
              clearUpdates(payload)
              return {
                not: vi.fn(() => Promise.resolve({ error: null })),
              }
            }
            assignUpdates(payload)
            return {
              eq: vi.fn(() => Promise.resolve({ error: null })),
            }
          }
          return {
            eq: vi.fn(() => Promise.resolve({ error: null })),
            not: vi.fn(() => Promise.resolve({ error: null })),
          }
        }),
      }
    }),
  }

  return { serviceClient, clearUpdates, assignUpdates, rpcMock }
}

describe('reset attendee numbers integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon_key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_key'
    process.env.ATTENDEE_RESET_PASSWORD = 'reset-secret'
    process.env.ATTENDEE_RESET_ALLOWED_EMAIL = 'owner@example.com'
  })

  test('resetea y reasigna numeración definitiva para pagados', async () => {
    const paidRows = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]
    const { serviceClient, clearUpdates, assignUpdates, rpcMock } = createServiceClientMock(paidRows)

    const authClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin_1', email: 'owner@example.com' } },
          error: null,
        }),
      },
    }

    createClientMock
      .mockImplementationOnce(() => authClient)
      .mockImplementationOnce(() => serviceClient)

    const req = createMockReq({
      headers: { authorization: 'Bearer token_123' },
      body: { password: 'reset-secret' },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(200)
    expect(res.state.jsonBody).toMatchObject({
      ok: true,
      reassigned: 3,
      by: 'admin_1',
    })
    expect(clearUpdates).toHaveBeenCalledWith({ attendee_number: null })
    expect(assignUpdates).toHaveBeenNthCalledWith(1, { attendee_number: 1 })
    expect(assignUpdates).toHaveBeenNthCalledWith(2, { attendee_number: 2 })
    expect(assignUpdates).toHaveBeenNthCalledWith(3, { attendee_number: 3 })
    expect(rpcMock).toHaveBeenCalledWith('sync_attendee_number_sequence')
  })

  test('bloquea el reset con contraseña incorrecta', async () => {
    const authClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin_1', email: 'owner@example.com' } },
          error: null,
        }),
      },
    }
    createClientMock.mockImplementationOnce(() => authClient)

    const req = createMockReq({
      headers: { authorization: 'Bearer token_123' },
      body: { password: 'wrong-secret' },
    })
    const res = createMockRes()

    await handler(req, res)

    expect(res.state.statusCode).toBe(401)
    expect(res.state.jsonBody).toEqual({ error: 'Contraseña incorrecta.' })
  })
})
