/**
 * Servicio de autenticación con Supabase
 * Gestiona el login y logout de administradores
 */

import { supabase } from '@/lib/supabase'

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del administrador
 * @param {string} password - Contraseña del administrador
 * @returns {Promise<{success: boolean, user: Object|null, error: string|null}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error al iniciar sesión:', error)
      return {
        success: false,
        user: null,
        error: error.message || 'Error al iniciar sesión',
      }
    }

    return {
      success: true,
      user: data.user,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al iniciar sesión:', error)
    return {
      success: false,
      user: null,
      error: error.message || 'Error inesperado al iniciar sesión',
    }
  }
}

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión:', error)
      return {
        success: false,
        error: error.message || 'Error al cerrar sesión',
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al cerrar sesión:', error)
    return {
      success: false,
      error: error.message || 'Error inesperado al cerrar sesión',
    }
  }
}

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return {
        user: null,
        error: error.message,
      }
    }

    return {
      user,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: error.message,
    }
  }
}

/**
 * Escucha cambios en el estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 * @returns {Function} Función para desuscribirse
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
