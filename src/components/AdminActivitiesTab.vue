<template>
  <div class="admin-tab-content">
    <div v-if="loading" class="loading-message" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      Cargando actividades...
    </div>

    <div v-else-if="error" class="error-message" role="alert">
      {{ error }}
    </div>

    <div v-else class="activities-list">
      <div class="list-header">
        <h2>Actividades propuestas ({{ totalActivities }})</h2>
        <div class="controls-group">
          <div class="filter-controls">
            <label for="status-filter" class="sr-only">Filtrar por estado</label>
            <select
              id="status-filter"
              v-model="statusFilter"
              @change="handleFilterChange"
              class="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
          <div class="sort-controls">
            <label for="sort-field-activities" class="sr-only">Ordenar por</label>
            <select
              id="sort-field-activities"
              v-model="sortField"
              @change="handleSortChange"
              class="sort-select"
            >
              <option value="created_at">Fecha registro</option>
              <option value="status">Estado</option>
              <option value="type">Tipo</option>
              <option value="name">Nombre</option>
              <option value="organizer_name">Organizador</option>
            </select>
            <label for="sort-direction-activities" class="sr-only">Dirección del orden</label>
            <select
              id="sort-direction-activities"
              v-model="sortDirection"
              @change="handleSortChange"
              class="sort-select"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="activities.length === 0" class="empty-state" role="status">
        No hay actividades disponibles
      </div>

      <div v-else class="activities-table-wrapper">
        <table class="activities-table" aria-label="Lista de actividades propuestas">
          <thead>
            <tr>
              <th scope="col">Organizador</th>
              <th scope="col">Email</th>
              <th scope="col">Tipo</th>
              <th scope="col">Nombre</th>
              <th scope="col">Participantes</th>
              <th scope="col">Horario</th>
              <th scope="col">Estado</th>
              <th scope="col">Fecha registro</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in activities" :key="activity.id">
              <td>{{ activity.organizer_name }}</td>
              <td>{{ activity.organizer_email }}</td>
              <td>{{ getActivityTypeLabel(activity.type) }}</td>
              <td>{{ activity.name }}</td>
              <td>{{ activity.min_participants }}-{{ activity.max_participants }}</td>
              <td>{{ getTimeSlotLabel(activity.preferred_time_slot) }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="`status-badge--${activity.status}`"
                  :aria-label="`Estado: ${getStatusLabel(activity.status)}`"
                >
                  {{ getStatusLabel(activity.status) }}
                </span>
              </td>
              <td>{{ formatDate(activity.created_at) }}</td>
              <td>
                <button
                  type="button"
                  @click="openEditModal(activity)"
                  class="edit-button"
                  :aria-label="`Editar actividad ${activity.name}`"
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
    <AdminActivityEditModal
      v-if="selectedActivity"
      :activity="selectedActivity"
      @close="closeEditModal"
      @saved="handleActivityUpdated"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getAllActivities } from '@/services/adminService'
import { ACTIVITY_TYPES, TIME_SLOTS } from '@/constants'
import AdminActivityEditModal from '@/components/AdminActivityEditModal.vue'

defineOptions({
  name: 'AdminActivitiesTab',
})

const emit = defineEmits(['update-count'])

const loading = ref(false)
const error = ref('')
const activities = ref([])
const totalActivities = ref(0)
const selectedActivity = ref(null)
const statusFilter = ref('')
const sortField = ref('created_at')
const sortDirection = ref('desc')

const loadActivities = async () => {
  loading.value = true
  error.value = ''

  const result = await getAllActivities({
    limit: 1000,
    orderBy: sortField.value,
    ascending: sortDirection.value === 'asc',
    status: statusFilter.value || null,
  })

  if (result.success) {
    activities.value = result.data || []
    totalActivities.value = result.count || 0
    emit('update-count', result.count || 0)
  } else {
    error.value = result.error || 'Error al cargar las actividades'
  }

  loading.value = false
}

const openEditModal = (activity) => {
  selectedActivity.value = { ...activity }
}

const closeEditModal = () => {
  selectedActivity.value = null
}

const handleActivityUpdated = () => {
  closeEditModal()
  loadActivities()
}

const handleSortChange = () => {
  loadActivities()
}

const handleFilterChange = () => {
  loadActivities()
}

const getActivityTypeLabel = (value) => {
  const option = ACTIVITY_TYPES.find((opt) => opt.value === value)
  return option ? option.label : value
}

const getTimeSlotLabel = (value) => {
  const option = TIME_SLOTS.find((opt) => opt.value === value)
  return option ? option.label : value
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
  }
  return labels[status] || status
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

onMounted(() => {
  loadActivities()
})

defineExpose({
  loadActivities,
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

.filter-controls,
.sort-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.filter-select,
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

.filter-select:hover,
.sort-select:hover {
  border-color: var(--color-primary);
}

.filter-select:focus-visible,
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

.activities-table-wrapper {
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.activities-table {
  width: 100%;
  border-collapse: collapse;
}

.activities-table thead {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.activities-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
}

.activities-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-cream-dark);
}

.activities-table tbody tr:hover {
  background-color: var(--color-cream);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge--pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge--approved {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.status-badge--rejected {
  background-color: #fce8e6;
  color: var(--color-accent);
}

.status-badge--cancelled {
  background-color: #e9ecef;
  color: #495057;
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

  .filter-controls,
  .sort-controls {
    width: 100%;
    flex-direction: column;
  }

  .filter-select,
  .sort-select {
    width: 100%;
  }

  .activities-table {
    font-size: 0.875rem;
  }

  .activities-table th,
  .activities-table td {
    padding: var(--spacing-sm);
  }
}
</style>
