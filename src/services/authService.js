/**
 * Servicio de autenticación con Supabase
 * Gestiona el login y logout de administradores
 */

import { supabase } from '@/lib/supabase'

/**
 * URL de retorno tras el enlace del correo de recuperación (misma ruta que el panel).
 * @returns {string}
 */
export function getPasswordRecoveryRedirectUrl() {
  if (typeof window === 'undefined') {
    return '/admin'
  }
  return `${window.location.origin}/admin`
}

/**
 * Envía el correo de restablecimiento de contraseña (Supabase Auth).
 * @param {string} email
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function requestPasswordReset(email) {
  try {
    const trimmed = (email || '').trim().toLowerCase()
    if (!trimmed) {
      return { success: false, error: 'El correo electrónico es obligatorio.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: getPasswordRecoveryRedirectUrl(),
    })

    if (error) {
      console.error('Error al solicitar recuperación:', error)
      return {
        success: false,
        error: error.message || 'No se pudo enviar el correo de recuperación.',
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado al solicitar recuperación:', error)
    return {
      success: false,
      error: error.message || 'Error inesperado al solicitar recuperación.',
    }
  }
}

/**
 * Establece la nueva contraseña durante el flujo de recuperación (sesión ya abierta por el enlace).
 * @param {string} password
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function updatePasswordAfterRecovery(password) {
  try {
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres.',
      }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('Error al actualizar contraseña:', error)
      return {
        success: false,
        error: error.message || 'No se pudo actualizar la contraseña.',
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error inesperado al actualizar contraseña:', error)
    return {
      success: false,
      error: error.message || 'Error inesperado al actualizar la contraseña.',
    }
  }
}

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

/**
 * Sesión actual del cliente Supabase Auth.
 * @returns {Promise<{ session: object|null, error: Error|null }>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return {
    session: data?.session ?? null,
    error: error ?? null,
  }
}
