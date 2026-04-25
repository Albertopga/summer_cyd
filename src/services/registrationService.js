/**
 * Servicio para gestionar los registros de asistentes
 * Interactúa con Supabase para almacenar y recuperar datos de registro
 */

import { supabase } from '@/lib/supabase'
import { isRegistrationDeadlinePassed } from '@/constants'

function normalizeName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
}

function buildFamilyRows(registrationData, isMinor) {
  const familyGroupId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `family-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const holderEmail = String(registrationData.email || '')
    .trim()
    .toLowerCase()

  const baseLogistics = {
    arrival_date: registrationData.arrivalDate,
    departure_date: registrationData.departureDate || null,
    accommodation: registrationData.accommodation,
    comments: registrationData.comments || null,
    terms_accepted: Boolean(registrationData.terms),
  }

  const holderRow = {
    family_group_id: familyGroupId,
    family_role: 'holder',
    family_contact_email: holderEmail,
    full_name: normalizeName(registrationData.fullName),
    nickname: registrationData.nickname || null,
    email: holderEmail,
    phone: registrationData.phone?.trim() || null,
    birth_date: registrationData.birthDate,
    is_minor: isMinor,
    emergency_contact_name: registrationData.emergencyContactName || null,
    emergency_contact_phone: registrationData.emergencyContactPhone || null,
    ...baseLogistics,
    child_shares_parent_chozo: false,
    zipline_requested: Boolean(registrationData.ziplineRequested),
    diet: registrationData.diet || [],
    diet_comments: registrationData.dietComments || null,
    image_consent_accepted: Boolean(registrationData.imageConsent),
  }

  const members = Array.isArray(registrationData.familyMembers) ? registrationData.familyMembers : []
  const extraRows = members
    .filter((member) => normalizeName(member?.fullName) && member?.birthDate)
    .map((member) => {
      const role = member.role === 'partner' ? 'partner' : 'child'
      return {
        family_group_id: familyGroupId,
        family_role: role,
        family_contact_email: holderEmail,
        full_name: normalizeName(member.fullName),
        nickname: member.nickname?.trim() || null,
        email: holderEmail,
        phone: null,
        birth_date: member.birthDate,
        is_minor: role === 'child',
        emergency_contact_name: registrationData.emergencyContactName || null,
        emergency_contact_phone: registrationData.emergencyContactPhone || null,
        ...baseLogistics,
        accommodation: member.accommodation || registrationData.accommodation,
        zipline_requested: Boolean(member.ziplineRequested),
        diet: Array.isArray(member.diet) ? member.diet : [],
        diet_comments: member.dietComments?.trim() || null,
        image_consent_accepted: Boolean(member.imageConsent),
        child_shares_parent_chozo: role === 'child' ? Boolean(member.childSharesParentChozo) : false,
      }
    })

  return [holderRow, ...extraRows]
}

/**
 * Guarda un nuevo registro de asistente en la base de datos
 * @param {Object} registrationData - Datos del formulario de registro
 * @param {boolean} isMinor - Indica si el asistente es menor de edad
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function saveRegistration(registrationData, isMinor) {
  try {
    if (isRegistrationDeadlinePassed()) {
      return {
        success: false,
        data: null,
        error: 'El plazo de inscripción ha finalizado.',
      }
    }

    const rowsToInsert = buildFamilyRows(registrationData, isMinor)

    const { data, error } = await supabase.from('registrations').insert(rowsToInsert).select()

    if (error) {
      console.error('Error al guardar el registro:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al guardar el registro en la base de datos',
      }
    }

    return {
      success: true,
      data: data || [],
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al guardar el registro:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al procesar el registro',
    }
  }
}

/**
 * Verifica si ya existe un registro con el mismo email
 * @param {string} email - Email a verificar
 * @returns {Promise<{exists: boolean, error: string|null}>}
 */
export async function checkEmailExists(email) {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es válido en este caso
      console.error('Error al verificar el email:', error)
      return {
        exists: false,
        error: error.message,
      }
    }

    return {
      exists: !!data,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al verificar el email:', error)
    return {
      exists: false,
      error: error.message,
    }
  }
}
