<template>
  <div class="admin-tab-content">
    <div v-if="loading" class="loading-message" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      Cargando registros...
    </div>

    <div v-else-if="error" class="error-message" role="alert">
      {{ error }}
    </div>

    <div v-else class="registrations-list">
      <div class="list-header">
        <h2>Registros de asistentes ({{ totalRegistrations }})</h2>
        <div class="controls-group">
          <button
            v-if="showPaymentReminderAndResetButtons"
            type="button"
            @click="handleSendPaymentReminders"
            class="reminder-button"
            :disabled="loading || isSendingReminders"
            aria-label="Enviar recordatorios de pago pendientes"
          >
            <span v-if="!isSendingReminders">Enviar recordatorios de pago</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Enviando recordatorios...
            </span>
          </button>
          <button
            v-if="showPaymentReminderAndResetButtons"
            type="button"
            @click="handleResetAttendeeNumbers"
            class="reset-attendees-button"
            :disabled="loading"
            aria-label="Reiniciar numeración de asistentes"
          >
            Reiniciar nº asistentes
          </button>
          <div class="column-settings">
            <button
              type="button"
              class="columns-button"
              :aria-expanded="showColumnPanel ? 'true' : 'false'"
              aria-controls="column-settings-panel"
              @click="showColumnPanel = !showColumnPanel"
            >
              Columnas
            </button>
            <div
              v-if="showColumnPanel"
              id="column-settings-panel"
              class="column-panel"
              role="region"
              aria-label="Configuración de columnas"
            >
              <p class="column-panel-intro">
                El orden y la visibilidad se aplican a la tabla y al Excel descargado.
              </p>
              <ul class="column-list">
                <li v-for="column in columnSelectorItems" :key="column.id" class="column-list-item">
                  <label class="column-visibility">
                    <input
                      type="checkbox"
                      :checked="isColumnVisible(column.id)"
                      @change="toggleColumnVisibility(column.id, $event.target.checked)"
                    />
                    <span>{{ column.label }}</span>
                  </label>
                  <div class="column-order-actions">
                    <button
                      type="button"
                      class="column-order-button"
                      :disabled="isColumnMoveDisabled(column.id, -1)"
                      :aria-label="`Subir columna ${column.label}`"
                      @click="moveColumn(column.id, -1)"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="column-order-button"
                      :disabled="isColumnMoveDisabled(column.id, 1)"
                      :aria-label="`Bajar columna ${column.label}`"
                      @click="moveColumn(column.id, 1)"
                    >
                      ↓
                    </button>
                  </div>
                </li>
              </ul>
              <button type="button" class="column-reset-button" @click="resetColumnPreferences">
                Restaurar columnas predeterminadas
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="handleDownloadExcel"
            class="download-button"
            :disabled="loading"
            aria-label="Descargar registros en Excel"
          >
            Descargar Excel
          </button>
          <button
            type="button"
            @click="handleDeleteSelected"
            class="delete-selected-button"
            :disabled="selectedCount === 0 || isDeleting"
            :aria-label="`Borrar ${selectedCount} registros seleccionados`"
          >
            Borrar seleccionados ({{ selectedCount }})
          </button>
        </div>
      </div>

      <p
        v-if="remindersFeedback.message"
        class="reminder-feedback"
        :class="{
          'reminder-feedback--success': remindersFeedback.type === 'success',
          'reminder-feedback--error': remindersFeedback.type === 'error',
        }"
        :role="remindersFeedback.type === 'error' ? 'alert' : 'status'"
        aria-live="polite"
      >
        {{ remindersFeedback.message }}
      </p>

      <div v-if="registrations.length === 0" class="empty-state" role="status">
        No hay registros disponibles
      </div>

      <div v-else class="admin-table-wrapper">
        <table class="admin-table" aria-label="Lista de registros de asistentes">
          <colgroup>
            <col
              v-for="column in tableColumns"
              :key="`col-${column.id}`"
              :style="getColumnTableStyle(column)"
            />
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.id"
                scope="col"
                :class="{
                  'checkbox-column': column.id === 'select',
                  'sortable-column': isColumnSortable(column),
                }"
                :style="getColumnTableStyle(column)"
                :title="column.label"
                :aria-sort="isColumnSortable(column) ? getColumnAriaSort(column.id) : undefined"
              >
                <template v-if="column.id === 'select'">
                  <label for="select-all" class="sr-only">Seleccionar todos los registros</label>
                  <input
                    id="select-all"
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="handleSelectAll"
                    aria-label="Seleccionar todos los registros"
                  />
                </template>
                <button
                  v-else-if="isColumnSortable(column)"
                  type="button"
                  class="sortable-header-button"
                  :aria-label="getColumnSortLabel(column)"
                  @click="handleColumnSort(column.id)"
                >
                  <span>{{ column.label }}</span>
                  <span
                    class="sort-indicator"
                    :class="{ 'sort-indicator--active': getColumnSortIndicator(column.id) }"
                    aria-hidden="true"
                  >
                    {{ getColumnSortIndicator(column.id) || '↕' }}
                  </span>
                </button>
                <template v-else>{{ column.label }}</template>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in registrations" :key="registration.id">
              <td
                v-for="column in tableColumns"
                :key="`${registration.id}-${column.id}`"
                :data-label="column.label"
                :class="{ 'checkbox-column': column.id === 'select' }"
                :style="getColumnTableStyle(column)"
              >
                <template v-if="column.id === 'select'">
                  <label :for="`select-${registration.id}`" class="sr-only">
                    Seleccionar registro de {{ getRegistrationFullName(registration) }}
                  </label>
                  <input
                    :id="`select-${registration.id}`"
                    type="checkbox"
                    :checked="selectedRegistrations.has(registration.id)"
                    @change="handleSelectRegistration(registration.id, $event.target.checked)"
                    :aria-label="`Seleccionar registro de ${getRegistrationFullName(registration)}`"
                  />
                </template>

                <template v-else-if="column.id === 'actions'">
                  <button
                    type="button"
                    @click="openEditModal(registration)"
                    class="edit-button"
                    :aria-label="`Editar registro de ${getRegistrationFullName(registration)}`"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    @click="handleDeleteOne(registration.id)"
                    class="delete-icon-button"
                    :disabled="isDeleting"
                    :aria-label="`Eliminar registro de ${getRegistrationFullName(registration)}`"
                    title="Eliminar registro"
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </template>

                <template v-else-if="column.cellType === 'boolean-badge'">
                  <span
                    class="payment-status"
                    :class="
                      getColumnBooleanValue(column.id, registration)
                        ? 'payment-status--paid'
                        : 'payment-status--unpaid'
                    "
                    :aria-label="getColumnBooleanAriaLabel(column.id, registration)"
                  >
                    {{ getColumnBooleanValue(column.id, registration) ? 'Sí' : 'No' }}
                  </span>
                </template>

                <template v-else>
                  {{ getRegistrationColumnValue(column.id, registration) }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminEditModal
      v-if="selectedRegistration"
      :registration="selectedRegistration"
      @close="closeEditModal"
      @saved="handleRegistrationUpdated"
    />

    <div
      v-if="registrationsToDelete.length > 0"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      @click.self="closeDeleteModal"
      @keydown.esc="closeDeleteModal"
    >
      <div class="modal-content delete-modal">
        <header class="modal-header">
          <h2 id="delete-modal-title">Confirmar eliminación</h2>
          <button
            type="button"
            @click="closeDeleteModal"
            class="close-button"
            aria-label="Cerrar modal"
            :disabled="isDeleting"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="modal-body">
          <p v-if="registrationsToDelete.length === 1">
            Vas a eliminar 1 registro de asistente. Esta acción no se puede deshacer.
          </p>
          <p v-else>
            Vas a eliminar {{ registrationsToDelete.length }} registros de asistentes. Esta acción
            no se puede deshacer.
          </p>
        </div>
        <footer class="modal-footer">
          <button
            type="button"
            @click="closeDeleteModal"
            class="cancel-button"
            :disabled="isDeleting"
          >
            Cancelar
          </button>
          <button type="button" @click="executeDelete" class="delete-button" :disabled="isDeleting">
            <span v-if="!isDeleting">Eliminar</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Eliminando...
            </span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  deleteRegistration,
  deleteRegistrationsBulk,
  getAllRegistrations,
  resetAttendeeNumbers,
  triggerPaymentReminders,
} from '@/services/adminService'
import {
  getConfigurableRegistrationColumns,
  getColumnTableStyle,
  getDefaultColumnPreferences,
  getDefaultRegistrationSortState,
  getRegistrationColumnDefinition,
  loadColumnPreferences,
  REGISTRATION_COLUMN_DEFINITIONS,
  resolveExportColumns,
  resolveTableColumns,
  saveColumnPreferences,
} from '@/config/adminRegistrationsColumns'
import {
  getRegistrationColumnValue,
  getRegistrationFullName,
  getRegistrationSortValue,
} from '@/utils/adminRegistrationFormatters'
import { useAdminTableSort } from '@/composables/useAdminTableSort'
import AdminEditModal from '@/components/AdminEditModal.vue'
import ExcelJS from 'exceljs'

defineOptions({
  name: 'AdminRegistrationsTab',
})

const emit = defineEmits(['update-count'])

const loading = ref(false)
const error = ref('')
const registrations = ref([])
const totalRegistrations = ref(0)
const selectedRegistration = ref(null)
const selectedRegistrations = ref(new Set())
const allRegistrations = ref([])
const registrationsToDelete = ref([])
const isDeleting = ref(false)
const isSendingReminders = ref(false)
const remindersFeedback = ref({ type: '', message: '' })
const showPaymentReminderAndResetButtons = false
const showColumnPanel = ref(false)

const columnPreferences = ref(loadColumnPreferences())
const configurableColumns = computed(() => {
  const order = columnPreferences.value.order
  return order
    .map((id) => getConfigurableRegistrationColumns().find((col) => col.id === id))
    .filter(Boolean)
})

const columnSelectorItems = computed(() =>
  [...configurableColumns.value].sort((left, right) =>
    left.label.localeCompare(right.label, 'es', { sensitivity: 'base' }),
  ),
)

const isColumnMoveDisabled = (columnId, direction) => {
  const order = columnPreferences.value.order
  const index = order.indexOf(columnId)
  if (index < 0) return true
  if (direction < 0) return index === 0
  return index === order.length - 1
}

const tableColumns = computed(() => resolveTableColumns(columnPreferences.value))
const exportColumns = computed(() => resolveExportColumns(columnPreferences.value))

const {
  handleHeaderSort,
  resolveFetchSort,
  applySortToRows,
  isColumnSortable,
  getColumnAriaSort,
  getColumnSortIndicator,
  getColumnSortLabel,
} = useAdminTableSort({
  columns: REGISTRATION_COLUMN_DEFINITIONS,
  getColumnDefinition: getRegistrationColumnDefinition,
  getClientSortValue: getRegistrationSortValue,
  defaultSort: getDefaultRegistrationSortState(),
})

const getRegistrationFetchSort = () => {
  const fetchSort = resolveFetchSort()
  if (fetchSort) {
    return {
      orderBy: fetchSort.orderBy,
      ascending: fetchSort.ascending,
    }
  }
  return {
    orderBy: 'created_at',
    ascending: false,
  }
}

const handleColumnSort = (columnId) => {
  handleHeaderSort(columnId)
  loadRegistrations()
}

const persistColumnPreferences = () => {
  saveColumnPreferences(columnPreferences.value)
}

const isColumnVisible = (columnId) => !columnPreferences.value.hidden.includes(columnId)

const toggleColumnVisibility = (columnId, visible) => {
  const hidden = new Set(columnPreferences.value.hidden)
  if (visible) {
    hidden.delete(columnId)
  } else {
    hidden.add(columnId)
  }
  columnPreferences.value = {
    ...columnPreferences.value,
    hidden: [...hidden],
  }
  persistColumnPreferences()
}

const moveColumn = (columnId, direction) => {
  const order = [...columnPreferences.value.order]
  const index = order.indexOf(columnId)
  const targetIndex = index + direction
  if (index < 0 || targetIndex < 0 || targetIndex >= order.length) return

  const updated = [...order]
  ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
  columnPreferences.value = {
    ...columnPreferences.value,
    order: updated,
  }
  persistColumnPreferences()
}

const resetColumnPreferences = () => {
  columnPreferences.value = getDefaultColumnPreferences()
  persistColumnPreferences()
}

const BOOLEAN_COLUMN_FIELDS = {
  accommodation_paid: {
    field: 'accommodation_paid',
    trueLabel: 'Alojamiento pagado',
    falseLabel: 'Alojamiento no pagado',
  },
  zipline_requested: {
    field: 'zipline_requested',
    trueLabel: 'Tirolina solicitada',
    falseLabel: 'Tirolina no solicitada',
  },
  zipline_paid: {
    field: 'zipline_paid',
    trueLabel: 'Tirolina pagada',
    falseLabel: 'Tirolina no pagada',
  },
  is_minor: {
    field: 'is_minor',
    trueLabel: 'Es menor de edad',
    falseLabel: 'No es menor de edad',
  },
  terms_accepted: {
    field: 'terms_accepted',
    trueLabel: 'Términos aceptados',
    falseLabel: 'Términos no aceptados',
  },
  image_consent_accepted: {
    field: 'image_consent_accepted',
    trueLabel: 'Consentimiento de imagen aceptado',
    falseLabel: 'Consentimiento de imagen no aceptado',
  },
}

const getColumnBooleanValue = (columnId, registration) => {
  const meta = BOOLEAN_COLUMN_FIELDS[columnId]
  if (!meta) return false
  return Boolean(registration?.[meta.field])
}

const getColumnBooleanAriaLabel = (columnId, registration) => {
  const meta = BOOLEAN_COLUMN_FIELDS[columnId]
  if (!meta) return ''
  return getColumnBooleanValue(columnId, registration) ? meta.trueLabel : meta.falseLabel
}

const loadRegistrations = async () => {
  loading.value = true
  error.value = ''

  const { orderBy, ascending } = getRegistrationFetchSort()

  const result = await getAllRegistrations({
    limit: 1000,
    orderBy,
    ascending,
  })

  if (result.success) {
    const rows = applySortToRows(result.data || [])
    registrations.value = rows
    totalRegistrations.value = result.count || 0
    allRegistrations.value = rows
    selectedRegistrations.value.clear()
    emit('update-count', result.count || 0)
  } else {
    error.value = result.error || 'Error al cargar los registros'
  }

  loading.value = false
}

const openEditModal = (registration) => {
  selectedRegistration.value = { ...registration }
}

const closeEditModal = () => {
  selectedRegistration.value = null
}

const handleRegistrationUpdated = () => {
  closeEditModal()
  loadRegistrations()
}

const handleSendPaymentReminders = async () => {
  isSendingReminders.value = true
  remindersFeedback.value = { type: '', message: '' }

  const result = await triggerPaymentReminders()
  isSendingReminders.value = false

  if (!result.success) {
    remindersFeedback.value = {
      type: 'error',
      message: result.error || 'No se pudieron lanzar los recordatorios.',
    }
    return
  }

  if (result.data?.skipped === 'payment_reminders_disabled') {
    remindersFeedback.value = {
      type: 'error',
      message:
        'Los recordatorios de pago están desactivados en el entorno actual (PAYMENT_REMINDER_EMAIL_ENABLED).',
    }
    return
  }

  if (result.data?.skipped === 'confirmation_email_disabled') {
    remindersFeedback.value = {
      type: 'error',
      message: 'El envío de emails está desactivado en el entorno actual.',
    }
    return
  }

  const sent = Number(result.data?.sent || 0)
  const skipped = Number(result.data?.skipped || 0)
  const total = Number(result.data?.total || 0)
  remindersFeedback.value = {
    type: 'success',
    message: `Recordatorios ejecutados. Enviados: ${sent}. Omitidos: ${skipped}. Elegibles: ${total}.`,
  }
}

const handleResetAttendeeNumbers = async () => {
  const password = window.prompt(
    'Introduce la contraseña para reiniciar la numeración de asistentes:',
  )
  if (password == null) return

  remindersFeedback.value = { type: '', message: '' }
  const result = await resetAttendeeNumbers(password)

  if (!result.success) {
    remindersFeedback.value = {
      type: 'error',
      message: result.error || 'No se pudo reiniciar la numeración de asistentes.',
    }
    return
  }

  const reassigned = Number(result.data?.reassigned || 0)
  remindersFeedback.value = {
    type: 'success',
    message: `Numeración reiniciada correctamente. Asistentes renumerados: ${reassigned}.`,
  }
  await loadRegistrations()
}

const openDeleteModal = (ids = []) => {
  const cleanIds = Array.isArray(ids) ? ids.filter(Boolean) : []
  if (cleanIds.length === 0) return
  registrationsToDelete.value = cleanIds
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  registrationsToDelete.value = []
}

const handleDeleteOne = (registrationId) => {
  openDeleteModal([registrationId])
}

const handleDeleteSelected = () => {
  openDeleteModal(Array.from(selectedRegistrations.value))
}

const executeDelete = async () => {
  const ids = [...registrationsToDelete.value]
  if (ids.length === 0) return

  isDeleting.value = true
  error.value = ''

  let result
  if (ids.length === 1) {
    result = await deleteRegistration(ids[0])
  } else {
    result = await deleteRegistrationsBulk(ids)
  }

  isDeleting.value = false

  if (result.success) {
    registrationsToDelete.value = []
    await loadRegistrations()
    return
  }

  if (result.deletedCount > 0) {
    registrationsToDelete.value = []
    await loadRegistrations()
  }

  error.value = result.error || 'No se pudieron eliminar los registros seleccionados'
}

const handleSelectRegistration = (id, checked) => {
  const updatedSelection = new Set(selectedRegistrations.value)
  if (checked) {
    updatedSelection.add(id)
  } else {
    updatedSelection.delete(id)
  }
  selectedRegistrations.value = updatedSelection
}

const handleSelectAll = async (event) => {
  const checked = event.target.checked
  if (checked) {
    if (allRegistrations.value.length < totalRegistrations.value) {
      loading.value = true
      const result = await getAllRegistrations({
        limit: 10000,
        ...getRegistrationFetchSort(),
      })
      if (result.success) {
        allRegistrations.value = applySortToRows(result.data || [])
      }
      loading.value = false
    }
    allRegistrations.value.forEach((reg) => {
      selectedRegistrations.value.add(reg.id)
    })
    selectedRegistrations.value = new Set(selectedRegistrations.value)
  } else {
    selectedRegistrations.value.clear()
    selectedRegistrations.value = new Set()
  }
}

const isAllSelected = computed(() => {
  if (totalRegistrations.value === 0) return false
  return selectedRegistrations.value.size === totalRegistrations.value
})

const isIndeterminate = computed(() => {
  return (
    selectedRegistrations.value.size > 0 &&
    selectedRegistrations.value.size < totalRegistrations.value
  )
})

const selectedCount = computed(() => selectedRegistrations.value.size)

const handleDownloadExcel = async () => {
  try {
    let dataToExport = []

    if (selectedRegistrations.value.size > 0) {
      const selectedIds = Array.from(selectedRegistrations.value)
      if (allRegistrations.value.length < totalRegistrations.value) {
        loading.value = true
        const result = await getAllRegistrations({
          limit: 10000,
          ...getRegistrationFetchSort(),
        })
        if (result.success) {
          allRegistrations.value = applySortToRows(result.data || [])
        }
        loading.value = false
      }
      dataToExport = applySortToRows(
        allRegistrations.value.filter((reg) => selectedIds.includes(reg.id)),
      )
    } else {
      if (allRegistrations.value.length < totalRegistrations.value) {
        loading.value = true
        const result = await getAllRegistrations({
          limit: 10000,
          ...getRegistrationFetchSort(),
        })
        if (result.success) {
          allRegistrations.value = applySortToRows(result.data || [])
        }
        loading.value = false
      }
      dataToExport = applySortToRows(allRegistrations.value)
    }

    const columns = exportColumns.value
    if (columns.length === 0) {
      error.value = 'Selecciona al menos una columna exportable para descargar el Excel.'
      return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Registros')

    worksheet.columns = columns.map((column) => ({
      header: column.label,
      key: column.id,
      width: column.excelWidth ?? 16,
    }))

    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A4D2E' },
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    dataToExport.forEach((registration) => {
      const row = {}
      columns.forEach((column) => {
        row[column.id] = getRegistrationColumnValue(column.id, registration)
      })
      worksheet.addRow(row)
    })

    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `registros_${dateStr}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al exportar a Excel:', err)
    error.value = 'Error al exportar los registros a Excel'
  }
}

onMounted(() => {
  loadRegistrations()
})

defineExpose({
  loadRegistrations,
})
</script>

<style scoped>
.delete-selected-button,
.reminder-button,
.reset-attendees-button {
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
}

.reminder-button {
  background-color: #7a3e00;
  color: var(--color-white);
}

.reminder-button:hover:not(:disabled) {
  background-color: #5c2f00;
}

.reminder-button:focus-visible {
  outline: 3px solid #7a3e00;
  outline-offset: 2px;
}

.reminder-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-attendees-button {
  background-color: #6b1d1d;
  color: var(--color-white);
}

.reset-attendees-button:hover:not(:disabled) {
  background-color: #4f1515;
}

.reset-attendees-button:focus-visible {
  outline: 3px solid #6b1d1d;
  outline-offset: 2px;
}

.reset-attendees-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reminder-feedback {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}

.reminder-feedback--success {
  background-color: #e6f4ea;
  color: #1f6f43;
}

.reminder-feedback--error {
  background-color: #fce8e6;
  color: #b42318;
}

.delete-selected-button {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.delete-selected-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.delete-selected-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.delete-selected-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-column {
  width: 3rem;
  text-align: center;
}

.checkbox-column input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-accent);
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid var(--color-accent);
  border-radius: 3px;
  background-color: var(--color-white);
  position: relative;
  flex-shrink: 0;
}

.checkbox-column input[type='checkbox']:checked {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.checkbox-column input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.4rem;
  height: 0.7rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}

.checkbox-column input[type='checkbox']:indeterminate {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.checkbox-column input[type='checkbox']:indeterminate::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.6rem;
  height: 2px;
  background-color: white;
  transform: translate(-50%, -50%);
}

.checkbox-column input[type='checkbox']:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 3px;
}

.payment-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
}

.payment-status--paid {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.payment-status--unpaid {
  background-color: #fce8e6;
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .delete-selected-button {
    width: 100%;
  }

  .checkbox-column {
    width: auto;
    text-align: left;
  }
}
</style>
