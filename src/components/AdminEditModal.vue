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
        <h2 id="modal-title">Editar Registro</h2>
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

            <!-- Campo de email -->
            <input
              v-else-if="field.type === 'email'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              type="email"
              autocomplete="email"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo de teléfono -->
            <input
              v-else-if="field.type === 'tel'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              type="tel"
              inputmode="tel"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo de fecha -->
            <input
              v-else-if="field.type === 'date'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              type="date"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo de fecha y hora -->
            <input
              v-else-if="field.type === 'datetime-local'"
              :id="`field-${field.key}`"
              v-model="formData[field.key]"
              type="datetime-local"
              :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
              :aria-invalid="errors[field.key] ? 'true' : 'false'"
            />

            <!-- Campo checkbox simple -->
            <div v-else-if="field.type === 'checkbox'" class="checkbox-single">
              <input
                :id="`field-${field.key}`"
                v-model="formData[field.key]"
                type="checkbox"
                :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
                :aria-invalid="errors[field.key] ? 'true' : 'false'"
              />
              <label :for="`field-${field.key}`" class="checkbox-label">
                {{ field.label }}
              </label>
            </div>

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

            <!-- Checkboxes múltiples -->
            <div v-else-if="field.type === 'checkbox-group'" class="checkbox-group">
              <div v-for="option in field.options" :key="option.value" class="checkbox-item">
                <input
                  :id="`${field.key}-${option.value}`"
                  v-model="formData[field.key]"
                  type="checkbox"
                  :value="option.value"
                />
                <label :for="`${field.key}-${option.value}`">{{ option.label }}</label>
              </div>
            </div>

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
import { updateRegistration } from '@/services/adminService'
import { ACCOMMODATION_OPTIONS, DIET_OPTIONS } from '@/constants'

const props = defineProps({
  registration: {
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

// Configuración de campos con sus tipos, opciones y si son editables
const editableFieldsConfig = computed(() => {
  const config = {
    first_name: {
      key: 'first_name',
      label: 'Nombre',
      type: 'text',
      isEditable: true,
    },
    last_name: {
      key: 'last_name',
      label: 'Apellidos',
      type: 'text',
      isEditable: true,
    },
    nickname: {
      key: 'nickname',
      label: 'Mote/Alias',
      type: 'text',
      isEditable: true,
    },
    email: {
      key: 'email',
      label: 'Correo electrónico',
      type: 'email',
      isEditable: true,
    },
    phone: {
      key: 'phone',
      label: 'Teléfono',
      type: 'tel',
      isEditable: true,
    },
    birth_date: {
      key: 'birth_date',
      label: 'Fecha de nacimiento',
      type: 'date',
      isEditable: true,
    },
    is_minor: {
      key: 'is_minor',
      label: 'Es menor de edad',
      type: 'checkbox',
      isEditable: true,
    },
    emergency_contact_name: {
      key: 'emergency_contact_name',
      label: 'Contacto de emergencia (nombre)',
      type: 'text',
      isEditable: true,
    },
    emergency_contact_phone: {
      key: 'emergency_contact_phone',
      label: 'Contacto de emergencia (teléfono)',
      type: 'tel',
      isEditable: true,
    },
    arrival_date: {
      key: 'arrival_date',
      label: 'Fecha de llegada',
      type: 'datetime-local',
      isEditable: true,
    },
    departure_date: {
      key: 'departure_date',
      label: 'Fecha de salida',
      type: 'datetime-local',
      isEditable: true,
    },
    accommodation: {
      key: 'accommodation',
      label: 'Alojamiento',
      type: 'select',
      isEditable: true,
      options: ACCOMMODATION_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    },
    diet: {
      key: 'diet',
      label: 'Restricciones alimentarias',
      type: 'checkbox-group',
      isEditable: true,
      options: DIET_OPTIONS,
    },
    comments: {
      key: 'comments',
      label: 'Comentarios adicionales',
      type: 'textarea',
      isEditable: true,
    },
    diet_comments: {
      key: 'diet_comments',
      label: 'Comentarios sobre dieta',
      type: 'textarea',
      isEditable: true,
    },
    terms_accepted: {
      key: 'terms_accepted',
      label: 'Términos aceptados',
      type: 'checkbox',
      isEditable: true,
    },
    accommodation_paid: {
      key: 'accommodation_paid',
      label: 'Alojamiento pagado',
      type: 'checkbox',
      isEditable: true,
    },
  }

  // Filtrar solo los campos editables
  return Object.values(config).filter((field) => field.isEditable)
})

// Función helper para convertir fecha a formato datetime-local
const formatDateTimeLocal = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  // Formato: YYYY-MM-DDTHH:mm
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Función helper para convertir fecha a formato date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  // Formato: YYYY-MM-DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Inicializar formData cuando se abre el modal
watch(
  () => props.registration,
  (newRegistration) => {
    if (newRegistration) {
      // Inicializar solo los campos editables con conversión de tipos
      editableFieldsConfig.value.forEach((field) => {
        const fieldKey = field.key
        const value = newRegistration[fieldKey]

        // Manejar arrays (diet)
        if (fieldKey === 'diet' && Array.isArray(value)) {
          formData[fieldKey] = [...value]
        }
        // Manejar booleanos (is_minor, terms_accepted)
        else if (fieldKey === 'is_minor' || fieldKey === 'terms_accepted') {
          formData[fieldKey] = Boolean(value)
        }
        // Manejar fechas datetime-local (arrival_date, departure_date)
        else if (fieldKey === 'arrival_date' || fieldKey === 'departure_date') {
          formData[fieldKey] = formatDateTimeLocal(value) || ''
        }
        // Manejar fecha date (birth_date)
        else if (fieldKey === 'birth_date') {
          formData[fieldKey] = formatDate(value) || ''
        }
        // Resto de campos (text, email, tel, textarea, select)
        else {
          formData[fieldKey] = value || ''
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
  if (props.registration) {
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
  // Limpiar errores y estado
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  status.message = ''
  status.type = 'idle'
  // Restaurar foco
  if (previousFocus) {
    previousFocus.focus()
  }
  emit('close')
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  // Validaciones básicas según el tipo de campo
  editableFieldsConfig.value.forEach((field) => {
    const value = formData[field.key]

    if (field.type === 'tel' && value && !/^[0-9+\s()-]{9,15}$/.test(value)) {
      errors[field.key] = 'Formato de teléfono inválido'
      isValid = false
    }

    if (field.type === 'datetime-local' && value) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        errors[field.key] = 'Fecha inválida'
        isValid = false
      }
    }
  })

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
    const originalValue = props.registration[fieldKey]
    let newValue = formData[fieldKey]

    // Convertir valores según el tipo de campo antes de comparar
    if (fieldKey === 'birth_date' && newValue) {
      // Convertir de formato date (YYYY-MM-DD) a DATE
      newValue = newValue // Ya está en formato correcto para PostgreSQL
    } else if ((fieldKey === 'arrival_date' || fieldKey === 'departure_date') && newValue) {
      // Convertir de datetime-local a ISO string para TIMESTAMPTZ
      const date = new Date(newValue)
      if (!isNaN(date.getTime())) {
        newValue = date.toISOString()
      } else {
        newValue = null
      }
    } else if (fieldKey === 'is_minor' || fieldKey === 'terms_accepted') {
      // Asegurar que sea boolean
      newValue = Boolean(newValue)
    } else if (fieldKey === 'diet') {
      // Asegurar que sea array
      newValue = Array.isArray(newValue) ? newValue : []
    } else if (newValue === '') {
      // Convertir strings vacíos a null para campos opcionales
      newValue = null
    }

    // Comparar valores (manejar arrays para diet)
    if (fieldKey === 'diet') {
      const originalArray = Array.isArray(originalValue) ? [...originalValue].sort() : []
      const newArray = Array.isArray(newValue) ? [...newValue].sort() : []
      if (JSON.stringify(originalArray) !== JSON.stringify(newArray)) {
        updates[fieldKey] = newValue
      }
    } else if (fieldKey === 'is_minor' || fieldKey === 'terms_accepted') {
      // Comparar booleanos
      if (Boolean(originalValue) !== Boolean(newValue)) {
        updates[fieldKey] = newValue
      }
    } else if (originalValue !== newValue) {
      updates[fieldKey] = newValue
    }
  })

  if (Object.keys(updates).length === 0) {
    status.type = 'idle'
    status.message = 'No hay cambios para guardar'
    isSaving.value = false
    return
  }

  // Obtener lista de campos editables para pasar al servicio
  const editableFieldKeys = editableFieldsConfig.value.map((field) => field.key)
  const result = await updateRegistration(props.registration.id, updates, editableFieldKeys)

  if (result.success) {
    status.type = 'success'
    status.message = 'Registro actualizado correctamente'
    setTimeout(() => {
      emit('saved', result.data)
      handleClose()
    }, 1000)
  } else {
    status.type = 'error'
    status.message = result.error || 'Error al actualizar el registro'
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
  line-height: 1;
  color: var(--color-text);
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
  flex: 1;
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

.checkbox-group {
  display: grid;
  gap: var(--spacing-sm);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-item input[type='checkbox'] {
  width: auto;
}

.checkbox-single {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-single input[type='checkbox'] {
  width: auto;
}

.checkbox-label {
  font-weight: normal;
  margin: 0;
  cursor: pointer;
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
}

.form-status {
  margin: 0 var(--spacing-lg);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.form-status--success {
  background-color: var(--color-accent-bg);
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
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.cancel-button {
  background-color: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-cream-dark);
}

.cancel-button:hover {
  background-color: var(--color-cream);
}

.save-button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.save-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button:focus-visible,
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
  .modal-overlay {
    padding: var(--spacing-sm);
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }
}
</style>
