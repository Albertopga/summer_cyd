<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-modal-title"
  >
    <div class="modal-content" ref="modalRef">
      <header class="modal-header">
        <h2 id="create-modal-title">Nueva actividad (organización)</h2>
        <button type="button" @click="handleClose" class="close-button" aria-label="Cerrar modal">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <p class="modal-intro">
        Las actividades creadas aquí las da de alta el equipo organizador. No aplican el límite de
        dos actividades por correo del formulario público.
      </p>

      <form @submit.prevent="handleSave" class="edit-form" novalidate>
        <div class="form-fields">
          <div class="form-group">
            <label for="create-organizer-name">Organizador *</label>
            <input
              id="create-organizer-name"
              v-model.trim="formData.organizer_name"
              type="text"
              required
              autocomplete="name"
              :aria-invalid="errors.organizer_name ? 'true' : 'false'"
            />
            <span v-if="errors.organizer_name" class="form-error" role="alert">{{
              errors.organizer_name
            }}</span>
          </div>
          <div class="form-group">
            <label for="create-organizer-email">Email de contacto *</label>
            <input
              id="create-organizer-email"
              v-model.trim="formData.organizer_email"
              type="email"
              required
              autocomplete="email"
              :aria-invalid="errors.organizer_email ? 'true' : 'false'"
            />
            <span v-if="errors.organizer_email" class="form-error" role="alert">{{
              errors.organizer_email
            }}</span>
          </div>

          <div v-for="field in coreFields" :key="field.key" class="form-group">
            <label :for="`create-${field.key}`"
              >{{ field.label }}<span v-if="field.required" aria-hidden="true"> *</span></label
            >
            <input
              v-if="field.type === 'text'"
              :id="`create-${field.key}`"
              v-model="formData[field.key]"
              type="text"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />
            <input
              v-else-if="field.type === 'number'"
              :id="`create-${field.key}`"
              v-model.number="formData[field.key]"
              type="number"
              :min="field.min"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />
            <input
              v-else-if="field.type === 'date'"
              :id="`create-${field.key}`"
              v-model="formData[field.key]"
              type="date"
              :min="eventDateMin"
              :max="eventDateMax"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />
            <input
              v-else-if="field.type === 'time'"
              :id="`create-${field.key}`"
              v-model="formData[field.key]"
              type="time"
              step="900"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="`create-${field.key}`"
              v-model="formData[field.key]"
              rows="4"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            ></textarea>
            <select
              v-else-if="field.type === 'select'"
              :id="`create-${field.key}`"
              v-model="formData[field.key]"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            >
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <span v-if="errors[field.key]" class="form-error" role="alert">{{
              errors[field.key]
            }}</span>
            <p
              v-if="field.key === 'preferred_time_slot'"
              class="form-help"
              title="Preferencia del organizador; el horario final lo asigna la organización"
            >
              Preferencia del organizador; el horario final lo asigna la organización.
            </p>
          </div>

          <div class="form-group">
            <label for="create-documents">Documentos adjuntos (opcional)</label>
            <input
              id="create-documents"
              ref="documentsInputRef"
              class="sr-only-file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              @change="handleFileChange"
            />
            <button type="button" class="select-files-button" @click="openFilePicker">
              Seleccionar archivos
            </button>
            <p class="form-help">
              Formatos permitidos: PDF, Word e imágenes (JPG, PNG). Máximo 10MB por archivo.
            </p>
            <ul v-if="selectedFiles.length > 0" class="file-list">
              <li
                v-for="(file, index) in selectedFiles"
                :key="`${file.name}-${index}`"
                class="file-item"
              >
                <span>{{ file.name }}</span>
                <button
                  type="button"
                  class="remove-file-button"
                  :aria-label="`Eliminar archivo ${file.name}`"
                  @click="removeFile(index)"
                >
                  Eliminar
                </button>
              </li>
            </ul>
            <span v-if="errors.documents" class="form-error" role="alert">{{
              errors.documents
            }}</span>
          </div>
        </div>

        <div v-if="status.message" class="form-status" :class="`form-status--${status.type}`">
          {{ status.message }}
        </div>

        <footer class="modal-footer">
          <button type="submit" class="save-button" :disabled="isSaving">
            <span v-if="!isSaving">Crear actividad</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Guardando...
            </span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { createActivityAdmin } from '@/services/adminService'
import {
  ACTIVITY_TYPES,
  EVENT_DATES,
  SLOT_TIME_RANGES,
  TIME_SLOTS,
  SPACE_NEEDS,
  VALIDATION_PATTERNS,
  parseEventDateLocal,
} from '@/constants'

defineOptions({
  name: 'AdminActivityCreateModal',
})

const emit = defineEmits(['close', 'saved'])

const isOpen = ref(true)
const isSaving = ref(false)
const modalRef = ref(null)
const documentsInputRef = ref(null)
let previousFocus = null

const emailPattern = VALIDATION_PATTERNS.email
const eventDateMin = EVENT_DATES.start
const eventDateMax = EVENT_DATES.end

const normalizeTime = (timeValue) => String(timeValue || '').slice(0, 5)

const formData = reactive({
  organizer_name: '',
  organizer_email: '',
  name: '',
  status: 'approved',
  type: ACTIVITY_TYPES[0]?.value || 'otra',
  description: '',
  min_participants: 1,
  max_participants: 12,
  preferred_time_slot: TIME_SLOTS[0]?.value || 'sabado-tarde',
  activity_date: '',
  activity_time: '',
  duration: '',
  participant_needs: '',
  organization_needs: '',
  space_need: 'sin-requisitos',
  setup: '',
  observations: '',
})

const errors = reactive({})
const selectedFiles = ref([])

const status = reactive({
  message: '',
  type: 'idle',
})

const coreFields = [
  { key: 'name', label: 'Nombre de la actividad', type: 'text', required: true },
  {
    key: 'type',
    label: 'Tipo de actividad',
    type: 'select',
    options: ACTIVITY_TYPES,
    required: true,
  },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  {
    key: 'min_participants',
    label: 'Mínimo de participantes',
    type: 'number',
    min: 1,
    required: true,
  },
  {
    key: 'max_participants',
    label: 'Máximo de participantes',
    type: 'number',
    min: 1,
    required: true,
  },
  {
    key: 'preferred_time_slot',
    label: 'Preferencia (día/franja)',
    type: 'select',
    options: TIME_SLOTS,
    required: true,
  },
  { key: 'activity_date', label: 'Fecha de actividad', type: 'date', required: false },
  { key: 'activity_time', label: 'Hora de actividad', type: 'time', required: false },
  {
    key: 'duration',
    label: 'Duración (texto libre, ej. 2 horas)',
    type: 'text',
    required: true,
  },
  { key: 'participant_needs', label: 'Necesidades de los participantes', type: 'textarea' },
  { key: 'organization_needs', label: 'Necesidades de la organización', type: 'textarea' },
  { key: 'space_need', label: 'Necesidad de espacio', type: 'select', options: SPACE_NEEDS },
  { key: 'setup', label: 'Puesta en marcha', type: 'textarea' },
  { key: 'observations', label: 'Observaciones', type: 'textarea' },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pendiente' },
      { value: 'approved', label: 'Aprobada' },
      { value: 'rejected', label: 'Rechazada' },
      { value: 'cancelled', label: 'Cancelada' },
    ],
  },
]

onMounted(() => {
  nextTick(() => {
    const el = modalRef.value?.querySelector('#create-organizer-name')
    if (el) {
      previousFocus = document.activeElement
      el.focus()
    }
  })
})

const handleClose = () => {
  isOpen.value = false
  if (previousFocus) {
    previousFocus.focus()
    previousFocus = null
  }
  emit('close')
}

const validateForm = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
  let ok = true

  if (!formData.organizer_name.trim()) {
    errors.organizer_name = 'Obligatorio'
    ok = false
  }
  if (!formData.organizer_email.trim()) {
    errors.organizer_email = 'Obligatorio'
    ok = false
  } else if (!emailPattern.test(formData.organizer_email)) {
    errors.organizer_email = 'Formato de correo no válido'
    ok = false
  }
  if (!formData.name.trim()) {
    errors.name = 'Obligatorio'
    ok = false
  }
  if (!formData.description.trim()) {
    errors.description = 'Obligatorio'
    ok = false
  }
  if (!formData.duration.trim()) {
    errors.duration = 'Obligatorio'
    ok = false
  }
  const hasDate = Boolean(formData.activity_date)
  const hasTime = Boolean(formData.activity_time)

  if (hasDate !== hasTime) {
    if (!hasDate) {
      errors.activity_date = 'Si indicas hora, añade también la fecha'
    }
    if (!hasTime) {
      errors.activity_time = 'Si indicas fecha, añade también la hora'
    }
    ok = false
  }

  if (hasDate) {
    const selectedDate = parseEventDateLocal(formData.activity_date)
    const startDate = parseEventDateLocal(EVENT_DATES.start)
    const endDate = parseEventDateLocal(EVENT_DATES.end)
    if (selectedDate < startDate || selectedDate > endDate) {
      errors.activity_date = 'La fecha debe estar dentro de las fechas del evento'
      ok = false
    }
  }
  const selectedSlot = SLOT_TIME_RANGES[formData.preferred_time_slot]
  const normalizedTime = normalizeTime(formData.activity_time)
  if (selectedSlot && hasDate) {
    const selectedDate = parseEventDateLocal(formData.activity_date)
    if (selectedDate.getDay() !== selectedSlot.day) {
      errors.activity_date = 'La fecha no coincide con la franja horaria seleccionada'
      ok = false
    }
  }
  if (selectedSlot && hasTime) {
    if (normalizedTime < selectedSlot.start || normalizedTime > selectedSlot.end) {
      errors.activity_time = `La hora debe estar entre ${selectedSlot.start} y ${selectedSlot.end}`
      ok = false
    }
  }
  const min = Number(formData.min_participants)
  const max = Number(formData.max_participants)
  if (!Number.isFinite(min) || min < 1) {
    errors.min_participants = 'Mínimo 1'
    ok = false
  }
  if (!Number.isFinite(max) || max < 1) {
    errors.max_participants = 'Mínimo 1'
    ok = false
  }
  if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
    errors.max_participants = 'El máximo debe ser mayor o igual al mínimo'
    ok = false
  }

  if (selectedFiles.value.some((file) => file.size > 10 * 1024 * 1024)) {
    errors.documents = 'Hay archivos que superan el tamaño máximo de 10MB.'
    ok = false
  }

  return ok
}

const handleFileChange = (event) => {
  const incoming = Array.from(event.target.files || [])
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ]

  const valid = incoming.filter((file) => allowedTypes.includes(file.type))
  if (valid.length !== incoming.length) {
    errors.documents = 'Algunos archivos no tienen un formato permitido.'
  } else if (errors.documents) {
    errors.documents = ''
  }
  selectedFiles.value = [...selectedFiles.value, ...valid]
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  if (documentsInputRef.value) {
    documentsInputRef.value.value = ''
  }
}

const openFilePicker = () => {
  documentsInputRef.value?.click()
}

const handleSave = async () => {
  if (!validateForm()) {
    status.type = 'error'
    status.message = 'Revisa los campos marcados.'
    return
  }

  isSaving.value = true
  status.type = 'idle'
  status.message = ''

  const result = await createActivityAdmin({
    organizer_name: formData.organizer_name,
    organizer_email: formData.organizer_email,
    name: formData.name,
    status: formData.status,
    type: formData.type,
    description: formData.description,
    min_participants: formData.min_participants,
    max_participants: formData.max_participants,
    preferred_time_slot: formData.preferred_time_slot,
    activity_date: formData.activity_date,
    activity_time: formData.activity_time,
    duration: formData.duration,
    participant_needs: formData.participant_needs || null,
    organization_needs: formData.organization_needs || null,
    space_need: formData.space_need || null,
    setup: formData.setup || null,
    observations: formData.observations || null,
    documents: selectedFiles.value,
  })

  if (result.success) {
    status.type = 'success'
    status.message = 'Actividad creada correctamente'
    setTimeout(() => {
      emit('saved', result.data)
      handleClose()
    }, 600)
  } else {
    status.type = 'error'
    status.message = result.error || 'Error al crear la actividad'
  }

  isSaving.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  line-height: 1;
  border-radius: var(--radius-sm);
}

.close-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.modal-intro {
  margin: 0;
  padding: var(--spacing-md) var(--spacing-lg) 0;
  font-size: 0.9rem;
  color: var(--color-text-light);
  line-height: 1.45;
}

.edit-form {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.form-fields {
  padding: var(--spacing-lg);
  display: grid;
  gap: var(--spacing-md);
}

.form-group {
  display: grid;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 600;
  color: var(--color-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  font-size: 1rem;
  font-family: inherit;
}

.sr-only-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.select-files-button {
  justify-self: start;
  border: 2px solid var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-md);
  padding: 0.55rem 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.select-files-button:hover {
  background-color: var(--color-primary-dark);
}

.select-files-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.form-group input:focus-visible,
.form-group textarea:focus-visible,
.form-group select:focus-visible {
  border-color: var(--color-primary);
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
}

.form-help {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.file-list {
  margin: var(--spacing-xs) 0 0;
  padding-left: 1.25rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.file-item span {
  overflow-wrap: anywhere;
}

.remove-file-button {
  border: none;
  background: transparent;
  color: var(--color-accent);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.form-status {
  padding: var(--spacing-sm);
  margin: 0 var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.form-status--error {
  background-color: #fce8e6;
  color: var(--color-accent);
}

.form-status--success {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
}

.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.save-button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.save-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.save-button:focus-visible {
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
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-start;
    padding: var(--spacing-sm);
  }

  .modal-content {
    border-radius: var(--radius-lg);
    max-height: calc(100vh - (var(--spacing-sm) * 2));
  }

  .modal-header {
    padding: var(--spacing-md);
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .modal-intro {
    padding: var(--spacing-sm) var(--spacing-md) 0;
  }

  .form-fields,
  .modal-footer {
    padding: var(--spacing-md);
  }

  .form-status {
    margin: 0 var(--spacing-md);
  }

  .modal-footer {
    justify-content: stretch;
  }

  .save-button {
    width: 100%;
  }
}
</style>
