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
          <div class="column-settings">
            <button
              type="button"
              class="columns-button"
              :aria-expanded="showColumnPanel ? 'true' : 'false'"
              aria-controls="activity-column-settings-panel"
              @click="showColumnPanel = !showColumnPanel"
            >
              Columnas
            </button>
            <div
              v-if="showColumnPanel"
              id="activity-column-settings-panel"
              class="column-panel"
              role="region"
              aria-label="Configuración de columnas"
            >
              <p class="column-panel-intro">
                El orden y la visibilidad se aplican a la tabla y al Excel descargado.
              </p>
              <ul class="column-list">
                <li
                  v-for="column in columnSelectorItems"
                  :key="column.id"
                  class="column-list-item"
                >
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
        </div>
      </div>

      <div v-if="activities.length === 0" class="empty-state" role="status">
        No hay actividades disponibles
      </div>

      <div v-else class="admin-table-wrapper">
        <table class="admin-table" aria-label="Lista de actividades propuestas">
          <colgroup>
            <col
              v-for="column in tableColumns"
              :key="`col-${column.id}`"
              :style="getActivityColumnTableStyle(column)"
            />
          </colgroup>
          <thead>
            <tr>
              <th
                v-for="column in tableColumns"
                :key="column.id"
                scope="col"
                :class="{ 'sortable-column': isColumnSortable(column) }"
                :style="getActivityColumnTableStyle(column)"
                :title="column.headerTitle || column.label"
                :aria-sort="isColumnSortable(column) ? getColumnAriaSort(column.id) : undefined"
              >
                <button
                  v-if="isColumnSortable(column)"
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
              <td
                v-for="column in tableColumns"
                :key="`${activity.id}-${column.id}`"
                :data-label="column.label"
                :style="getActivityColumnTableStyle(column)"
              >
                <template v-if="column.id === 'actions'">
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
                </template>

                <template v-else-if="column.cellType === 'status-badge'">
                  <span
                    class="status-badge"
                    :class="`status-badge--${activity.status}`"
                    :aria-label="`Estado: ${getActivityStatusLabel(activity.status)}`"
                  >
                    {{ getActivityStatusLabel(activity.status) }}
                  </span>
                </template>

                <template v-else>
                  {{ getActivityColumnValue(column.id, activity) }}
                </template>
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
            <p><strong>Estado:</strong> {{ getActivityStatusLabel(detailActivity.status) }}</p>
            <p>
              <strong>Participantes:</strong> {{ detailActivity.min_participants || '-' }} -
              {{ detailActivity.max_participants || '-' }}
            </p>
            <p>
              <strong>Preferencia (día/franja):</strong>
              {{ getTimeSlotLabel(detailActivity.preferred_time_slot) }}
            </p>
            <p><strong>Duración:</strong> {{ detailActivity.duration || '-' }}</p>
            <p><strong>Espacio:</strong> {{ getSpaceNeedLabel(detailActivity.space_need) }}</p>
            <p><strong>Fecha registro:</strong> {{ formatActivityDateTime(detailActivity.created_at) }}</p>
            <p>
              <strong>Última actualización:</strong> {{ formatActivityDateTime(detailActivity.updated_at) }}
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
                    <button
                      type="button"
                      class="delete-doc-link"
                      :disabled="deletingDocumentPath === (doc.path || doc.url)"
                      @click="removeDocument(doc)"
                    >
                      {{
                        deletingDocumentPath === (doc.path || doc.url)
                          ? `Eliminando ${doc.name}...`
                          : `Eliminar ${doc.name}`
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
import { getAllActivities, deleteActivity, updateActivity } from '@/services/adminService'
import { supabase } from '@/lib/supabase'
import {
  ACTIVITY_COLUMN_DEFINITIONS,
  getActivityColumnDefinition,
  getActivityColumnTableStyle,
  getConfigurableActivityColumns,
  getDefaultActivityColumnPreferences,
  getDefaultActivitySortState,
  loadActivityColumnPreferences,
  resolveActivityExportColumns,
  resolveActivityTableColumns,
  saveActivityColumnPreferences,
} from '@/config/adminActivitiesColumns'
import {
  formatActivityDateTime,
  getActivityColumnValue,
  getActivitySortValue,
  getActivityStatusLabel,
  getActivityTypeLabel,
  getSpaceNeedLabel,
  getTimeSlotLabel,
} from '@/utils/adminActivityFormatters'
import { useAdminTableSort } from '@/composables/useAdminTableSort'
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
const deletingDocumentPath = ref('')
const deleteError = ref('')
const downloadError = ref('')
const statusFilter = ref('')
const showColumnPanel = ref(false)

const columnPreferences = ref(loadActivityColumnPreferences())
const configurableColumns = computed(() => {
  const order = columnPreferences.value.order
  return order
    .map((id) => getConfigurableActivityColumns().find((col) => col.id === id))
    .filter(Boolean)
})
const columnSelectorItems = computed(() =>
  [...configurableColumns.value].sort((left, right) =>
    left.label.localeCompare(right.label, 'es', { sensitivity: 'base' }),
  ),
)
const tableColumns = computed(() => resolveActivityTableColumns(columnPreferences.value))
const exportColumns = computed(() => resolveActivityExportColumns(columnPreferences.value))

const {
  handleHeaderSort,
  resolveFetchSort,
  applySortToRows,
  isColumnSortable,
  getColumnAriaSort,
  getColumnSortIndicator,
  getColumnSortLabel,
} = useAdminTableSort({
  columns: ACTIVITY_COLUMN_DEFINITIONS,
  getColumnDefinition: getActivityColumnDefinition,
  getClientSortValue: getActivitySortValue,
  defaultSort: getDefaultActivitySortState(),
})

const getActivityFetchSort = () => {
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
  loadActivities()
}

const persistColumnPreferences = () => {
  saveActivityColumnPreferences(columnPreferences.value)
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
  columnPreferences.value = getDefaultActivityColumnPreferences()
  persistColumnPreferences()
}

const isColumnMoveDisabled = (columnId, direction) => {
  const order = columnPreferences.value.order
  const index = order.indexOf(columnId)
  if (index < 0) return true
  if (direction < 0) return index === 0
  return index === order.length - 1
}

const loadActivities = async () => {
  loading.value = true
  error.value = ''

  try {
    const { orderBy, ascending } = getActivityFetchSort()
    const result = await getAllActivities({
      limit: 1000,
      orderBy,
      ascending,
      status: statusFilter.value || null,
    })

    if (result.success) {
      activities.value = applySortToRows(result.data || [])
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
  deletingDocumentPath.value = ''
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

const handleFilterChange = () => {
  loadActivities()
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

const removeDocument = async (doc) => {
  if (!detailActivity.value?.id) return
  const storagePath = doc?.path || extractStoragePathFromPublicUrl(doc?.url || '')
  if (!storagePath) {
    downloadError.value = 'No se pudo identificar la ruta del documento para eliminarlo.'
    return
  }

  deletingDocumentPath.value = doc.path || doc.url || storagePath
  downloadError.value = ''

  const result = await updateActivity(
    detailActivity.value.id,
    { documents_to_remove: [storagePath] },
    ['documents_to_remove'],
  )

  deletingDocumentPath.value = ''

  if (!result.success) {
    downloadError.value = result.error || 'No se pudo eliminar el documento.'
    return
  }

  detailActivity.value = { ...result.data }
  activities.value = activities.value.map((activity) =>
    activity.id === result.data.id ? { ...activity, documents: result.data.documents || [] } : activity,
  )
}

const handleDownloadExcel = async () => {
  try {
    let dataToExport = []

    if (activities.value.length > 0 && activities.value.length === totalActivities.value) {
      dataToExport = applySortToRows([...activities.value])
    } else {
      const { orderBy, ascending } = getActivityFetchSort()
      const result = await getAllActivities({
        limit: 10000,
        orderBy,
        ascending,
        status: statusFilter.value || null,
      })

      if (!result.success) {
        const tempError = result.error || 'Error al cargar las actividades para exportar'
        alert(tempError)
        return
      }

      dataToExport = applySortToRows(result.data || [])
    }

    if (dataToExport.length === 0) {
      alert('No hay actividades para exportar')
      return
    }

    const columns = exportColumns.value
    if (columns.length === 0) {
      error.value = 'Selecciona al menos una columna exportable para descargar el Excel.'
      return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Actividades')

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

    dataToExport.forEach((activity) => {
      const row = {}
      columns.forEach((column) => {
        row[column.id] = getActivityColumnValue(column.id, activity)
      })
      worksheet.addRow(row)
    })

    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `actividades_${dateStr}.xlsx`

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

.warning-text {
  color: var(--color-accent);
  font-weight: 600;
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

.delete-doc-link {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: underline;
  font: inherit;
}

.delete-doc-link:hover {
  color: var(--color-accent-dark);
}

.delete-doc-link:focus-visible {
  outline: 3px solid var(--color-accent);
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

@media (max-width: 768px) {
  .create-button {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
