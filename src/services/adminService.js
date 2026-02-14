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
    let query = supabase.from('registrations').select('*')

    // Manejar ordenamiento múltiple o simple
    if (typeof orderBy === 'string' && orderBy.includes(',')) {
      // Ordenamiento múltiple: "campo1,campo2" con "true,false"
      const orderFields = orderBy.split(',').map((f) => f.trim())
      const ascendingValues =
        typeof ascending === 'string' && ascending.includes(',')
          ? ascending.split(',').map((a) => a.trim() === 'true')
          : [ascending]

      orderFields.forEach((field, index) => {
        const isAscending = ascendingValues[index] !== undefined ? ascendingValues[index] : false
        query = query.order(field, { ascending: isAscending })
      })
    } else {
      // Ordenamiento simple
      query = query.order(orderBy, { ascending })
    }

    query = query.range(offset, offset + limit - 1)

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

/**
 * Obtiene todas las actividades propuestas
 * @param {Object} options - Opciones de consulta
 * @param {number} options.limit - Límite de registros
 * @param {number} options.offset - Offset para paginación
 * @param {string} options.orderBy - Campo por el que ordenar
 * @param {boolean} options.ascending - Orden ascendente o descendente
 * @param {string} options.status - Filtrar por estado (opcional)
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null, count: number|null}>}
 */
export async function getAllActivities(options = {}) {
  try {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'created_at',
      ascending = false,
      status = null,
    } = options

    // Obtener el total de actividades
    let countQuery = supabase.from('activities').select('*', { count: 'exact', head: true })
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error al contar actividades:', countError)
    }

    // Obtener las actividades
    let query = supabase.from('activities').select('*')

    // Aplicar filtro de estado si se especifica
    if (status) {
      query = query.eq('status', status)
    }

    // Manejar ordenamiento múltiple o simple
    if (typeof orderBy === 'string' && orderBy.includes(',')) {
      const orderFields = orderBy.split(',').map((f) => f.trim())
      const ascendingValues =
        typeof ascending === 'string' && ascending.includes(',')
          ? ascending.split(',').map((a) => a.trim() === 'true')
          : [ascending]

      orderFields.forEach((field, index) => {
        const isAscending = ascendingValues[index] !== undefined ? ascendingValues[index] : false
        query = query.order(field, { ascending: isAscending })
      })
    } else {
      query = query.order(orderBy, { ascending })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener actividades:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al obtener las actividades',
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
    console.error('Error inesperado al obtener actividades:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al obtener las actividades',
      count: null,
    }
  }
}

/**
 * Obtiene una actividad por su ID
 * @param {string} id - ID de la actividad (UUID)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function getActivityById(id) {
  try {
    const { data, error } = await supabase.from('activities').select('*').eq('id', id).single()

    if (error) {
      console.error('Error al obtener actividad:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al obtener la actividad',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al obtener actividad:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al obtener la actividad',
    }
  }
}

/**
 * Actualiza campos específicos de una actividad
 * @param {string} id - ID de la actividad (UUID)
 * @param {Object} updates - Objeto con los campos a actualizar
 * @param {Array<string>} allowedFields - Array de campos permitidos para editar
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function updateActivity(id, updates, allowedFields = []) {
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
      Object.assign(filteredUpdates, updates)
    }

    // No permitir actualizar campos críticos
    delete filteredUpdates.id
    delete filteredUpdates.created_at

    if (Object.keys(filteredUpdates).length === 0) {
      return {
        success: false,
        data: null,
        error: 'No hay campos válidos para actualizar',
      }
    }

    // Actualizar la actividad
    const { data, error } = await supabase
      .from('activities')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar actividad:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al actualizar la actividad',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al actualizar actividad:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al actualizar la actividad',
    }
  }
}

/**
 * Obtiene todos los usuarios del sistema
 * Nota: Sin backend, solo podemos obtener información del usuario actual
 * Para gestionar usuarios, usa el dashboard de Supabase
 * @returns {Promise<{success: boolean, data: Array|null, error: string|null, count: number|null}>}
 */
export async function getAllUsers() {
  try {
    // Sin backend, solo podemos obtener información del usuario actual
    // Para listar todos los usuarios, necesitarías usar el dashboard de Supabase
    // o crear un endpoint backend
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return {
        success: false,
        data: null,
        error: 'No se pudo obtener información del usuario actual',
        count: null,
      }
    }

    // Retornar solo el usuario actual como ejemplo
    // En producción, esto debería conectarse a una tabla de usuarios o usar backend
    return {
      success: true,
      data: user ? [user] : [],
      error: null,
      count: user ? 1 : 0,
    }
  } catch (error) {
    console.error('Error inesperado al obtener usuarios:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al obtener los usuarios',
      count: null,
    }
  }
}

/**
 * Crea un nuevo usuario usando signUp
 * Nota: Sin backend, solo podemos crear usuarios normales que necesitan confirmar su email
 * Para crear usuarios admin sin confirmación, usa el dashboard de Supabase
 * @param {string} email - Email del nuevo usuario
 * @param {string} password - Contraseña del nuevo usuario
 * @returns {Promise<{success: boolean, user: Object|null, error: string|null}>}
 */
export async function createUser(email, password) {
  try {
    if (!email || !email.trim()) {
      return {
        success: false,
        user: null,
        error: 'El email es obligatorio',
      }
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        user: null,
        error: 'La contraseña debe tener al menos 6 caracteres',
      }
    }

    // Crear usuario usando signUp (requiere confirmación de email)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
    })

    if (error) {
      console.error('Error al crear usuario:', error)
      return {
        success: false,
        user: null,
        error: error.message || 'Error al crear el usuario',
      }
    }

    return {
      success: true,
      user: data.user || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al crear usuario:', error)
    return {
      success: false,
      user: null,
      error: error.message || 'Error inesperado al crear el usuario',
    }
  }
}

/**
 * Elimina un usuario
 * Nota: Sin backend, no podemos eliminar usuarios directamente
 * Usa el dashboard de Supabase para eliminar usuarios
 * @param {string} userId - ID del usuario a eliminar
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteUser(userId) {
  // Sin backend, no podemos eliminar usuarios desde el frontend
  // Esta operación requiere permisos de administrador que solo están disponibles con service_role key
  return {
    success: false,
    error:
      'No se puede eliminar usuarios desde el frontend por seguridad. Usa el dashboard de Supabase (Authentication → Users) para eliminar usuarios.',
  }
}

/**
 * Actualiza la contraseña del usuario actual
 * Nota: Sin backend, solo podemos actualizar la contraseña del usuario autenticado
 * Para actualizar otros usuarios, usa el dashboard de Supabase
 * @param {string} userId - ID del usuario (debe ser el usuario actual)
 * @param {Object} updates - Objeto con los campos a actualizar (solo password)
 * @returns {Promise<{success: boolean, user: Object|null, error: string|null}>}
 */
export async function updateUser(userId, updates) {
  try {
    // Sin backend, solo podemos actualizar la contraseña del usuario actual
    if (!updates.password || !userId) {
      return {
        success: false,
        user: null,
        error:
          'Sin backend, solo puedes actualizar tu propia contraseña. Para gestionar otros usuarios, usa el dashboard de Supabase.',
      }
    }

    // Verificar que el userId sea el del usuario actual
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser || currentUser.id !== userId) {
      return {
        success: false,
        user: null,
        error:
          'Solo puedes actualizar tu propia contraseña. Para gestionar otros usuarios, usa el dashboard de Supabase.',
      }
    }

    // Actualizar contraseña del usuario actual
    const { error } = await supabase.auth.updateUser({
      password: updates.password,
    })

    if (error) {
      console.error('Error al actualizar contraseña:', error)
      return {
        success: false,
        user: null,
        error: error.message || 'Error al actualizar la contraseña',
      }
    }

    return {
      success: true,
      user: currentUser,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al actualizar usuario:', error)
    return {
      success: false,
      user: null,
      error: error.message || 'Error inesperado al actualizar el usuario',
    }
  }
}
