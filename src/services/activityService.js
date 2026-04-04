/**
 * Servicio para gestionar el registro de actividades
 * Interactúa con Supabase para almacenar datos de actividades y documentos
 */

import { supabase } from '@/lib/supabase'
import { isActivityRegistrationDeadlinePassed, MAX_ACTIVITIES_PER_ORGANIZER } from '@/constants'

/** Mensaje si el organizador ya alcanzó el máximo de actividades (trigger BD o comprobación previa). */
export const ACTIVITIES_MAX_REACHED_MESSAGE =
  'Este participante ya tiene el máximo de actividades registradas (2). Si necesitas cambiar algo, contacta con la organización.'

/** Mensaje si el email no figura como asistente en registrations (trigger BD o RPC). */
export const ACTIVITIES_ORGANIZER_NOT_REGISTERED_MESSAGE =
  'Este correo no coincide con ningún registro de asistente. Debes usar el mismo email con el que te inscribiste al retiro.'

/**
 * Cuenta actividades existentes para un email de organizador (RPC en Supabase).
 * @param {string} organizerEmail
 * @returns {Promise<{ success: boolean, count: number, error: string|null }>}
 */
/**
 * Indica si el correo existe en la tabla registrations (RPC en Supabase).
 * @param {string} organizerEmail
 * @returns {Promise<{ success: boolean, registered: boolean, error: string|null }>}
 */
export async function isAttendeeEmailRegistered(organizerEmail) {
  try {
    const email = (organizerEmail || '').trim().toLowerCase()
    if (!email) {
      return { success: false, registered: false, error: 'Email obligatorio' }
    }

    const { data, error } = await supabase.rpc('is_attendee_email_registered', {
      p_email: email,
    })

    if (error) {
      console.error('Error al comprobar registro de asistente:', error)
      return {
        success: false,
        registered: false,
        error: error.message || 'No se pudo comprobar el registro',
      }
    }

    return { success: true, registered: Boolean(data), error: null }
  } catch (error) {
    console.error('Error inesperado al comprobar registro:', error)
    return {
      success: false,
      registered: false,
      error: error.message || 'Error inesperado al comprobar el registro',
    }
  }
}

export async function countActivitiesForOrganizer(organizerEmail) {
  try {
    const email = (organizerEmail || '').trim().toLowerCase()
    if (!email) {
      return { success: false, count: 0, error: 'Email obligatorio' }
    }

    const { data, error } = await supabase.rpc('count_activities_for_organizer', {
      p_email: email,
    })

    if (error) {
      console.error('Error al contar actividades:', error)
      return {
        success: false,
        count: 0,
        error: error.message || 'No se pudo comprobar el número de actividades',
      }
    }

    const count = typeof data === 'number' ? data : Number(data) || 0
    return { success: true, count, error: null }
  } catch (error) {
    console.error('Error inesperado al contar actividades:', error)
    return {
      success: false,
      count: 0,
      error: error.message || 'Error inesperado al contar actividades',
    }
  }
}

/**
 * Sube un archivo a Supabase Storage
 * @param {File} file - Archivo a subir
 * @param {string} organizerEmail - Email del organizador (para organizar en carpetas)
 * @param {number} activityIndex - Índice de la actividad (para organizar archivos)
 * @param {number} fileIndex - Índice del archivo dentro de la actividad
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
async function uploadFile(file, organizerEmail, activityIndex, fileIndex) {
  try {
    // Crear nombre único para el archivo
    const timestamp = Date.now()
    const sanitizedEmail = organizerEmail.replace(/[^a-zA-Z0-9]/g, '_')
    const fileExtension = file.name.split('.').pop()
    const fileName = `${sanitizedEmail}_activity${activityIndex}_file${fileIndex}_${timestamp}.${fileExtension}`
    const filePath = `activities/${sanitizedEmail}/${fileName}`

    // Subir el archivo al bucket
    const { data, error } = await supabase.storage
      .from('activity-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error al subir archivo:', error)
      return {
        success: false,
        url: null,
        error: error.message || 'Error al subir el archivo',
      }
    }

    // Obtener la URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from('activity-documents').getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al subir archivo:', error)
    return {
      success: false,
      url: null,
      error: error.message || 'Error inesperado al subir el archivo',
    }
  }
}

/**
 * Sube todos los documentos de una actividad
 * @param {Array<File>} files - Array de archivos a subir
 * @param {string} organizerEmail - Email del organizador
 * @param {number} activityIndex - Índice de la actividad
 * @returns {Promise<{success: boolean, documents: Array|null, error: string|null}>}
 */
async function uploadActivityDocuments(files, organizerEmail, activityIndex) {
  if (!files || files.length === 0) {
    return {
      success: true,
      documents: [],
      error: null,
    }
  }

  const uploadedDocuments = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await uploadFile(file, organizerEmail, activityIndex, i)

    if (!result.success) {
      return {
        success: false,
        documents: null,
        error: `Error al subir el archivo ${file.name}: ${result.error}`,
      }
    }

    uploadedDocuments.push({
      name: file.name,
      url: result.url,
      size: file.size,
      type: file.type,
    })
  }

  return {
    success: true,
    documents: uploadedDocuments,
    error: null,
  }
}

/**
 * Guarda las actividades propuestas por un participante
 * @param {string} organizerName - Nombre del organizador
 * @param {string} organizerEmail - Email del organizador (para vincular con el registro)
 * @param {Array} activities - Array de actividades a guardar (cada una puede tener un array 'documents' con archivos File)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function saveActivities(organizerName, organizerEmail, activities) {
  try {
    if (isActivityRegistrationDeadlinePassed()) {
      return {
        success: false,
        data: null,
        error: 'El plazo para registrar actividades ha finalizado.',
      }
    }

    if (!organizerName || !organizerName.trim()) {
      return {
        success: false,
        data: null,
        error: 'El nombre del organizador es obligatorio',
      }
    }

    if (!organizerEmail || !organizerEmail.trim()) {
      return {
        success: false,
        data: null,
        error: 'El email del organizador es obligatorio',
      }
    }

    if (!activities || activities.length === 0) {
      return {
        success: false,
        data: null,
        error: 'No se proporcionaron actividades para guardar',
      }
    }

    const emailKey = organizerEmail.trim().toLowerCase()

    const regResult = await isAttendeeEmailRegistered(emailKey)
    if (!regResult.success) {
      return {
        success: false,
        data: null,
        error: regResult.error || 'No se pudo comprobar el registro del asistente',
      }
    }
    if (!regResult.registered) {
      return {
        success: false,
        data: null,
        error: ACTIVITIES_ORGANIZER_NOT_REGISTERED_MESSAGE,
      }
    }

    const countResult = await countActivitiesForOrganizer(emailKey)
    if (!countResult.success) {
      return {
        success: false,
        data: null,
        error: countResult.error || 'No se pudo comprobar el número de actividades',
      }
    }

    if (countResult.count + activities.length > MAX_ACTIVITIES_PER_ORGANIZER) {
      return {
        success: false,
        data: null,
        error: ACTIVITIES_MAX_REACHED_MESSAGE,
      }
    }

    // Preparar los datos para insertar en la base de datos
    const dataToInsert = []

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i]

      // Subir documentos si existen
      let documents = []
      if (activity.documents && activity.documents.length > 0) {
        const uploadResult = await uploadActivityDocuments(
          activity.documents,
          organizerEmail.trim().toLowerCase(),
          i,
        )

        if (!uploadResult.success) {
          return {
            success: false,
            data: null,
            error: uploadResult.error,
          }
        }

        documents = uploadResult.documents
      }

      // Preparar el objeto de actividad con los documentos subidos
      dataToInsert.push({
        organizer_email: organizerEmail.trim().toLowerCase(),
        organizer_name: organizerName.trim(),
        type: activity.type,
        name: activity.name,
        min_participants: activity.minParticipants,
        max_participants: activity.maxParticipants,
        description: activity.description,
        preferred_time_slot: activity.preferredTimeSlot,
        duration: activity.duration,
        participant_needs: activity.participantNeeds?.trim() || null,
        organization_needs: activity.organizationNeeds?.trim() || null,
        space_need: activity.spaceNeed || null,
        setup: activity.setup?.trim() || null,
        observations: activity.observations?.trim() || null,
        documents: documents.length > 0 ? documents : [],
      })
    }

    // Insertar en la tabla de actividades
    const { data, error } = await supabase.from('activities').insert(dataToInsert).select()

    if (error) {
      console.error('Error al guardar las actividades:', error)
      const raw = error.message || ''
      if (raw.includes('ACTIVITIES_ORGANIZER_NOT_REGISTERED')) {
        return {
          success: false,
          data: null,
          error: ACTIVITIES_ORGANIZER_NOT_REGISTERED_MESSAGE,
        }
      }
      if (raw.includes('ACTIVITIES_MAX_PER_ORGANIZER')) {
        return {
          success: false,
          data: null,
          error: ACTIVITIES_MAX_REACHED_MESSAGE,
        }
      }
      return {
        success: false,
        data: null,
        error: raw || 'Error al guardar las actividades en la base de datos',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al guardar las actividades:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al procesar las actividades',
    }
  }
}
