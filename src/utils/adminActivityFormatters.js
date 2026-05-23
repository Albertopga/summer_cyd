import { ACTIVITY_TYPES, SPACE_NEEDS, TIME_SLOTS } from '@/constants'

export function getActivityTypeLabel(value) {
  const option = ACTIVITY_TYPES.find((opt) => opt.value === value)
  return option ? option.label : value ?? ''
}

export function getTimeSlotLabel(value) {
  const option = TIME_SLOTS.find((opt) => opt.value === value)
  return option ? option.label : value ?? ''
}

export function getActivityStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
  }
  return labels[status] || status || ''
}

export function getSpaceNeedLabel(value) {
  if (!value) return '-'
  const option = SPACE_NEEDS.find((opt) => opt.value === value)
  return option ? option.label : value
}

export function formatActivityDateTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatActivityDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatActivityTime(timeString) {
  if (!timeString) return '-'
  return String(timeString).slice(0, 5)
}

export function formatParticipantsRange(activity) {
  const min = activity?.min_participants
  const max = activity?.max_participants
  if (min == null || max == null) return '-'
  return `${min}-${max}`
}

export function formatDocumentsSummary(documents) {
  return Array.isArray(documents) && documents.length > 0
    ? `${documents.length} archivo(s)`
    : 'Sin documentos'
}

/** Valores crudos para ordenación. */
export function getActivitySortValue(columnId, activity) {
  switch (columnId) {
    case 'organizer_name':
      return activity.organizer_name ?? ''
    case 'organizer_email':
      return activity.organizer_email ?? ''
    case 'type':
      return activity.type ?? ''
    case 'name':
      return activity.name ?? ''
    case 'participants':
      return Number(activity.min_participants ?? 0) * 10000 + Number(activity.max_participants ?? 0)
    case 'min_participants':
      return activity.min_participants ?? null
    case 'max_participants':
      return activity.max_participants ?? null
    case 'activity_date':
      return activity.activity_date ?? null
    case 'activity_time':
      return activity.activity_time ?? null
    case 'preferred_time_slot':
      return activity.preferred_time_slot ?? ''
    case 'duration':
      return activity.duration ?? ''
    case 'participant_needs':
      return activity.participant_needs ?? ''
    case 'organization_needs':
      return activity.organization_needs ?? ''
    case 'space_need':
      return activity.space_need ?? ''
    case 'setup':
      return activity.setup ?? ''
    case 'observations':
      return activity.observations ?? ''
    case 'status':
      return activity.status ?? ''
    case 'approved_by':
      return activity.approved_by ?? ''
    case 'approval_notes':
      return activity.approval_notes ?? ''
    case 'documents':
      return Array.isArray(activity.documents) ? activity.documents.length : 0
    case 'created_at':
      return activity.created_at ?? null
    case 'updated_at':
      return activity.updated_at ?? null
    default:
      return ''
  }
}

/** Valores exportables / de celda por id de columna. */
export function getActivityColumnValue(columnId, activity) {
  switch (columnId) {
    case 'organizer_name':
      return activity.organizer_name || ''
    case 'organizer_email':
      return activity.organizer_email || ''
    case 'type':
      return getActivityTypeLabel(activity.type)
    case 'name':
      return activity.name || ''
    case 'description':
      return activity.description || ''
    case 'participants':
      return formatParticipantsRange(activity)
    case 'min_participants':
      return activity.min_participants ?? ''
    case 'max_participants':
      return activity.max_participants ?? ''
    case 'activity_date':
      return formatActivityDate(activity.activity_date)
    case 'activity_time':
      return formatActivityTime(activity.activity_time)
    case 'preferred_time_slot':
      return getTimeSlotLabel(activity.preferred_time_slot)
    case 'duration':
      return activity.duration || ''
    case 'participant_needs':
      return activity.participant_needs || ''
    case 'organization_needs':
      return activity.organization_needs || ''
    case 'space_need':
      return getSpaceNeedLabel(activity.space_need)
    case 'setup':
      return activity.setup || ''
    case 'observations':
      return activity.observations || ''
    case 'status':
      return getActivityStatusLabel(activity.status)
    case 'approved_by':
      return activity.approved_by || ''
    case 'approval_notes':
      return activity.approval_notes || ''
    case 'documents':
      return formatDocumentsSummary(activity.documents)
    case 'created_at':
      return activity.created_at ? formatActivityDateTime(activity.created_at) : ''
    case 'updated_at':
      return activity.updated_at ? formatActivityDateTime(activity.updated_at) : ''
    default:
      return ''
  }
}
