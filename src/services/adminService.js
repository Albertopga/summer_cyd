/**
 * Servicio para gestionar registros desde el panel de administración
 * Requiere autenticación
 */

import { supabase } from '@/lib/supabase'
import {
  ACTIVITY_DOCUMENTS_STORAGE_PUBLIC_PREFIX,
  EVENT_DATES,
  parseEventDateLocal,
  SLOT_TIME_RANGES,
} from '@/constants'

const ACTIVITY_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024
const ACTIVITY_DOCUMENT_ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
]

const normalizeTime = (timeValue) => String(timeValue || '').slice(0, 5)

function validateActivityDateTime(activityDate, activityTime, preferredTimeSlot) {
  const hasDate = Boolean(activityDate)
  const hasTime = Boolean(activityTime)

  if (!preferredTimeSlot) {
    return { valid: false, error: 'La franja horaria es obligatoria.' }
  }

  if (!hasDate && !hasTime) {
    return { valid: true, error: null }
  }

  if (!hasDate || !hasTime) {
    return { valid: false, error: 'Debes indicar fecha y hora juntas, o dejar ambas vacías.' }
  }

  const selectedDate = parseEventDateLocal(activityDate)
  const startDate = parseEventDateLocal(EVENT_DATES.start)
  const endDate = parseEventDateLocal(EVENT_DATES.end)

  if (selectedDate < startDate || selectedDate > endDate) {
    return { valid: false, error: 'La fecha de actividad está fuera de las fechas del evento.' }
  }

  const slot = SLOT_TIME_RANGES[preferredTimeSlot]
  if (!slot) {
    return { valid: false, error: 'Franja horaria no válida.' }
  }

  if (selectedDate.getDay() !== slot.day) {
    return { valid: false, error: 'La fecha no coincide con la franja horaria seleccionada.' }
  }

  const normalized = normalizeTime(activityTime)
  if (normalized < slot.start || normalized > slot.end) {
    return {
      valid: false,
      error: `La hora debe estar entre ${slot.start} y ${slot.end} para la franja seleccionada.`,
    }
  }

  return { valid: true, error: null }
}

/**
 * Lanza el proceso de recordatorios de pago desde el panel admin.
 * Requiere sesión autenticada (Bearer token) y endpoint desplegado en Vercel.
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function triggerPaymentReminders() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.access_token) {
      return {
        success: false,
        data: null,
        error: 'No hay sesión activa de administrador.',
      }
    }

    const response = await fetch('/api/payment-reminders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: 'admin_panel' }),
    })

    let payload = null
    let rawBody = ''
    try {
      payload = await response.json()
    } catch {
      payload = null
      try {
        rawBody = await response.text()
      } catch {
        rawBody = ''
      }
    }

    if (!response.ok) {
      return {
        success: false,
        data: payload,
        error:
          payload?.error ||
          (rawBody ? `Error al lanzar recordatorios (${response.status}): ${rawBody}` : '') ||
          `Error al lanzar recordatorios (${response.status})`,
      }
    }

    return {
      success: true,
      data: payload,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al lanzar recordatorios:', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al lanzar recordatorios',
    }
  }
}

async function uploadAdminActivityFile(file, organizerEmail, fileIndex) {
  const timestamp = Date.now()
  const sanitizedEmail = organizerEmail.replace(/[^a-zA-Z0-9]/g, '_')
  const extension = file.name.split('.').pop()
  const fileName = `${sanitizedEmail}_admin_activity_file${fileIndex}_${timestamp}.${extension}`
  const filePath = `activities/${sanitizedEmail}/${fileName}`

  const { error } = await supabase.storage.from('activity-documents').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    return { success: false, doc: null, error: error.message || 'Error al subir archivo' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('activity-documents').getPublicUrl(filePath)

  return {
    success: true,
    doc: {
      name: file.name,
      url: publicUrl,
      path: filePath,
      size: file.size,
      type: file.type,
    },
    error: null,
  }
}

async function uploadAdminActivityDocuments(files, organizerEmail) {
  const list = Array.isArray(files) ? files : []
  if (list.length === 0) return { success: true, data: [], error: null }

  const uploaded = []
  for (let i = 0; i < list.length; i += 1) {
    const file = list[i]
    if (!ACTIVITY_DOCUMENT_ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        data: null,
        error: `El archivo ${file.name} no tiene un formato permitido.`,
      }
    }
    if (file.size > ACTIVITY_DOCUMENT_MAX_SIZE) {
      return {
        success: false,
        data: null,
        error: `El archivo ${file.name} supera el tamaño máximo de 10MB.`,
      }
    }

    const result = await uploadAdminActivityFile(file, organizerEmail, i)
    if (!result.success) {
      return {
        success: false,
        data: null,
        error: `Error al subir ${file.name}: ${result.error}`,
      }
    }
    uploaded.push(result.doc)
  }

  return { success: true, data: uploaded, error: null }
}

function extractStoragePathFromDocument(doc) {
  if (doc && typeof doc === 'object') {
    if (typeof doc.path === 'string' && doc.path.trim()) {
      return doc.path.trim()
    }
    if (typeof doc.url === 'string' && doc.url.trim()) {
      return extractStoragePathFromPublicUrl(doc.url)
    }
  }
  if (typeof doc === 'string') {
    return extractStoragePathFromPublicUrl(doc)
  }
  return ''
}

function extractStoragePathFromPublicUrl(url) {
  try {
    const parsed = new URL(url)
    const markerIndex = parsed.pathname.indexOf(ACTIVITY_DOCUMENTS_STORAGE_PUBLIC_PREFIX)
    if (markerIndex < 0) return ''
    return decodeURIComponent(
      parsed.pathname.slice(markerIndex + ACTIVITY_DOCUMENTS_STORAGE_PUBLIC_PREFIX.length),
    )
  } catch {
    return ''
  }
}

async function removeActivityDocumentsFromStorage(paths = []) {
  const cleanPaths = Array.from(
    new Set(
      (Array.isArray(paths) ? paths : [])
        .map((path) => String(path || '').trim())
        .filter((path) => path.length > 0),
    ),
  )

  if (cleanPaths.length === 0) {
    return { success: true, error: null }
  }

  const { error } = await supabase.storage.from('activity-documents').remove(cleanPaths)
  if (error) {
    return {
      success: false,
      error: error.message || 'No se pudieron eliminar documentos del almacenamiento.',
    }
  }

  return { success: true, error: null }
}

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
 * Elimina un registro por su ID
 * @param {string} id - ID del registro (UUID)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteRegistration(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Falta el identificador del registro.',
      }
    }

    const { data, error } = await supabase.from('registrations').delete().eq('id', id).select('id')

    if (error) {
      console.error('Error al eliminar registro:', error)
      return {
        success: false,
        error: error.message || 'Error al eliminar el registro',
      }
    }

    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        error:
          'No se pudo borrar el registro. Puede que no exista o que tu usuario no tenga permisos de borrado (RLS).',
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al eliminar registro:', error)
    return {
      success: false,
      error: error.message || 'Error inesperado al eliminar el registro',
    }
  }
}

/**
 * Elimina múltiples registros por sus IDs
 * @param {Array<string>} ids - IDs de los registros
 * @returns {Promise<{success: boolean, deletedCount: number, error: string|null}>}
 */
export async function deleteRegistrationsBulk(ids = []) {
  try {
    const cleanIds = Array.isArray(ids) ? ids.filter(Boolean) : []
    if (cleanIds.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        error: 'No hay registros seleccionados para borrar.',
      }
    }

    const { data, error } = await supabase
      .from('registrations')
      .delete()
      .in('id', cleanIds)
      .select('id')

    if (error) {
      console.error('Error al eliminar registros en bloque:', error)
      return {
        success: false,
        deletedCount: 0,
        error: error.message || 'Error al eliminar los registros seleccionados',
      }
    }

    const deletedCount = Array.isArray(data) ? data.length : 0
    if (deletedCount === 0) {
      return {
        success: false,
        deletedCount: 0,
        error:
          'No se pudo borrar ningún registro. Revisa permisos de borrado (RLS) o si los registros todavía existen.',
      }
    }

    if (deletedCount < cleanIds.length) {
      return {
        success: false,
        deletedCount,
        error: `Solo se eliminaron ${deletedCount} de ${cleanIds.length} registros seleccionados.`,
      }
    }

    return {
      success: true,
      deletedCount,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al eliminar registros en bloque:', error)
    return {
      success: false,
      deletedCount: 0,
      error: error.message || 'Error inesperado al eliminar los registros seleccionados',
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

    const incomingDocuments = Array.isArray(filteredUpdates.documents) ? filteredUpdates.documents : []
    const documentsToRemove = Array.isArray(filteredUpdates.documents_to_remove)
      ? filteredUpdates.documents_to_remove.map((path) => String(path || '').trim()).filter(Boolean)
      : []
    delete filteredUpdates.documents_to_remove
    const scheduleFieldsChanged =
      Object.prototype.hasOwnProperty.call(filteredUpdates, 'activity_date') ||
      Object.prototype.hasOwnProperty.call(filteredUpdates, 'activity_time') ||
      Object.prototype.hasOwnProperty.call(filteredUpdates, 'preferred_time_slot')

    let currentActivitySchedule = null
    if (scheduleFieldsChanged) {
      const { data: scheduleRow, error: scheduleError } = await supabase
        .from('activities')
        .select('activity_date, activity_time, preferred_time_slot')
        .eq('id', id)
        .single()

      if (scheduleError) {
        return {
          success: false,
          data: null,
          error: scheduleError.message || 'No se pudo validar fecha/hora de la actividad',
        }
      }
      currentActivitySchedule = scheduleRow
    }
    if (incomingDocuments.length > 0 || documentsToRemove.length > 0) {
      const { data: currentActivity, error: currentActivityError } = await supabase
        .from('activities')
        .select('documents, organizer_email')
        .eq('id', id)
        .single()

      if (currentActivityError) {
        console.error('Error al obtener documentos actuales de la actividad:', currentActivityError)
        return {
          success: false,
          data: null,
          error: currentActivityError.message || 'No se pudieron preparar los documentos para guardar',
        }
      }

      const organizerEmail = String(filteredUpdates.organizer_email || currentActivity?.organizer_email || '')
        .trim()
        .toLowerCase()

      const currentDocuments = Array.isArray(currentActivity?.documents) ? currentActivity.documents : []
      let nextDocuments = [...currentDocuments]

      if (documentsToRemove.length > 0) {
        const currentDocPaths = nextDocuments.map((doc) => extractStoragePathFromDocument(doc)).filter(Boolean)
        const removablePaths = currentDocPaths.filter((path) => documentsToRemove.includes(path))
        const removeResult = await removeActivityDocumentsFromStorage(removablePaths)
        if (!removeResult.success) {
          return {
            success: false,
            data: null,
            error: removeResult.error || 'No se pudieron eliminar los documentos seleccionados.',
          }
        }

        nextDocuments = nextDocuments.filter((doc) => {
          const path = extractStoragePathFromDocument(doc)
          return !documentsToRemove.includes(path)
        })
      }

      if (incomingDocuments.length > 0) {
        const uploadResult = await uploadAdminActivityDocuments(incomingDocuments, organizerEmail)
        if (!uploadResult.success) {
          return {
            success: false,
            data: null,
            error: uploadResult.error || 'No se pudieron subir los documentos.',
          }
        }
        nextDocuments = [...nextDocuments, ...uploadResult.data]
      }

      filteredUpdates.documents = nextDocuments
    }

    if (scheduleFieldsChanged) {
      const effectiveDate = filteredUpdates.activity_date ?? currentActivitySchedule?.activity_date
      const effectiveTime = filteredUpdates.activity_time ?? currentActivitySchedule?.activity_time
      const effectiveSlot =
        filteredUpdates.preferred_time_slot ?? currentActivitySchedule?.preferred_time_slot
      const scheduleValidation = validateActivityDateTime(effectiveDate, effectiveTime, effectiveSlot)
      if (!scheduleValidation.valid) {
        return {
          success: false,
          data: null,
          error: scheduleValidation.error,
        }
      }
    }

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
 * Elimina una actividad por ID
 * @param {string} id - ID de la actividad
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteActivity(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Falta el identificador de la actividad.',
      }
    }

    const { data: activityRowBeforeDelete } = await supabase
      .from('activities')
      .select('documents')
      .eq('id', id)
      .maybeSingle()

    // Con RLS, Supabase puede devolver error=null aunque no borre filas.
    // Pedimos retorno de filas borradas para confirmar eliminación real.
    const { data, error } = await supabase.from('activities').delete().eq('id', id).select('id')
    if (error) {
      console.error('Error al eliminar actividad:', error)
      return {
        success: false,
        error: error.message || 'Error al eliminar la actividad',
      }
    }

    if (!Array.isArray(data) || data.length === 0) {
      const { data: existsData, error: existsError } = await supabase
        .from('activities')
        .select('id, organizer_email, status')
        .eq('id', id)
        .maybeSingle()
      if (existsError) {
        console.error('Error al verificar existencia tras delete:', existsError)
      }
      return {
        success: false,
        error:
          'No se pudo borrar la actividad. Puede que no exista o que tu usuario no tenga permisos de borrado (RLS).',
      }
    }

    const documents = Array.isArray(activityRowBeforeDelete?.documents)
      ? activityRowBeforeDelete.documents
      : []
    const documentPaths = documents.map((doc) => extractStoragePathFromDocument(doc)).filter(Boolean)
    const removeDocsResult = await removeActivityDocumentsFromStorage(documentPaths)
    if (!removeDocsResult.success) {
      console.error('Actividad eliminada pero falló limpieza de documentos:', removeDocsResult.error)
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al eliminar actividad:', error)
    return {
      success: false,
      error: error.message || 'Error inesperado al eliminar la actividad',
    }
  }
}

/**
 * Crea una actividad desde el panel admin (sesión autenticada).
 * No aplica el límite de 2 por email ni la exigencia de estar en registrations (lo controla el trigger en BD).
 * @param {Object} payload - Campos de la actividad (snake_case como en la tabla)
 * @returns {Promise<{success: boolean, data: Object|null, error: string|null}>}
 */
export async function createActivityAdmin(payload) {
  try {
    const organizerEmail = String(payload.organizer_email || '')
      .trim()
      .toLowerCase()

    const uploadResult = await uploadAdminActivityDocuments(payload.documents, organizerEmail)
    if (!uploadResult.success) {
      return {
        success: false,
        data: null,
        error: uploadResult.error || 'No se pudieron subir los documentos.',
      }
    }

    const row = {
      organizer_email: organizerEmail,
      organizer_name: String(payload.organizer_name || '').trim(),
      type: payload.type,
      name: String(payload.name || '').trim(),
      description: String(payload.description || '').trim(),
      min_participants: Number(payload.min_participants),
      max_participants: Number(payload.max_participants),
      preferred_time_slot: payload.preferred_time_slot,
      activity_date: payload.activity_date || null,
      activity_time: payload.activity_time || null,
      duration: String(payload.duration || '').trim(),
      participant_needs: payload.participant_needs?.trim() || null,
      organization_needs: payload.organization_needs?.trim() || null,
      space_need: payload.space_need?.trim() || null,
      setup: payload.setup?.trim() || null,
      observations: payload.observations?.trim() || null,
      documents: uploadResult.data,
      status: payload.status || 'approved',
    }

    if (!row.organizer_email || !row.organizer_name || !row.type || !row.name || !row.description) {
      return {
        success: false,
        data: null,
        error: 'Faltan datos obligatorios del organizador o de la actividad.',
      }
    }

    if (
      !Number.isFinite(row.min_participants) ||
      !Number.isFinite(row.max_participants) ||
      row.min_participants < 1 ||
      row.max_participants < 1 ||
      row.min_participants > row.max_participants
    ) {
      return {
        success: false,
        data: null,
        error: 'Revisa el mínimo y máximo de participantes.',
      }
    }

    if (!row.preferred_time_slot || !row.duration) {
      return {
        success: false,
        data: null,
        error: 'Franja horaria y duración son obligatorias.',
      }
    }

    if (Boolean(row.activity_date) !== Boolean(row.activity_time)) {
      return {
        success: false,
        data: null,
        error: 'Si indicas fecha de actividad, debes indicar también hora (y viceversa).',
      }
    }

    const scheduleValidation = validateActivityDateTime(
      row.activity_date,
      row.activity_time,
      row.preferred_time_slot,
    )
    if (!scheduleValidation.valid) {
      return {
        success: false,
        data: null,
        error: scheduleValidation.error,
      }
    }

    const { data, error } = await supabase.from('activities').insert([row]).select().single()

    if (error) {
      console.error('Error al crear actividad (admin):', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Error al crear la actividad',
      }
    }

    return {
      success: true,
      data: data || null,
      error: null,
    }
  } catch (error) {
    console.error('Error inesperado al crear actividad (admin):', error)
    return {
      success: false,
      data: null,
      error: error.message || 'Error inesperado al crear la actividad',
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
