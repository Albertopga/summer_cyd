/**
 * Configuración de columnas del panel de actividades.
 *
 * Para añadir una columna nueva:
 * 1. Añade una entrada en ACTIVITY_COLUMN_DEFINITIONS.
 * 2. Implementa el valor en adminActivityFormatters.js.
 * 3. Si necesita render especial en tabla, añade el case en AdminActivitiesTab.vue.
 */

import { createAdminTableColumnConfig } from '@/utils/adminTableColumns'

export const ACTIVITIES_COLUMNS_STORAGE_KEY = 'admin-activities-columns-v1'

/** @type {Array<import('@/utils/adminTableSort').AdminTableColumnSortConfig & {
 *   label: string,
 *   defaultVisible?: boolean,
 *   alwaysVisible?: boolean,
 *   pinned?: 'start' | 'end',
 *   exportable?: boolean,
 *   tableOnly?: boolean,
 *   excelWidth?: number,
 *   tableWidth?: string,
 *   cellType?: 'text' | 'status-badge' | 'actions',
 *   headerTitle?: string,
 * }>} */
export const ACTIVITY_COLUMN_DEFINITIONS = [
  {
    id: 'organizer_name',
    label: 'Organizador',
    defaultVisible: true,
    excelWidth: 20,
    tableWidth: '9rem',
    sortKey: 'organizer_name',
  },
  {
    id: 'organizer_email',
    label: 'Email',
    defaultVisible: true,
    excelWidth: 25,
    tableWidth: '11rem',
    sortKey: 'organizer_email',
  },
  {
    id: 'type',
    label: 'Tipo',
    defaultVisible: true,
    excelWidth: 15,
    tableWidth: '7rem',
    sortKey: 'type',
  },
  {
    id: 'name',
    label: 'Nombre',
    defaultVisible: true,
    excelWidth: 25,
    tableWidth: '11rem',
    sortKey: 'name',
  },
  {
    id: 'description',
    label: 'Descripción',
    defaultVisible: false,
    excelWidth: 40,
    tableWidth: '14rem',
    sortKey: 'description',
  },
  {
    id: 'participants',
    label: 'Participantes',
    defaultVisible: true,
    excelWidth: 14,
    tableWidth: '7rem',
    sortMode: 'client',
  },
  {
    id: 'min_participants',
    label: 'Mín. participantes',
    defaultVisible: false,
    excelWidth: 15,
    tableWidth: '6rem',
    sortKey: 'min_participants',
  },
  {
    id: 'max_participants',
    label: 'Máx. participantes',
    defaultVisible: false,
    excelWidth: 15,
    tableWidth: '6rem',
    sortKey: 'max_participants',
  },
  {
    id: 'activity_date',
    label: 'Fecha actividad',
    defaultVisible: true,
    excelWidth: 16,
    tableWidth: '8rem',
    sortKey: 'activity_date',
  },
  {
    id: 'activity_time',
    label: 'Hora actividad',
    defaultVisible: true,
    excelWidth: 12,
    tableWidth: '6rem',
    sortKey: 'activity_time',
  },
  {
    id: 'preferred_time_slot',
    label: 'Preferencia',
    defaultVisible: true,
    excelWidth: 25,
    tableWidth: '11rem',
    sortKey: 'preferred_time_slot',
    headerTitle: 'Preferencia (día/franja). El horario final lo asigna la organización',
  },
  {
    id: 'duration',
    label: 'Duración',
    defaultVisible: false,
    excelWidth: 15,
    tableWidth: '7rem',
    sortKey: 'duration',
  },
  {
    id: 'participant_needs',
    label: 'Necesidades participantes',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
    sortKey: 'participant_needs',
  },
  {
    id: 'organization_needs',
    label: 'Necesidades organización',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
    sortKey: 'organization_needs',
  },
  {
    id: 'space_need',
    label: 'Necesidad espacio',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '10rem',
    sortKey: 'space_need',
  },
  {
    id: 'setup',
    label: 'Puesta en marcha',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
    sortKey: 'setup',
  },
  {
    id: 'observations',
    label: 'Observaciones',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
    sortKey: 'observations',
  },
  {
    id: 'status',
    label: 'Estado',
    defaultVisible: true,
    excelWidth: 15,
    tableWidth: '7rem',
    sortKey: 'status',
    cellType: 'status-badge',
  },
  {
    id: 'approved_by',
    label: 'Aprobado por',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
    sortKey: 'approved_by',
  },
  {
    id: 'approval_notes',
    label: 'Notas aprobación',
    defaultVisible: false,
    excelWidth: 30,
    tableWidth: '12rem',
    sortKey: 'approval_notes',
  },
  {
    id: 'documents',
    label: 'Documentos',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '8rem',
    sortMode: 'client',
  },
  {
    id: 'created_at',
    label: 'Fecha registro',
    defaultVisible: true,
    excelWidth: 20,
    tableWidth: '9rem',
    sortKey: 'created_at',
  },
  {
    id: 'updated_at',
    label: 'Última actualización',
    defaultVisible: false,
    excelWidth: 20,
    tableWidth: '9rem',
    sortKey: 'updated_at',
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

const activityColumns = createAdminTableColumnConfig(
  ACTIVITY_COLUMN_DEFINITIONS,
  ACTIVITIES_COLUMNS_STORAGE_KEY,
)

export const getActivityColumnDefinition = activityColumns.getColumnDefinition
export const getConfigurableActivityColumns = activityColumns.getConfigurableColumns
export const getDefaultActivityColumnPreferences = activityColumns.getDefaultColumnPreferences
export const loadActivityColumnPreferences = activityColumns.loadColumnPreferences
export const saveActivityColumnPreferences = activityColumns.saveColumnPreferences
export const resolveActivityTableColumns = activityColumns.resolveTableColumns
export const resolveActivityExportColumns = activityColumns.resolveExportColumns
export const getActivityColumnTableStyle = activityColumns.getColumnTableStyle

export function getDefaultActivitySortState() {
  return {
    columnId: 'created_at',
    direction: 'desc',
    secondary: [],
  }
}
