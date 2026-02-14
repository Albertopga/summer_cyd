<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    @click.self="handleClose"
    @keydown.esc="handleClose"
  >
    <div class="modal-content" ref="modalRef">
      <header class="modal-header">
        <h2 id="modal-title">Editar Actividad</h2>
        <button type="button" @click="handleClose" class="close-button" aria-label="Cerrar modal">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <form @submit.prevent="handleSave" class="edit-form" novalidate>
        <div class="form-fields">
          <div v-for="field in editableFieldsConfig" :key="field.key" class="form-group">
            <label :for="`field-${field.key}`">{{ field.label }}</label>

            <!-- Campo de texto -->
            <input
              v-if="field.type === 'text'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              type="text"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo numérico -->
            <input
              v-else-if="field.type === 'number'"
              :id="`field-${field.key}`"
              v-model.number="formData[field.key]"
              type="number"
              :min="field.min"
              :max="field.max"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo de texto largo -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              rows="4"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            ></textarea>

            <!-- Select -->
            <select
              v-else-if="field.type === 'select'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            >
              <option v-for="option in field.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <span
              v-if="errors[field.key]"
              :id="`${field.key}-error`"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ errors[field.key] }}
            </span>
          </div>
        </div>

        <div v-if="status.message" class="form-status" :class="`form-status--${status.type}`">
          {{ status.message }}
        </div>

        <footer class="modal-footer">
          <button type="button" @click="handleClose" class="cancel-button">Cancelar</button>
          <button type="submit" class="save-button" :disabled="isSaving">
            <span v-if="!isSaving">Guardar cambios</span>
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
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { updateActivity } from '@/services/adminService'
import { ACTIVITY_TYPES, TIME_SLOTS, SPACE_NEEDS } from '@/constants'

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'saved'])

const isOpen = ref(false)
const isSaving = ref(false)
const modalRef = ref(null)
let previousFocus = null

const formData = reactive({})
const errors = reactive({})

const status = reactive({
  message: '',
  type: 'idle',
})

// Configuración de campos editables
const editableFieldsConfig = computed(() => {
  const config = {
    status: {
      key: 'status',
      label: 'Estado',
      type: 'select',
      isEditable: true,
      options: [
        { value: 'pending', label: 'Pendiente' },
        { value: 'approved', label: 'Aprobada' },
        { value: 'rejected', label: 'Rechazada' },
        { value: 'cancelled', label: 'Cancelada' },
      ],
    },
    type: {
      key: 'type',
      label: 'Tipo de actividad',
      type: 'select',
      isEditable: true,
      options: ACTIVITY_TYPES,
    },
    name: {
      key: 'name',
      label: 'Nombre de la actividad',
      type: 'text',
      isEditable: true,
    },
    description: {
      key: 'description',
      label: 'Descripción',
      type: 'textarea',
      isEditable: true,
    },
    min_participants: {
      key: 'min_participants',
      label: 'Mínimo de participantes',
      type: 'number',
      isEditable: true,
      min: 1,
    },
    max_participants: {
      key: 'max_participants',
      label: 'Máximo de participantes',
      type: 'number',
      isEditable: true,
      min: 1,
    },
    preferred_time_slot: {
      key: 'preferred_time_slot',
      label: 'Franja horaria preferida',
      type: 'select',
      isEditable: true,
      options: TIME_SLOTS,
    },
    duration: {
      key: 'duration',
      label: 'Duración',
      type: 'text',
      isEditable: true,
    },
    participant_needs: {
      key: 'participant_needs',
      label: 'Necesidades de los participantes',
      type: 'textarea',
      isEditable: true,
    },
    organization_needs: {
      key: 'organization_needs',
      label: 'Necesidades de la organización',
      type: 'textarea',
      isEditable: true,
    },
    space_need: {
      key: 'space_need',
      label: 'Necesidad de espacio',
      type: 'select',
      isEditable: true,
      options: SPACE_NEEDS,
    },
    setup: {
      key: 'setup',
      label: 'Puesta en marcha',
      type: 'textarea',
      isEditable: true,
    },
    observations: {
      key: 'observations',
      label: 'Observaciones',
      type: 'textarea',
      isEditable: true,
    },
    approval_notes: {
      key: 'approval_notes',
      label: 'Notas de aprobación',
      type: 'textarea',
      isEditable: true,
    },
  }

  return Object.values(config).filter((field) => field.isEditable)
})

// Inicializar formData cuando se abre el modal
watch(
  () => props.activity,
  (newActivity) => {
    if (newActivity) {
      editableFieldsConfig.value.forEach((field) => {
        const fieldKey = field.key
        const value = newActivity[fieldKey]

        if (field.type === 'number') {
          formData[fieldKey] = value !== null && value !== undefined ? Number(value) : ''
        } else if (value === null || value === undefined) {
          formData[fieldKey] = ''
        } else {
          formData[fieldKey] = value
        }
      })
      isOpen.value = true
      nextTick(() => {
        focusFirstField()
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (props.activity) {
    isOpen.value = true
    nextTick(() => {
      focusFirstField()
    })
  }
})

const focusFirstField = () => {
  if (modalRef.value) {
    const firstInput = modalRef.value.querySelector('input, select, textarea')
    if (firstInput) {
      previousFocus = document.activeElement
      firstInput.focus()
    }
  }
}

const handleClose = () => {
  isOpen.value = false
  if (previousFocus) {
    previousFocus.focus()
    previousFocus = null
  }
  emit('close')
}

const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  let isValid = true

  // Validar min_participants y max_participants
  if (formData.min_participants && formData.max_participants) {
    if (Number(formData.min_participants) > Number(formData.max_participants)) {
      errors.max_participants = 'El máximo debe ser mayor o igual al mínimo'
      isValid = false
    }
  }

  return isValid
}

const handleSave = async () => {
  if (!validateForm()) {
    status.type = 'error'
    status.message = 'Por favor, corrige los errores en el formulario'
    return
  }

  isSaving.value = true
  status.type = 'idle'
  status.message = ''

  // Preparar datos para actualizar (solo campos que han cambiado)
  const updates = {}
  editableFieldsConfig.value.forEach((field) => {
    const fieldKey = field.key
    const originalValue = props.activity[fieldKey]
    let newValue = formData[fieldKey]

    // Convertir valores según el tipo de campo
    if (field.type === 'number') {
      newValue = newValue === '' ? null : Number(newValue)
    } else if (newValue === '') {
      newValue = null
    }

    // Comparar valores
    if (originalValue !== newValue) {
      updates[fieldKey] = newValue
    }
  })

  if (Object.keys(updates).length === 0) {
    status.type = 'idle'
    status.message = 'No hay cambios para guardar'
    isSaving.value = false
    return
  }

  // Obtener lista de campos editables
  const editableFieldKeys = editableFieldsConfig.value.map((field) => field.key)
  const result = await updateActivity(props.activity.id, updates, editableFieldKeys)

  if (result.success) {
    status.type = 'success'
    status.message = 'Actividad actualizada correctamente'
    setTimeout(() => {
      emit('saved', result.data)
      handleClose()
    }, 1000)
  } else {
    status.type = 'error'
    status.message = result.error || 'Error al actualizar la actividad'
  }

  isSaving.value = false
}
</script>

<style scoped>
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
  background-color: var(--color-white);
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus-visible,
.form-group textarea:focus-visible,
.form-group select:focus-visible {
  border-color: var(--color-primary);
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.form-group textarea {
  resize: vertical;
  min-height: 4rem;
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
}

.form-status {
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 600;
  margin: 0 var(--spacing-lg);
}

.form-status--success {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.form-status--error {
  background-color: #fce8e6;
  color: var(--color-accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
}

.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.cancel-button {
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

.save-button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.save-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
</style>
