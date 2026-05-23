import { ACCOMMODATION_OPTIONS, getRegistrationTotalPriceForMember } from '@/constants'

export function getAccommodationLabel(value) {
  const option = ACCOMMODATION_OPTIONS.find((opt) => opt.value === value)
  if (!option) return value ?? ''
  return option.fullLabel ?? option.label
}

export function getRegistrationFullName(registration) {
  const fullName = String(registration?.full_name || '').trim()
  return fullName || '-'
}

export function formatAttendeeNumber(value) {
  if (!Number.isInteger(value) || value <= 0) return '-'
  return String(value).padStart(4, '0')
}

export function formatFamilyGroup(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return '-'
  return normalized.slice(0, 8)
}

export function formatFamilyRole(value) {
  if (value === 'holder') return 'Titular'
  if (value === 'partner') return 'Pareja'
  if (value === 'child') return 'Hijo/a'
  return '-'
}

export function formatBooleanYesNo(value) {
  return value ? 'Sí' : 'No'
}

export function getRegistrationTotalAmount(registration) {
  return getRegistrationTotalPriceForMember({
    accommodation: registration?.accommodation,
    birthDate: registration?.birth_date,
    isChild: registration?.family_role === 'child' || Boolean(registration?.is_minor),
    childSharesParentChozo: Boolean(registration?.child_shares_parent_chozo),
    ziplineRequested: Boolean(registration?.zipline_requested),
  }).totalPrice
}

export function formatTotalAmount(registration) {
  return `${getRegistrationTotalAmount(registration)}€`
}

export function formatDateTime(dateString) {
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

export function formatDateOnly(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES')
}

export function formatLastContactDate(dateString) {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Nunca'
  return formatDateTime(dateString)
}

export function formatDietList(diet) {
  return Array.isArray(diet) ? diet.join(', ') : ''
}

/** Valores crudos para ordenación (servidor o cliente). */
export function getRegistrationSortValue(columnId, registration) {
  switch (columnId) {
    case 'attendee_number':
      return registration.attendee_number ?? null
    case 'family_group':
      return registration.family_group_id ?? ''
    case 'family_role':
      return registration.family_role ?? ''
    case 'full_name':
      return getRegistrationFullName(registration)
    case 'nickname':
      return registration.nickname ?? ''
    case 'email':
      return registration.email ?? ''
    case 'phone':
      return registration.phone ?? ''
    case 'birth_date':
      return registration.birth_date ?? null
    case 'is_minor':
      return Boolean(registration.is_minor)
    case 'emergency_contact_name':
      return registration.emergency_contact_name ?? ''
    case 'emergency_contact_phone':
      return registration.emergency_contact_phone ?? ''
    case 'arrival_date':
      return registration.arrival_date ?? null
    case 'departure_date':
      return registration.departure_date ?? null
    case 'accommodation':
      return registration.accommodation ?? ''
    case 'total_amount':
      return getRegistrationTotalAmount(registration)
    case 'accommodation_paid':
      return Boolean(registration.accommodation_paid)
    case 'last_payment_reminder':
      return registration.last_payment_reminder_sent_at ?? null
    case 'zipline_requested':
      return Boolean(registration.zipline_requested)
    case 'zipline_paid':
      return Boolean(registration.zipline_paid)
    case 'diet':
      return formatDietList(registration.diet)
    case 'comments':
      return registration.comments ?? ''
    case 'diet_comments':
      return registration.diet_comments ?? ''
    case 'terms_accepted':
      return Boolean(registration.terms_accepted)
    case 'image_consent_accepted':
      return Boolean(registration.image_consent_accepted)
    case 'created_at':
      return registration.created_at ?? null
    case 'updated_at':
      return registration.updated_at ?? null
    default:
      return ''
  }
}

/** Valores exportables / de celda por id de columna. */
export function getRegistrationColumnValue(columnId, registration) {
  switch (columnId) {
    case 'attendee_number':
      return formatAttendeeNumber(registration.attendee_number)
    case 'family_group':
      return formatFamilyGroup(registration.family_group_id)
    case 'family_role':
      return formatFamilyRole(registration.family_role)
    case 'full_name':
      return getRegistrationFullName(registration)
    case 'nickname':
      return registration.nickname || ''
    case 'email':
      return registration.email ?? ''
    case 'phone':
      return registration.phone ?? ''
    case 'birth_date':
      return formatDateOnly(registration.birth_date)
    case 'is_minor':
      return formatBooleanYesNo(registration.is_minor)
    case 'emergency_contact_name':
      return registration.emergency_contact_name || ''
    case 'emergency_contact_phone':
      return registration.emergency_contact_phone || ''
    case 'arrival_date':
      return registration.arrival_date ? formatDateTime(registration.arrival_date) : ''
    case 'departure_date':
      return registration.departure_date ? formatDateTime(registration.departure_date) : ''
    case 'accommodation':
      return getAccommodationLabel(registration.accommodation)
    case 'total_amount':
      return formatTotalAmount(registration)
    case 'zipline_requested':
      return formatBooleanYesNo(registration.zipline_requested)
    case 'zipline_paid':
      return formatBooleanYesNo(registration.zipline_paid)
    case 'diet':
      return formatDietList(registration.diet)
    case 'comments':
      return registration.comments || ''
    case 'diet_comments':
      return registration.diet_comments || ''
    case 'terms_accepted':
      return formatBooleanYesNo(registration.terms_accepted)
    case 'image_consent_accepted':
      return formatBooleanYesNo(registration.image_consent_accepted)
    case 'accommodation_paid':
      return formatBooleanYesNo(registration.accommodation_paid)
    case 'last_payment_reminder':
      return formatLastContactDate(registration.last_payment_reminder_sent_at)
    case 'created_at':
      return registration.created_at ? formatDateTime(registration.created_at) : ''
    case 'updated_at':
      return registration.updated_at ? formatDateTime(registration.updated_at) : ''
    default:
      return ''
  }
}
