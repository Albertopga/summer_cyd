import { beforeEach, describe, expect, test, vi } from 'vitest'

const { selectMock, insertMock, fromMock } = vi.hoisted(() => {
  const select = vi.fn()
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  return { selectMock: select, insertMock: insert, fromMock: from }
})

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}))

vi.mock('@/constants', () => ({
  isRegistrationDeadlinePassed: vi.fn(() => false),
}))

import { saveRegistration } from '@/services/registrationService'

describe('registrationService integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('guarda el registro con datos normalizados y payload correcto', async () => {
    selectMock.mockResolvedValueOnce({
      data: [{ id: 'reg_1', full_name: 'Ana Perez' }],
      error: null,
    })

    const registrationData = {
      fullName: '  Ana    Perez  ',
      nickname: 'Anita',
      email: 'ana@example.com',
      phone: ' 600123456 ',
      birthDate: '1990-01-02',
      emergencyContactName: 'Luis',
      emergencyContactPhone: '611111111',
      arrivalDate: '2026-08-21T17:00',
      departureDate: '',
      accommodation: 'albergue',
      ziplineRequested: true,
      diet: ['vegetariana'],
      comments: 'Sin escaleras',
      dietComments: 'Sin lactosa',
      terms: true,
      imageConsent: false,
    }

    const result = await saveRegistration(registrationData, false)

    expect(result.success).toBe(true)
    expect(fromMock).toHaveBeenCalledWith('registrations')
    expect(insertMock).toHaveBeenCalledTimes(1)

    const insertedRows = insertMock.mock.calls[0][0]
    expect(Array.isArray(insertedRows)).toBe(true)
    expect(insertedRows[0]).toMatchObject({
      full_name: 'Ana Perez',
      nickname: 'Anita',
      email: 'ana@example.com',
      phone: '600123456',
      birth_date: '1990-01-02',
      is_minor: false,
      emergency_contact_name: 'Luis',
      emergency_contact_phone: '611111111',
      arrival_date: '2026-08-21T17:00',
      departure_date: null,
      accommodation: 'albergue',
      zipline_requested: true,
      diet: ['vegetariana'],
      comments: 'Sin escaleras',
      diet_comments: 'Sin lactosa',
      terms_accepted: true,
      image_consent_accepted: false,
    })
  })

  test('devuelve error cuando Supabase falla al insertar', async () => {
    selectMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'duplicate key value' },
    })

    const result = await saveRegistration(
      {
        fullName: 'Ana Perez',
        email: 'ana@example.com',
        phone: '600123456',
        birthDate: '1990-01-02',
        arrivalDate: '2026-08-21T17:00',
        accommodation: 'albergue',
        terms: true,
        diet: [],
      },
      false,
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('duplicate key value')
  })
})
