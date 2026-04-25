/**
 * Plantillas de email para inscripciones y recordatorios.
 * Mantener estilos y copy aquí para facilitar edición independiente.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const FIELD_LABELS = {
  full_name: 'Nombre y apellidos',
  nickname: 'Alias',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  birth_date: 'Fecha de nacimiento',
  is_minor: 'Menor de edad',
  emergency_contact_name: 'Contacto de emergencia (nombre)',
  emergency_contact_phone: 'Contacto de emergencia (teléfono)',
  arrival_date: 'Fecha de llegada',
  departure_date: 'Fecha de salida',
  accommodation: 'Alojamiento',
  diet: 'Dieta',
  comments: 'Comentarios',
  diet_comments: 'Comentarios dieta',
  terms_accepted: 'Aceptación de términos',
  image_consent_accepted: 'Consentimiento de imagen',
  accommodation_paid: 'Pago de alojamiento',
}

const ACCOMMODATION_LABELS = {
  albergue: 'Albergue',
  chozos: 'Chozos compartidos',
  'chozo-individual': 'Chozo individual',
  especial: 'Necesidad especial',
}

const ZIPLINE_PRICE_EUR = 12
const ACCOMMODATION_PRICES_EUR = {
  albergue: 130,
  chozos: 150,
  'chozo-individual': 300,
}
const PAYMENT_IBAN = String(process.env.PAYMENT_IBAN || 'ES41 3035 0255 7125 5002 4794').trim()

function escapeHtml(value) {
  if (value == null) {
    return ''
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value) {
  if (typeof value !== 'string' || !value) {
    return null
  }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(d)
}

function formatValue(field, value) {
  if (value == null || value === '') {
    return '—'
  }
  if (Array.isArray(value)) {
    return value.length ? value.map((item) => String(item)).join(', ') : '—'
  }
  if (field === 'accommodation') {
    return ACCOMMODATION_LABELS[value] || String(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }
  if (field.endsWith('_date') || field.includes('date')) {
    return formatDate(value) || String(value)
  }
  return String(value)
}

function buildLayout({ title, introHtml, bodyHtml, footerHtml }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:#111827;color:#ffffff;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;line-height:1.3;">${escapeHtml(title)}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;line-height:1.6;font-size:15px;">
        ${introHtml}
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:0 24px 24px 24px;color:#6b7280;font-size:13px;">
        ${footerHtml}
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim())
}

function getAccommodationPriceEur(accommodation) {
  return Number(ACCOMMODATION_PRICES_EUR[accommodation] || 0)
}

function getRegistrationTotalPriceEur({ accommodation, ziplineRequested }) {
  const accommodationPrice = getAccommodationPriceEur(accommodation)
  const ziplinePrice = ziplineRequested ? ZIPLINE_PRICE_EUR : 0
  return {
    accommodationPrice,
    ziplinePrice,
    totalPrice: accommodationPrice + ziplinePrice,
  }
}

function getRegistrationTotalPriceForMember({ accommodation, ziplineRequested, isChild, childSharesParentChozo }) {
  const usesChildChozoPrice =
    Boolean(isChild) && Boolean(childSharesParentChozo) && String(accommodation) === 'chozos'
  const accommodationPrice = usesChildChozoPrice ? 100 : getAccommodationPriceEur(accommodation)
  const ziplinePrice = ziplineRequested ? ZIPLINE_PRICE_EUR : 0
  return {
    accommodationPrice,
    ziplinePrice,
    totalPrice: accommodationPrice + ziplinePrice,
  }
}

function familyRoleLabel(role) {
  if (role === 'holder') return 'Titular'
  if (role === 'partner') return 'Pareja'
  if (role === 'child') return 'Hijo/a'
  return 'Asistente'
}

function formatAttendeeNumber(value) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return String(n).padStart(4, '0')
}

export function buildRegistrationCreatedEmail({
  fullName,
  accommodation,
  ziplineRequested,
  tempAttendeeNumber,
  familyMembers = [],
  familyDataIncomplete = false,
}) {
  const normalizedName = String(fullName || '').trim()
  const greeting = normalizedName
    ? `<p>Hola, <strong>${escapeHtml(normalizedName)}</strong>:</p>`
    : '<p>Hola:</p>'
  const { accommodationPrice, ziplinePrice, totalPrice } = getRegistrationTotalPriceEur({
    accommodation,
    ziplineRequested: Boolean(ziplineRequested),
  })
  const accommodationLabel = ACCOMMODATION_LABELS[accommodation] || 'Sin definir'
  const formattedTempNumber = formatAttendeeNumber(tempAttendeeNumber)
  const familyRows = Array.isArray(familyMembers)
    ? familyMembers
        .map((member) => {
          const role = familyRoleLabel(member?.family_role)
          const memberName = String(member?.full_name || '').trim()
          const pricing = getRegistrationTotalPriceForMember({
            accommodation: member?.accommodation,
            ziplineRequested: Boolean(member?.zipline_requested),
            isChild: member?.family_role === 'child' || Boolean(member?.is_minor),
            childSharesParentChozo: Boolean(member?.child_shares_parent_chozo),
          })
          const memberAccommodationLabel =
            ACCOMMODATION_LABELS[String(member?.accommodation || '').trim()] || 'Sin definir'
          const memberTempNumber = formatAttendeeNumber(member?.temp_attendee_number)
          return {
            role,
            name: memberName || 'Sin nombre',
            accommodationLabel: memberAccommodationLabel,
            ziplineRequested: Boolean(member?.zipline_requested),
            accommodationPrice: pricing.accommodationPrice,
            ziplinePrice: pricing.ziplinePrice,
            total: pricing.totalPrice,
            tempNumber: memberTempNumber ? `T-${memberTempNumber}` : 'Pendiente de asignación',
          }
        })
        .filter((row) => row.name)
    : []
  const familyAccommodationTotal = familyRows.reduce((sum, row) => sum + row.accommodationPrice, 0)
  const familyZiplineTotal = familyRows.reduce((sum, row) => sum + row.ziplinePrice, 0)
  const familyTotal = familyRows.reduce((sum, row) => sum + row.total, 0)
  const hasFamilyBreakdown = familyRows.length > 1
  const familyProcessingHtml =
    familyDataIncomplete && hasFamilyBreakdown === false
      ? `<p style="padding:12px;border:1px solid #f59e0b;border-radius:8px;background:#fffbeb;">
          Estamos terminando de consolidar los datos de tu grupo familiar. Si falta algún miembro en este correo,
          te lo confirmaremos en una comunicación de seguimiento.
        </p>`
      : ''
  const familyBreakdownHtml =
    hasFamilyBreakdown
      ? `
      <p><strong>Desglose familiar:</strong></p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr>
            <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Persona</th>
            <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Alojamiento</th>
            <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Tirolina</th>
            <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Subtotal</th>
            <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Nº temporal</th>
          </tr>
        </thead>
        <tbody>
        ${familyRows
          .map(
            (row) =>
              `<tr>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                  <strong>${escapeHtml(row.role)}</strong><br/>
                  ${escapeHtml(row.name)}
                </td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                  ${escapeHtml(row.accommodationLabel)}<br/>
                  <span style="color:#6b7280;">${row.accommodationPrice}€</span>
                </td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
                  ${row.ziplineRequested ? 'Sí' : 'No'}<br/>
                  <span style="color:#6b7280;">${row.ziplinePrice}€</span>
                </td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;"><strong>${row.total}€</strong></td>
                <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(row.tempNumber)}</td>
              </tr>`,
          )
          .join('')}
        </tbody>
      </table>
      <p><strong>Resumen familiar:</strong></p>
      <ul>
        <li>Total alojamiento familiar: <strong>${familyAccommodationTotal}€</strong></li>
        <li>Total extras (tirolina): <strong>${familyZiplineTotal}€</strong></li>
        <li>Total final familiar a abonar: <strong>${familyTotal}€</strong></li>
      </ul>
    `
      : ''

  return {
    subject: 'Confirmación de inscripción - Retiro Lúdico Castilla y Dragón',
    html: buildLayout({
      title: 'Inscripción recibida',
      introHtml: greeting,
      bodyHtml: `
        <p>Hemos recibido correctamente tu inscripción al <strong>Retiro Lúdico Castilla y Dragón</strong>.</p>
        <p><strong>Resumen económico:</strong></p>
        <ul>
          <li>Alojamiento (${escapeHtml(accommodationLabel)}): <strong>${accommodationPrice}€</strong></li>
          <li>Tirolina: <strong>${ziplinePrice}€</strong></li>
          <li>Importe total: <strong>${totalPrice}€</strong></li>
        </ul>
        ${familyProcessingHtml}
        ${familyBreakdownHtml}
        <p><strong>IBAN para el pago:</strong> ${escapeHtml(PAYMENT_IBAN)}</p>
        ${
          formattedTempNumber
            ? `<p><strong>Número temporal de asistente:</strong> T-${escapeHtml(formattedTempNumber)}</p>`
            : ''
        }
        <p>Guarda este correo como confirmación. Si necesitas corregir algún dato, responde a este mensaje.</p>
      `,
      footerHtml: '<p>- El equipo del retiro</p>',
    }),
  }
}

export function buildRegistrationUpdatedEmail({ fullName, changes }) {
  const normalizedName = String(fullName || '').trim()
  const greeting = normalizedName
    ? `<p>Hola, <strong>${escapeHtml(normalizedName)}</strong>:</p>`
    : '<p>Hola:</p>'

  const rows = changes
    .map((change) => {
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;"><strong>${escapeHtml(change.label)}</strong></td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;color:#6b7280;">${escapeHtml(change.previous)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(change.current)}</td>
      </tr>`
    })
    .join('')

  return {
    subject: 'Actualización de tu inscripción - Retiro Lúdico Castilla y Dragón',
    html: buildLayout({
      title: 'Inscripción actualizada',
      introHtml: greeting,
      bodyHtml: `
        <p>Hemos actualizado tu inscripción. Estos son los cambios registrados:</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr>
              <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Campo</th>
              <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Antes</th>
              <th align="left" style="padding:10px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">Ahora</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="3" style="padding:10px;">No se detectaron cambios relevantes.</td></tr>'}
          </tbody>
        </table>
      `,
      footerHtml:
        '<p>Si no reconoces esta modificación, responde a este correo para revisarlo.</p><p>- El equipo del retiro</p>',
    }),
  }
}

export function buildPaymentReminderEmail({ fullName }) {
  const normalizedName = String(fullName || '').trim()
  const greeting = normalizedName
    ? `<p>Hola, <strong>${escapeHtml(normalizedName)}</strong>:</p>`
    : '<p>Hola:</p>'

  return {
    subject: 'Recordatorio de pago pendiente - Retiro Lúdico Castilla y Dragón',
    html: buildLayout({
      title: 'Pago pendiente para confirmar tu plaza',
      introHtml: greeting,
      bodyHtml: `
        <p>Tu inscripción está registrada, pero todavía no consta el pago de la reserva de plaza.</p>
        <p><strong>IBAN para el pago:</strong> ${escapeHtml(PAYMENT_IBAN)}</p>
        <p>Para garantizar tu asistencia, realiza el pago cuanto antes y responde a este correo si necesitas ayuda.</p>
      `,
      footerHtml: '<p>Gracias por tu interés.<br/>- El equipo del retiro</p>',
    }),
  }
}

export function buildPaymentConfirmedEmail({ fullName, attendeeNumber, familyMembers = [] }) {
  const normalizedName = String(fullName || '').trim()
  const greeting = normalizedName
    ? `<p>Hola, <strong>${escapeHtml(normalizedName)}</strong>:</p>`
    : '<p>Hola:</p>'
  const formattedAttendeeNumber = formatAttendeeNumber(attendeeNumber)

  const familyRows = Array.isArray(familyMembers)
    ? familyMembers
        .map((member) => {
          const role = familyRoleLabel(member?.family_role)
          const memberName = String(member?.full_name || '').trim() || 'Sin nombre'
          const definitiveNumber = formatAttendeeNumber(member?.attendee_number)
          return {
            role,
            name: memberName,
            definitiveLabel: definitiveNumber ? `A-${definitiveNumber}` : 'Pendiente de asignación',
          }
        })
        .filter((row) => row.name)
    : []

  const familyNumbersHtml =
    familyRows.length > 1
      ? `
      <p><strong>Números definitivos del grupo familiar:</strong></p>
      <ul>
        ${familyRows
          .map(
            (row) =>
              `<li>${escapeHtml(row.role)} - ${escapeHtml(row.name)}: <strong>${escapeHtml(row.definitiveLabel)}</strong></li>`,
          )
          .join('')}
      </ul>
    `
      : ''

  return {
    subject: 'Pago confirmado y número definitivo - Retiro Lúdico Castilla y Dragón',
    html: buildLayout({
      title: 'Pago confirmado',
      introHtml: greeting,
      bodyHtml: `
        <p>Hemos confirmado correctamente tu pago de alojamiento.</p>
        <p><strong>Tu número definitivo de asistente:</strong>
        ${
          formattedAttendeeNumber
            ? `<strong>A-${escapeHtml(formattedAttendeeNumber)}</strong>`
            : 'Pendiente de asignación'
        }</p>
        ${familyNumbersHtml}
        <p>Guarda este correo para identificarte en el evento.</p>
      `,
      footerHtml: '<p>- El equipo del retiro</p>',
    }),
  }
}

export function detectRegistrationChanges(currentRecord, previousRecord) {
  if (!currentRecord || !previousRecord) {
    return []
  }

  return Object.keys(FIELD_LABELS)
    .filter((field) => currentRecord[field] !== previousRecord[field])
    .map((field) => ({
      field,
      label: FIELD_LABELS[field] || field,
      previous: formatValue(field, previousRecord[field]),
      current: formatValue(field, currentRecord[field]),
    }))
}
