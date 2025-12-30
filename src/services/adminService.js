/**
 * Servicio para gestionar registros desde el panel de administración
 * Requiere autenticación
 */

import { supabase } from '@/lib/supabase'

/**
 * Obtiene todos los registros de asistentes
 * @param {Object} options - Opciones de consulta
 * @param {number} options.limit - Límite de registros
 * @param {number} options.offset - Offset para paginación
 * @param {string} options.orderBy - Campo por el que ordenar
 * @param {boolean} options.ascending - Orden ascendente o descendente
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null, count: number|null}>}
 */
export async function getAllRegistrations(options = {}) {
  try {
    const { limit = 100, offset = 0, orderBy = 'created_at', ascending = false } = options

    // Obtener el total de registros
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error al contar registros:', countError)
    }

    // Obtener los registros
    let query = supabase
      .from('registrations')
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener registros:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al obtener los registros',
        count: null,
      }
    }

    return {
      success: true,
      data: data || [],
      error: null,
      count: count || 0,
    }
  } catch (error) {
    console.error('Error inesperado al obtener registros:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al obtener los registros',
      count: null,
    }
  }
}

/**
 * Actualiza campos específicos de un registro
 * @param {string} id - ID del registro (UUID)
 * @param {Object} updates - Objeto con los campos a actualizar
 * @param {Array<string>} allowedFields - Array de campos permitidos para editar
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function updateRegistration(id, updates, allowedFields = []) {
  try {
    // Filtrar solo los campos permitidos
    const filteredUpdates = {}
    if (allowedFields.length > 0) {
      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key]
        }
      })
    } else {
      // Si no se especifican campos permitidos, permitir todos
      Object.assign(filteredUpdates, updates)
    }

    // No permitir actualizar campos críticos como id, created_at
    delete filteredUpdates.id
    delete filteredUpdates.created_at

    if (Object.keys(filteredUpdates).length === 0) {
      return {
        success: false,
        data: null,
        error: 'No hay campos válidos para actualizar',
      }
    }

    // Actualizar el registro
    const { data, error } = await supabase
      .from('registrations')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar registro:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al actualizar el registro',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al actualizar registro:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al actualizar el registro',
    }
  }
}

/**
 * Obtiene un registro por su ID
 * @param {string} id - ID del registro (UUID)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function getRegistrationById(id) {
  try {
    const { data, error } = await supabase.from('registrations').select('*').eq('id', id).single()

    if (error) {
      console.error('Error al obtener registro:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al obtener el registro',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al obtener registro:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al obtener el registro',
    }
  }
}
