/**
 * Servicio para gestionar los registros de asistentes
 * Interactúa con Supabase para almacenar y recuperar datos de registro
 */

import { supabase } from '@/lib/supabase'

/**
 * Guarda un nuevo registro de asistente en la base de datos
 * @param {Object} registrationData - Datos del formulario de registro
 * @param {boolean} isMinor - Indica si el asistente es menor de edad
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function saveRegistration(registrationData, isMinor) {
  try {
    // Preparar los datos para insertar en la base de datos
    const dataToInsert = {
      first_name: registrationData.firstName,
      last_name: registrationData.lastName,
      nickname: registrationData.nickname || null,
      email: registrationData.email,
      phone: registrationData.phone,
      birth_date: registrationData.birthDate,
      is_minor: isMinor,
      emergency_contact_name: registrationData.emergencyContactName || null,
      emergency_contact_phone: registrationData.emergencyContactPhone || null,
      arrival_date: registrationData.arrivalDate,
      departure_date: registrationData.departureDate || null,
      accommodation: registrationData.accommodation,
      diet: registrationData.diet || [],
      comments: registrationData.comments || null,
      diet_comments: registrationData.dietComments || null,
      terms_accepted: registrationData.terms,
    }

    // Insertar en la tabla de registros
    // Usamos .select() para obtener el registro insertado
    const { data, error } = await supabase.from('registrations').insert([dataToInsert]).select()

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
      data: data?.[0] || null,
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
