/**
 * Configuración de columnas del panel de asistentes.
 *
 * Para añadir una columna nueva:
 * 1. Añade una entrada aquí (orden = orden por defecto).
 * 2. Implementa el valor en getRegistrationColumnValue (adminRegistrationFormatters.js).
 * 3. Si necesita render especial en tabla, añade el case en AdminRegistrationsTab.vue.
 *
 * Visibilidad y orden personalizados se guardan en localStorage.
 */

import { createAdminTableColumnConfig } from '@/utils/adminTableColumns'

export const REGISTRATIONS_COLUMNS_STORAGE_KEY = 'admin-registrations-columns-v1'

/** @typedef {'start' | 'end'} ColumnPin */

/**
 * @typedef {Object} RegistrationColumnDefinition
 * @property {string} id
 * @property {string} label
 * @property {boolean} [defaultVisible=true]
 * @property {boolean} [alwaysVisible=false]
 * @property {ColumnPin} [pinned]
 * @property {boolean} [exportable=true]
 * @property {boolean} [tableOnly=false]
 * @property {number} [excelWidth=16]
 * @property {string} [tableWidth]
 * @property {'text' | 'boolean-badge' | 'select' | 'actions'} [cellType='text']
 * @property {boolean} [sortable]
 * @property {'server' | 'client'} [sortMode='server']
 * @property {string} [sortKey]
 */

/** @type {RegistrationColumnDefinition[]} */
export const REGISTRATION_COLUMN_DEFINITIONS = [
  {
    id: 'select',
    label: 'Seleccionar',
    alwaysVisible: true,
    pinned: 'start',
    tableOnly: true,
    exportable: false,
    tableWidth: '3rem',
    cellType: 'select',
  },
  {
    id: 'attendee_number',
    label: 'Nº asistente',
    defaultVisible: true,
    excelWidth: 14,
    tableWidth: '5.5rem',
  },
  {
    id: 'family_group',
    label: 'Grupo',
    defaultVisible: true,
    excelWidth: 16,
    tableWidth: '5rem',
    sortKey: 'family_group_id',
  },
  {
    id: 'family_role',
    label: 'Rol',
    defaultVisible: true,
    excelWidth: 14,
    tableWidth: '5rem',
  },
  {
    id: 'full_name',
    label: 'Nombre',
    defaultVisible: true,
    excelWidth: 30,
    tableWidth: '11rem',
  },
  {
    id: 'nickname',
    label: 'Mote/Alias',
    defaultVisible: false,
    excelWidth: 15,
    tableWidth: '8rem',
  },
  {
    id: 'email',
    label: 'Email',
    defaultVisible: true,
    excelWidth: 25,
    tableWidth: '12rem',
  },
  {
    id: 'phone',
    label: 'Teléfono',
    defaultVisible: true,
    excelWidth: 15,
    tableWidth: '8rem',
  },
  {
    id: 'birth_date',
    label: 'Fecha de nacimiento',
    defaultVisible: false,
    excelWidth: 18,
    tableWidth: '9rem',
  },
  {
    id: 'is_minor',
    label: 'Es menor',
    defaultVisible: false,
    excelWidth: 10,
    tableWidth: '5rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'emergency_contact_name',
    label: 'Contacto emergencia (nombre)',
    defaultVisible: false,
    excelWidth: 25,
    tableWidth: '10rem',
  },
  {
    id: 'emergency_contact_phone',
    label: 'Contacto emergencia (teléfono)',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
  },
  {
    id: 'arrival_date',
    label: 'Fecha llegada',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
  },
  {
    id: 'departure_date',
    label: 'Fecha salida',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
  },
  {
    id: 'accommodation',
    label: 'Alojamiento',
    defaultVisible: true,
    excelWidth: 30,
    tableWidth: '10rem',
  },
  {
    id: 'total_amount',
    label: 'Importe total',
    defaultVisible: true,
    excelWidth: 14,
    tableWidth: '7rem',
    sortMode: 'client',
  },
  {
    id: 'accommodation_paid',
    label: 'Pagado',
    defaultVisible: true,
    excelWidth: 18,
    tableWidth: '5.5rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'last_payment_reminder',
    label: 'Último recordatorio',
    defaultVisible: true,
    excelWidth: 22,
    tableWidth: '10rem',
    sortKey: 'last_payment_reminder_sent_at',
  },
  {
    id: 'zipline_requested',
    label: 'Tirolina',
    defaultVisible: true,
    excelWidth: 12,
    tableWidth: '5.5rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'zipline_paid',
    label: 'Tirolina pagada',
    defaultVisible: true,
    excelWidth: 16,
    tableWidth: '6.5rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'diet',
    label: 'Restricciones alimentarias',
    defaultVisible: false,
    excelWidth: 25,
    tableWidth: '12rem',
    sortMode: 'client',
  },
  {
    id: 'comments',
    label: 'Comentarios',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
  },
  {
    id: 'diet_comments',
    label: 'Comentarios dieta',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '10rem',
  },
  {
    id: 'terms_accepted',
    label: 'Términos aceptados',
    defaultVisible: false,
    excelWidth: 18,
    tableWidth: '6rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'image_consent_accepted',
    label: 'Consentimiento imagen',
    defaultVisible: false,
    excelWidth: 26,
    tableWidth: '8rem',
    cellType: 'boolean-badge',
  },
  {
    id: 'created_at',
    label: 'Fecha registro',
    defaultVisible: true,
    excelWidth: 20,
    tableWidth: '9rem',
  },
  {
    id: 'updated_at',
    label: 'Última actualización',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
  },
  {
    id: 'actions',
    label: 'Acciones',
    alwaysVisible: true,
    pinned: 'end',
    tableOnly: true,
    exportable: false,
    tableWidth: '8rem',
    cellType: 'actions',
  },
]

const registrationColumns = createAdminTableColumnConfig(
  REGISTRATION_COLUMN_DEFINITIONS,
  REGISTRATIONS_COLUMNS_STORAGE_KEY,
)

export const getRegistrationColumnDefinition = registrationColumns.getColumnDefinition
export const getConfigurableRegistrationColumns = registrationColumns.getConfigurableColumns
export const getDefaultColumnPreferences = registrationColumns.getDefaultColumnPreferences
export const loadColumnPreferences = registrationColumns.loadColumnPreferences
export const saveColumnPreferences = registrationColumns.saveColumnPreferences
export const resolveTableColumns = registrationColumns.resolveTableColumns
export const resolveExportColumns = registrationColumns.resolveExportColumns
export const getColumnTableStyle = registrationColumns.getColumnTableStyle

export function getDefaultRegistrationSortState() {
  return {
    columnId: 'accommodation_paid',
    direction: 'asc',
    secondary: [{ columnId: 'created_at', direction: 'asc' }],
  }
}
