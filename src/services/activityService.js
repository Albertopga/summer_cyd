/**
 * Servicio para gestionar el registro de actividades
 * Interactúa con Supabase para almacenar datos de actividades y documentos
 */

import { supabase } from '@/lib/supabase'

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
      return {
        success: false,
        data: null,
        error: error.message || 'Error al guardar las actividades en la base de datos',
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
