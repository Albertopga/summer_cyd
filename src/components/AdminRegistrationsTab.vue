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
          <div class="sort-controls">
            <label for="sort-field" class="sr-only">Ordenar por</label>
            <select
              id="sort-field"
              v-model="sortField"
              @change="handleSortChange"
              class="sort-select"
            >
              <option value="accommodation_paid,created_at">Estado pago → Fecha registro</option>
              <option value="created_at">Fecha registro</option>
              <option value="accommodation_paid">Estado pago</option>
              <option value="full_name">Nombre</option>
              <option value="email">Email</option>
              <option value="accommodation">Alojamiento</option>
            </select>
            <label for="sort-direction" class="sr-only">Dirección del orden</label>
            <select
              id="sort-direction"
              v-model="sortDirection"
              @change="handleSortChange"
              class="sort-select"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
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

      <div v-else class="registrations-table-wrapper">
        <table class="registrations-table" aria-label="Lista de registros de asistentes">
          <thead>
            <tr>
              <th scope="col" class="checkbox-column">
                <label for="select-all" class="sr-only">Seleccionar todos los registros</label>
                <input
                  id="select-all"
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="handleSelectAll"
                  aria-label="Seleccionar todos los registros"
                />
              </th>
              <th scope="col">Nombre</th>
              <th scope="col">Email</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Alojamiento</th>
              <th scope="col">Tirolina</th>
              <th scope="col">Tirolina pagada</th>
              <th scope="col">Pagado</th>
              <th scope="col">Fecha registro</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in registrations" :key="registration.id">
              <td class="checkbox-column" data-label="Seleccionar">
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
              </td>
              <td data-label="Nombre">{{ getRegistrationFullName(registration) }}</td>
              <td data-label="Email">{{ registration.email }}</td>
              <td data-label="Teléfono">{{ registration.phone }}</td>
              <td data-label="Alojamiento">{{ getAccommodationLabel(registration.accommodation) }}</td>
              <td data-label="Tirolina">
                <span
                  class="payment-status"
                  :class="
                    registration.zipline_requested ? 'payment-status--paid' : 'payment-status--unpaid'
                  "
                  :aria-label="registration.zipline_requested ? 'Tirolina solicitada' : 'Tirolina no solicitada'"
                >
                  {{ registration.zipline_requested ? 'Sí' : 'No' }}
                </span>
              </td>
              <td data-label="Tirolina pagada">
                <span
                  class="payment-status"
                  :class="registration.zipline_paid ? 'payment-status--paid' : 'payment-status--unpaid'"
                  :aria-label="registration.zipline_paid ? 'Tirolina pagada' : 'Tirolina no pagada'"
                >
                  {{ registration.zipline_paid ? 'Sí' : 'No' }}
                </span>
              </td>
              <td data-label="Pagado">
                <span
                  class="payment-status"
                  :class="
                    registration.accommodation_paid
                      ? 'payment-status--paid'
                      : 'payment-status--unpaid'
                  "
                  :aria-label="
                    registration.accommodation_paid ? 'Alojamiento pagado' : 'Alojamiento no pagado'
                  "
                >
                  {{ registration.accommodation_paid ? 'Sí' : 'No' }}
                </span>
              </td>
              <td data-label="Fecha registro">{{ formatDate(registration.created_at) }}</td>
              <td data-label="Acciones">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edición -->
    <AdminEditModal
      v-if="selectedRegistration"
      :registration="selectedRegistration"
      @close="closeEditModal"
      @saved="handleRegistrationUpdated"
    />

    <!-- Modal de confirmación de borrado -->
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
            Vas a eliminar {{ registrationsToDelete.length }} registros de asistentes. Esta acción no
            se puede deshacer.
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
          <button
            type="button"
            @click="executeDelete"
            class="delete-button"
            :disabled="isDeleting"
          >
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
  triggerPaymentReminders,
} from '@/services/adminService'
import { ACCOMMODATION_OPTIONS } from '@/constants'
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

// Controles de ordenamiento
const sortField = ref('accommodation_paid,created_at')
const sortDirection = ref('asc')

const loadRegistrations = async () => {
  loading.value = true
  error.value = ''

  let orderBy = sortField.value
  let ascending = sortDirection.value === 'asc'

  if (orderBy === 'accommodation_paid,created_at') {
    orderBy = 'accommodation_paid,created_at'
    ascending = 'true,false'
  }

  const result = await getAllRegistrations({
    limit: 1000,
    orderBy,
    ascending,
  })

  if (result.success) {
    registrations.value = result.data || []
    totalRegistrations.value = result.count || 0
    allRegistrations.value = result.data || []
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

const handleSortChange = () => {
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

  const sent = Number(result.data?.sent || 0)
  const skipped = Number(result.data?.skipped || 0)
  const total = Number(result.data?.total || 0)
  remindersFeedback.value = {
    type: 'success',
    message: `Recordatorios ejecutados. Enviados: ${sent}. Omitidos: ${skipped}. Elegibles: ${total}.`,
  }
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

const getAccommodationLabel = (value) => {
  const option = ACCOMMODATION_OPTIONS.find((opt) => opt.value === value)
  if (!option) return value
  return option.fullLabel ?? option.label
}

const getRegistrationFullName = (registration) => {
  const fullName = String(registration?.full_name || '').trim()
  return fullName || '-'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
        orderBy: sortField.value,
        ascending: sortDirection.value === 'asc',
      })
      if (result.success) {
        allRegistrations.value = result.data || []
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
          orderBy: sortField.value,
          ascending: sortDirection.value === 'asc',
        })
        if (result.success) {
          allRegistrations.value = result.data || []
        }
        loading.value = false
      }
      dataToExport = allRegistrations.value.filter((reg) => selectedIds.includes(reg.id))
    } else {
      if (allRegistrations.value.length < totalRegistrations.value) {
        loading.value = true
        const result = await getAllRegistrations({
          limit: 10000,
          orderBy: sortField.value,
          ascending: sortDirection.value === 'asc',
        })
        if (result.success) {
          allRegistrations.value = result.data || []
        }
        loading.value = false
      }
      dataToExport = allRegistrations.value
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Registros')

    worksheet.columns = [
      { header: 'Nombre y apellidos', key: 'nombreCompleto', width: 30 },
      { header: 'Mote/Alias', key: 'nickname', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Fecha de nacimiento', key: 'fechaNacimiento', width: 18 },
      { header: 'Es menor', key: 'esMenor', width: 10 },
      { header: 'Contacto emergencia (nombre)', key: 'contactoEmergenciaNombre', width: 25 },
      { header: 'Contacto emergencia (teléfono)', key: 'contactoEmergenciaTelefono', width: 20 },
      { header: 'Fecha llegada', key: 'fechaLlegada', width: 20 },
      { header: 'Fecha salida', key: 'fechaSalida', width: 20 },
      { header: 'Alojamiento', key: 'alojamiento', width: 30 },
      { header: 'Tirolina', key: 'tirolina', width: 12 },
      { header: 'Tirolina pagada', key: 'tirolinaPagada', width: 16 },
      { header: 'Restricciones alimentarias', key: 'restriccionesAlimentarias', width: 25 },
      { header: 'Comentarios', key: 'comentarios', width: 30 },
      { header: 'Comentarios dieta', key: 'comentariosDieta', width: 20 },
      { header: 'Términos aceptados', key: 'terminosAceptados', width: 18 },
      { header: 'Consentimiento imagen (difusión)', key: 'consentimientoImagen', width: 26 },
      { header: 'Alojamiento pagado', key: 'alojamientoPagado', width: 18 },
      { header: 'Fecha registro', key: 'fechaRegistro', width: 20 },
      { header: 'Última actualización', key: 'ultimaActualizacion', width: 20 },
    ]

    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A4D2E' },
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    dataToExport.forEach((reg) => {
      worksheet.addRow({
        nombreCompleto: getRegistrationFullName(reg),
        nickname: reg.nickname || '',
        email: reg.email,
        telefono: reg.phone,
        fechaNacimiento: reg.birth_date ? new Date(reg.birth_date).toLocaleDateString('es-ES') : '',
        esMenor: reg.is_minor ? 'Sí' : 'No',
        contactoEmergenciaNombre: reg.emergency_contact_name || '',
        contactoEmergenciaTelefono: reg.emergency_contact_phone || '',
        fechaLlegada: reg.arrival_date
          ? new Date(reg.arrival_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        fechaSalida: reg.departure_date
          ? new Date(reg.departure_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        alojamiento: getAccommodationLabel(reg.accommodation),
        tirolina: reg.zipline_requested ? 'Sí' : 'No',
        tirolinaPagada: reg.zipline_paid ? 'Sí' : 'No',
        restriccionesAlimentarias: Array.isArray(reg.diet) ? reg.diet.join(', ') : '',
        comentarios: reg.comments || '',
        comentariosDieta: reg.diet_comments || '',
        terminosAceptados: reg.terms_accepted ? 'Sí' : 'No',
        consentimientoImagen: reg.image_consent_accepted ? 'Sí' : 'No',
        alojamientoPagado: reg.accommodation_paid ? 'Sí' : 'No',
        fechaRegistro: reg.created_at
          ? new Date(reg.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        ultimaActualizacion: reg.updated_at
          ? new Date(reg.updated_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      })
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
.admin-tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.loading-message,
.error-message {
  text-align: center;
  padding: var(--spacing-lg);
  font-size: 1.125rem;
}

.error-message {
  color: var(--color-accent);
  background-color: #fce8e6;
  border-radius: var(--radius-lg);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.list-header h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.controls-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.download-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
}

.download-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.download-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.download-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reminder-button {
  background-color: #7a3e00;
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
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
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
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

.sort-select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  background-color: var(--color-white);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:hover {
  border-color: var(--color-primary);
}

.sort-select:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.registrations-table-wrapper {
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.registrations-table {
  width: 100%;
  border-collapse: collapse;
}

.registrations-table thead {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.registrations-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
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

.registrations-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-cream-dark);
}

.registrations-table tbody tr:hover {
  background-color: var(--color-cream);
}

.edit-button,
.delete-button {
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  margin-right: var(--spacing-xs);
}

.edit-button:hover {
  background-color: var(--color-primary-dark);
}

.edit-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.delete-button {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.delete-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.delete-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-icon-button {
  border: none;
  background: transparent;
  color: #dc3545;
  border-radius: var(--radius-sm);
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: var(--spacing-xs);
  transition:
    color 0.2s ease,
    transform 0.15s ease;
  font-size: 1.1rem;
}

.delete-icon-button:hover:not(:disabled) {
  color: #b8323f;
  transform: translateY(-1px);
}

.delete-icon-button:focus-visible {
  outline: 3px solid #dc3545;
  outline-offset: 2px;
}

.delete-icon-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top: 2px solid var(--color-white);
  border-radius: 50%;
  margin-right: 0.5rem;
  animation: spinner 0.8s linear infinite;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-cream-dark);
}

.modal-header h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.close-button:hover:not(:disabled) {
  background-color: var(--color-cream);
}

.close-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.close-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
  background-color: var(--color-cream-dark);
  color: var(--color-text);
}

.cancel-button:hover:not(:disabled) {
  background-color: var(--color-cream);
}

.cancel-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes spinner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .controls-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .download-button {
    width: 100%;
  }

  .delete-selected-button {
    width: 100%;
  }

  .sort-controls {
    width: 100%;
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .registrations-table-wrapper {
    overflow-x: visible;
    background: transparent;
    box-shadow: none;
  }

  .registrations-table,
  .registrations-table thead,
  .registrations-table tbody,
  .registrations-table tr,
  .registrations-table th,
  .registrations-table td {
    display: block;
  }

  .registrations-table {
    font-size: 0.875rem;
  }

  .registrations-table thead {
    display: none;
  }

  .registrations-table tbody {
    display: grid;
    gap: var(--spacing-sm);
  }

  .registrations-table tbody tr {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: var(--spacing-sm);
  }

  .registrations-table td {
    border-bottom: none;
    padding: var(--spacing-xs) 0;
  }

  .registrations-table td::before {
    content: attr(data-label);
    display: block;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 0.2rem;
  }

  .checkbox-column {
    width: auto;
    text-align: left;
  }

  .edit-button,
  .delete-icon-button {
    display: block;
    width: 100%;
    margin-bottom: var(--spacing-xs);
    height: auto;
  }
}
</style>
