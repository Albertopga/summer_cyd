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
          <button
            type="button"
            @click="openCreateModal"
            class="create-button"
            :disabled="loading"
            aria-label="Crear actividad de organización"
          >
            Crear actividad
          </button>
          <button
            type="button"
            @click="handleDownloadExcel"
            class="download-button"
            :disabled="loading"
            aria-label="Descargar actividades en Excel"
          >
            Descargar Excel
          </button>
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
            <tr
              v-for="activity in activities"
              :key="activity.id"
              class="activity-row"
              role="button"
              tabindex="0"
              :aria-label="`Ver detalle de ${activity.name}`"
              @click="openDetailModal(activity)"
              @keydown.enter.prevent="openDetailModal(activity)"
              @keydown.space.prevent="openDetailModal(activity)"
            >
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
                  @click.stop
                  class="edit-button"
                  :aria-label="`Editar actividad ${activity.name}`"
                >
                  Editar
                </button>
                <button
                  type="button"
                  @click.stop="confirmDelete(activity)"
                  class="delete-icon-button"
                  :aria-label="`Borrar actividad ${activity.name}`"
                  title="Borrar actividad"
                >
                  <span aria-hidden="true">🗑️</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de creación (organización) -->
    <AdminActivityCreateModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @saved="handleActivityCreated"
    />

    <!-- Modal de edición -->
    <AdminActivityEditModal
      v-if="selectedActivity"
      :activity="selectedActivity"
      @close="closeEditModal"
      @saved="handleActivityUpdated"
    />

    <!-- Modal de detalle -->
    <div
      v-if="detailActivity"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-detail-title"
      @click.self="closeDetailModal"
      @keydown.esc="closeDetailModal"
    >
      <div class="modal-content detail-modal">
        <header class="modal-header">
          <h2 id="activity-detail-title">{{ detailActivity.name || 'Detalle de actividad' }}</h2>
          <button
            type="button"
            @click="closeDetailModal"
            class="close-button"
            aria-label="Cerrar modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div class="modal-body detail-modal-body">
          <div class="detail-grid">
            <p><strong>Organizador:</strong> {{ detailActivity.organizer_name || '-' }}</p>
            <p><strong>Email:</strong> {{ detailActivity.organizer_email || '-' }}</p>
            <p><strong>Tipo:</strong> {{ getActivityTypeLabel(detailActivity.type) }}</p>
            <p><strong>Estado:</strong> {{ getStatusLabel(detailActivity.status) }}</p>
            <p>
              <strong>Participantes:</strong> {{ detailActivity.min_participants || '-' }} -
              {{ detailActivity.max_participants || '-' }}
            </p>
            <p>
              <strong>Franja:</strong> {{ getTimeSlotLabel(detailActivity.preferred_time_slot) }}
            </p>
            <p><strong>Duración:</strong> {{ detailActivity.duration || '-' }}</p>
            <p><strong>Espacio:</strong> {{ getSpaceNeedLabel(detailActivity.space_need) }}</p>
            <p><strong>Fecha registro:</strong> {{ formatDate(detailActivity.created_at) }}</p>
            <p>
              <strong>Última actualización:</strong> {{ formatDate(detailActivity.updated_at) }}
            </p>
          </div>

          <p><strong>Descripción:</strong></p>
          <p class="detail-block">{{ detailActivity.description || '-' }}</p>

          <p><strong>Necesidades de los participantes:</strong></p>
          <p class="detail-block">{{ detailActivity.participant_needs || '-' }}</p>

          <p><strong>Necesidades de la organización:</strong></p>
          <p class="detail-block">{{ detailActivity.organization_needs || '-' }}</p>

          <p><strong>Puesta en marcha:</strong></p>
          <p class="detail-block">{{ detailActivity.setup || '-' }}</p>

          <p><strong>Observaciones:</strong></p>
          <p class="detail-block">{{ detailActivity.observations || '-' }}</p>

          <p><strong>Notas de aprobación:</strong></p>
          <p class="detail-block">{{ detailActivity.approval_notes || '-' }}</p>

          <div class="documents-section">
            <p><strong>Documentos adjuntos:</strong></p>
            <div v-if="groupedDocuments.length > 0" class="documents-groups">
              <section v-for="group in groupedDocuments" :key="group.key" class="documents-group">
                <h3 class="documents-group-title">{{ group.label }} ({{ group.items.length }})</h3>
                <ul class="documents-list">
                  <li v-for="(doc, index) in group.items" :key="`${doc.url}-${index}`">
                    <span class="doc-type-chip">{{ doc.badge }}</span>
                    <button
                      type="button"
                      class="download-doc-link"
                      :disabled="downloadingDocumentUrl === doc.url"
                      @click="downloadDocument(doc)"
                    >
                      {{
                        downloadingDocumentUrl === doc.url
                          ? `Descargando ${doc.name}...`
                          : `Descargar ${doc.name}`
                      }}
                    </button>
                  </li>
                </ul>
              </section>
            </div>
            <p v-else class="no-documents">Sin documentos adjuntos.</p>
            <p v-if="downloadError" class="download-error" role="alert">{{ downloadError }}</p>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" @click="closeDetailModal" class="cancel-button">Cerrar</button>
        </footer>
      </div>
    </div>

    <div
      v-if="activityToDelete"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-activity-title"
      @click.self="cancelDelete"
      @keydown.esc="cancelDelete"
    >
      <div class="modal-content delete-modal">
        <header class="modal-header">
          <h2 id="delete-activity-title">Confirmar borrado</h2>
          <button
            type="button"
            @click="cancelDelete"
            class="close-button"
            aria-label="Cerrar modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="modal-body">
          <p>
            ¿Seguro que quieres borrar la actividad
            <strong>{{ activityToDelete.name }}</strong
            >?
          </p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
          <p v-if="deleteError" class="download-error" role="alert">{{ deleteError }}</p>
        </div>
        <footer class="modal-footer">
          <button type="button" @click="cancelDelete" class="cancel-button">Cancelar</button>
          <button type="button" @click="executeDelete" class="delete-button" :disabled="isDeleting">
            <span v-if="!isDeleting">Borrar</span>
            <span v-else><span class="spinner" aria-hidden="true"></span>Borrando...</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAllActivities, deleteActivity } from '@/services/adminService'
import { supabase } from '@/lib/supabase'
import { ACTIVITY_TYPES, TIME_SLOTS, SPACE_NEEDS } from '@/constants'
import AdminActivityCreateModal from '@/components/AdminActivityCreateModal.vue'
import AdminActivityEditModal from '@/components/AdminActivityEditModal.vue'
import ExcelJS from 'exceljs'

defineOptions({
  name: 'AdminActivitiesTab',
})

const emit = defineEmits(['update-count'])

const loading = ref(false)
const error = ref('')
const activities = ref([])
const totalActivities = ref(0)
const selectedActivity = ref(null)
const detailActivity = ref(null)
const activityToDelete = ref(null)
const showCreateModal = ref(false)
const isDeleting = ref(false)
const downloadingDocumentUrl = ref('')
const deleteError = ref('')
const downloadError = ref('')
const statusFilter = ref('')
const sortField = ref('created_at')
const sortDirection = ref('desc')

const loadActivities = async () => {
  loading.value = true
  error.value = ''

  try {
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
      activities.value = []
      totalActivities.value = 0
    }
  } catch (err) {
    console.error('Error inesperado al cargar actividades:', err)
    error.value = err.message || 'Error inesperado al cargar las actividades'
    activities.value = []
    totalActivities.value = 0
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleActivityCreated = () => {
  closeCreateModal()
  loadActivities()
}

const openEditModal = (activity) => {
  selectedActivity.value = { ...activity }
}

const openDetailModal = (activity) => {
  downloadError.value = ''
  downloadingDocumentUrl.value = ''
  detailActivity.value = { ...activity }
}

const closeDetailModal = () => {
  downloadError.value = ''
  downloadingDocumentUrl.value = ''
  detailActivity.value = null
}

const confirmDelete = (activity) => {
  deleteError.value = ''
  activityToDelete.value = activity
}

const cancelDelete = () => {
  deleteError.value = ''
  activityToDelete.value = null
}

const executeDelete = async () => {
  if (!activityToDelete.value?.id) return

  isDeleting.value = true
  deleteError.value = ''
  const deletingId = activityToDelete.value.id
  const result = await deleteActivity(deletingId)
  isDeleting.value = false

  if (result.success) {
    cancelDelete()
    if (detailActivity.value?.id === deletingId) {
      closeDetailModal()
    }
    await loadActivities()
    return
  }

  deleteError.value = result.error || 'Error al borrar la actividad'
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

const getSpaceNeedLabel = (value) => {
  if (!value) return '-'
  const option = SPACE_NEEDS.find((opt) => opt.value === value)
  return option ? option.label : value
}

const normalizedDocuments = computed(() => {
  if (!detailActivity.value || !Array.isArray(detailActivity.value.documents)) return []

  return detailActivity.value.documents
    .map((doc, index) => {
      if (typeof doc === 'string') {
        const fallback = `documento-${index + 1}`
        const nameFromUrl = doc.split('?')[0].split('/').pop()
        const fileName = nameFromUrl || fallback
        return {
          url: doc,
          path: extractStoragePathFromPublicUrl(doc),
          name: fileName,
          type: '',
          category: getDocumentCategory(fileName, ''),
        }
      }
      if (doc && typeof doc === 'object' && typeof doc.url === 'string') {
        const fallback = `documento-${index + 1}`
        const fileName = doc.name || doc.url.split('?')[0].split('/').pop() || fallback
        const fileType = typeof doc.type === 'string' ? doc.type : ''
        const filePath =
          typeof doc.path === 'string' && doc.path.trim().length > 0
            ? doc.path
            : extractStoragePathFromPublicUrl(doc.url)
        return {
          url: doc.url,
          path: filePath,
          name: fileName,
          type: fileType,
          category: getDocumentCategory(fileName, fileType),
        }
      }
      return null
    })
    .filter((item) => item && item.url)
})

const DOCUMENT_CATEGORY_META = {
  pdf: { key: 'pdf', label: 'PDF', badge: 'PDF' },
  word: { key: 'word', label: 'Word', badge: 'DOC' },
  image: { key: 'image', label: 'Imagen', badge: 'IMG' },
  other: { key: 'other', label: 'Otros', badge: 'FILE' },
}

const getExtension = (name) => {
  const clean = String(name || '').split('?')[0]
  const dot = clean.lastIndexOf('.')
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : ''
}

const getDocumentCategory = (name, type) => {
  const extension = getExtension(name)
  const mime = String(type || '').toLowerCase()

  if (mime.includes('pdf') || extension === 'pdf') return 'pdf'
  if (
    mime.includes('msword') ||
    mime.includes('wordprocessingml') ||
    extension === 'doc' ||
    extension === 'docx'
  ) {
    return 'word'
  }
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    return 'image'
  }
  return 'other'
}

const groupedDocuments = computed(() => {
  if (normalizedDocuments.value.length === 0) return []

  const map = new Map()
  normalizedDocuments.value.forEach((doc) => {
    const categoryKey = doc.category || 'other'
    if (!map.has(categoryKey)) {
      const meta = DOCUMENT_CATEGORY_META[categoryKey] || DOCUMENT_CATEGORY_META.other
      map.set(categoryKey, { ...meta, items: [] })
    }
    const group = map.get(categoryKey)
    group.items.push({
      ...doc,
      badge: (DOCUMENT_CATEGORY_META[categoryKey] || DOCUMENT_CATEGORY_META.other).badge,
    })
  })

  const order = ['pdf', 'word', 'image', 'other']
  return order.filter((k) => map.has(k)).map((k) => map.get(k))
})

const fallbackOpenDocument = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const extractStoragePathFromPublicUrl = (url) => {
  try {
    const u = new URL(url)
    const marker = '/storage/v1/object/public/activity-documents/'
    const idx = u.pathname.indexOf(marker)
    if (idx === -1) return ''
    const path = u.pathname.slice(idx + marker.length)
    return decodeURIComponent(path)
  } catch {
    return ''
  }
}

const downloadDocument = async (doc) => {
  const downloadRef = doc?.path || doc?.url || ''
  if (!downloadRef) return
  downloadingDocumentUrl.value = downloadRef
  downloadError.value = ''

  try {
    const storagePath = doc.path || extractStoragePathFromPublicUrl(doc.url)
    if (!storagePath) {
      throw new Error('No se encontró la ruta interna del documento en Storage.')
    }

    const { data, error: sdkError } = await supabase.storage
      .from('activity-documents')
      .download(storagePath)
    if (sdkError || !data) {
      throw sdkError || new Error('No se pudo recuperar el documento desde Storage.')
    }

    const objectUrl = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = doc.name || storagePath.split('/').pop() || 'documento'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(objectUrl)
  } catch (err) {
    console.error('Error al descargar documento:', err)
    if (doc?.url) {
      fallbackOpenDocument(doc.url)
      downloadError.value = 'No se pudo descargar automáticamente. Se abrió en otra pestaña.'
    } else {
      downloadError.value = 'No se pudo descargar el documento.'
    }
  } finally {
    downloadingDocumentUrl.value = ''
  }
}

const handleDownloadExcel = async () => {
  try {
    // Usar las actividades ya cargadas si están disponibles, sino cargar todas
    let dataToExport = []

    if (activities.value.length > 0 && activities.value.length === totalActivities.value) {
      // Si ya tenemos todas las actividades cargadas, usarlas
      dataToExport = activities.value
    } else {
      // Cargar todas las actividades (sin límite) sin afectar el estado de loading de la lista
      const result = await getAllActivities({
        limit: 10000,
        orderBy: sortField.value,
        ascending: sortDirection.value === 'asc',
        status: statusFilter.value || null,
      })

      if (!result.success) {
        // Mostrar error temporal sin afectar el estado principal
        const tempError = result.error || 'Error al cargar las actividades para exportar'
        alert(tempError)
        return
      }

      dataToExport = result.data || []
    }

    if (dataToExport.length === 0) {
      alert('No hay actividades para exportar')
      return
    }

    // Crear el libro de trabajo
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Actividades')

    // Definir las columnas con sus anchos
    worksheet.columns = [
      { header: 'Organizador', key: 'organizador', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Mín. participantes', key: 'minParticipantes', width: 15 },
      { header: 'Máx. participantes', key: 'maxParticipantes', width: 15 },
      { header: 'Franja horaria', key: 'franjaHoraria', width: 25 },
      { header: 'Duración', key: 'duracion', width: 15 },
      { header: 'Necesidades participantes', key: 'necesidadesParticipantes', width: 30 },
      { header: 'Necesidades organización', key: 'necesidadesOrganizacion', width: 30 },
      { header: 'Necesidad espacio', key: 'necesidadEspacio', width: 20 },
      { header: 'Puesta en marcha', key: 'puestaEnMarcha', width: 30 },
      { header: 'Observaciones', key: 'observaciones', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Aprobado por', key: 'aprobadoPor', width: 20 },
      { header: 'Notas aprobación', key: 'notasAprobacion', width: 30 },
      { header: 'Documentos', key: 'documentos', width: 20 },
      { header: 'Fecha registro', key: 'fechaRegistro', width: 20 },
      { header: 'Última actualización', key: 'ultimaActualizacion', width: 20 },
    ]

    // Estilizar el header
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A4D2E' },
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // Añadir los datos
    dataToExport.forEach((activity) => {
      worksheet.addRow({
        organizador: activity.organizer_name || '',
        email: activity.organizer_email || '',
        tipo: getActivityTypeLabel(activity.type),
        nombre: activity.name || '',
        descripcion: activity.description || '',
        minParticipantes: activity.min_participants || '',
        maxParticipantes: activity.max_participants || '',
        franjaHoraria: getTimeSlotLabel(activity.preferred_time_slot),
        duracion: activity.duration || '',
        necesidadesParticipantes: activity.participant_needs || '',
        necesidadesOrganizacion: activity.organization_needs || '',
        necesidadEspacio: getSpaceNeedLabel(activity.space_need),
        puestaEnMarcha: activity.setup || '',
        observaciones: activity.observations || '',
        estado: getStatusLabel(activity.status),
        aprobadoPor: activity.approved_by || '',
        notasAprobacion: activity.approval_notes || '',
        documentos:
          Array.isArray(activity.documents) && activity.documents.length > 0
            ? `${activity.documents.length} archivo(s)`
            : 'Sin documentos',
        fechaRegistro: activity.created_at
          ? new Date(activity.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        ultimaActualizacion: activity.updated_at
          ? new Date(activity.updated_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
      })
    })

    // Generar el nombre del archivo con fecha
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `actividades_${dateStr}.xlsx`

    // Generar el buffer y descargar el archivo
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
    error.value = 'Error al exportar las actividades a Excel'
  }
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

.create-button {
  background: linear-gradient(135deg, var(--color-accent) 0%, #d96a3c 100%);
  color: var(--color-white);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  padding: 0.6rem 1.15rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.2s ease;
  font-size: 0.875rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.create-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
  background: linear-gradient(135deg, #de7a4f 0%, #c95e34 100%);
}

.create-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.activity-row {
  cursor: pointer;
}

.activity-row:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: -3px;
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

.delete-button {
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: var(--spacing-xs);
}

.delete-button:hover:not(:disabled) {
  background-color: #b64729;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
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

.delete-icon-button:hover {
  color: #b8323f;
  transform: translateY(-1px);
}

.delete-icon-button:focus-visible {
  outline: 3px solid #dc3545;
  outline-offset: 2px;
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

.close-button:hover {
  background-color: var(--color-cream);
}

.close-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.modal-body {
  padding: var(--spacing-lg);
}

.warning-text {
  color: var(--color-accent);
  font-weight: 600;
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

.cancel-button:hover {
  background-color: var(--color-cream);
}

.cancel-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.detail-modal {
  max-width: 900px;
}

.detail-modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm) var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.detail-grid p {
  margin: 0;
}

.detail-modal-body p {
  margin-top: 0;
}

.detail-block {
  background-color: var(--color-cream);
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  white-space: pre-wrap;
}

.documents-section {
  margin-top: var(--spacing-md);
}

.documents-groups {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.documents-group {
  background-color: var(--color-cream);
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}

.documents-group-title {
  margin: 0 0 var(--spacing-xs);
  font-size: 0.95rem;
  color: var(--color-primary);
}

.documents-list {
  margin: var(--spacing-xs) 0 0;
  padding-left: 1.25rem;
}

.documents-list li {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.documents-list li + li {
  margin-top: var(--spacing-xs);
}

.doc-type-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 0.72rem;
  font-weight: 700;
}

.download-doc-link {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
  font: inherit;
}

.download-doc-link:hover {
  color: var(--color-primary-dark);
}

.download-doc-link:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.no-documents {
  margin-top: var(--spacing-xs);
  color: var(--color-text-light);
}

.download-error {
  margin-top: var(--spacing-sm);
  color: var(--color-accent);
  font-size: 0.9rem;
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

  .create-button,
  .download-button {
    width: 100%;
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

  .edit-button,
  .delete-button,
  .delete-icon-button {
    display: block;
    width: 100%;
    margin: 0 0 var(--spacing-xs);
    height: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
