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
            @click="handleDownloadExcel"
            class="download-button"
            :disabled="loading"
            aria-label="Descargar registros en Excel"
          >
            Descargar Excel
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
              <option value="first_name">Nombre</option>
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
              <th scope="col">Pagado</th>
              <th scope="col">Fecha registro</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registration in registrations" :key="registration.id">
              <td class="checkbox-column">
                <label :for="`select-${registration.id}`" class="sr-only">
                  Seleccionar registro de {{ registration.first_name }}
                  {{ registration.last_name }}
                </label>
                <input
                  :id="`select-${registration.id}`"
                  type="checkbox"
                  :checked="selectedRegistrations.has(registration.id)"
                  @change="handleSelectRegistration(registration.id, $event.target.checked)"
                  :aria-label="`Seleccionar registro de ${registration.first_name} ${registration.last_name}`"
                />
              </td>
              <td>{{ registration.first_name }} {{ registration.last_name }}</td>
              <td>{{ registration.email }}</td>
              <td>{{ registration.phone }}</td>
              <td>{{ getAccommodationLabel(registration.accommodation) }}</td>
              <td>
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
              <td>{{ formatDate(registration.created_at) }}</td>
              <td>
                <button
                  type="button"
                  @click="openEditModal(registration)"
                  class="edit-button"
                  :aria-label="`Editar registro de ${registration.first_name} ${registration.last_name}`"
                >
                  Editar
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAllRegistrations } from '@/services/adminService'
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

const getAccommodationLabel = (value) => {
  const option = ACCOMMODATION_OPTIONS.find((opt) => opt.value === value)
  return option ? option.label : value
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
  if (checked) {
    selectedRegistrations.value.add(id)
  } else {
    selectedRegistrations.value.delete(id)
  }
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
  } else {
    selectedRegistrations.value.clear()
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
      { header: 'Nombre', key: 'nombre', width: 15 },
      { header: 'Apellidos', key: 'apellidos', width: 20 },
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
      { header: 'Restricciones alimentarias', key: 'restriccionesAlimentarias', width: 25 },
      { header: 'Comentarios', key: 'comentarios', width: 30 },
      { header: 'Comentarios dieta', key: 'comentariosDieta', width: 20 },
      { header: 'Términos aceptados', key: 'terminosAceptados', width: 18 },
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
        nombre: reg.first_name,
        apellidos: reg.last_name,
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
        restriccionesAlimentarias: Array.isArray(reg.diet) ? reg.diet.join(', ') : '',
        comentarios: reg.comments || '',
        comentariosDieta: reg.diet_comments || '',
        terminosAceptados: reg.terms_accepted ? 'Sí' : 'No',
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

.edit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-button:hover {
  background-color: var(--color-primary-dark);
}

.edit-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
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

  .sort-controls {
    width: 100%;
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .registrations-table {
    font-size: 0.875rem;
  }

  .registrations-table th,
  .registrations-table td {
    padding: var(--spacing-sm);
  }
}
</style>
