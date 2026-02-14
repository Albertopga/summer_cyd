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
        <h2 id="modal-title">{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
        <button type="button" @click="handleClose" class="close-button" aria-label="Cerrar modal">
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <form @submit.prevent="handleSave" class="edit-form" novalidate>
        <div class="form-fields">
          <div class="form-group">
            <label for="user-email">Correo electrónico *</label>
            <input
              id="user-email"
              v-model.trim="formData.email"
              type="email"
              required
              aria-required="true"
              autocomplete="email"
              :disabled="isEditMode"
              :aria-describedby="errors.email ? 'email-error' : undefined"
              :aria-invalid="errors.email ? 'true' : 'false'"
            />
            <span
              v-if="errors.email"
              id="email-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ errors.email }}
            </span>
            <p v-if="isEditMode" class="form-help">
              El email no se puede modificar una vez creado el usuario.
            </p>
          </div>

          <div v-if="!isEditMode" class="form-group">
            <label for="user-password">Contraseña *</label>
            <input
              id="user-password"
              v-model.trim="formData.password"
              type="password"
              required
              aria-required="true"
              autocomplete="new-password"
              minlength="6"
              :aria-describedby="errors.password ? 'password-error' : undefined"
              :aria-invalid="errors.password ? 'true' : 'false'"
            />
            <span
              v-if="errors.password"
              id="password-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ errors.password }}
            </span>
            <p class="form-help">Mínimo 6 caracteres.</p>
          </div>

          <div v-if="isEditMode" class="form-group">
            <label for="user-new-password">Nueva contraseña</label>
            <input
              id="user-new-password"
              v-model.trim="formData.newPassword"
              type="password"
              autocomplete="new-password"
              minlength="6"
              :aria-describedby="errors.newPassword ? 'new-password-error' : undefined"
              :aria-invalid="errors.newPassword ? 'true' : 'false'"
            />
            <span
              v-if="errors.newPassword"
              id="new-password-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ errors.newPassword }}
            </span>
            <p class="form-help">
              Deja en blanco si no quieres cambiar la contraseña. Mínimo 6 caracteres.
            </p>
          </div>

          <div v-if="isEditMode" class="form-group">
            <p class="form-info">
              <strong>Nota:</strong> Solo puedes actualizar tu propia contraseña. Los cambios se
              guardan <strong>realmente en Supabase</strong> y afectan a tu cuenta de inmediato.
            </p>
            <p class="form-info">
              Para gestionar otros usuarios (confirmar email, cambiar contraseña, eliminar, etc.),
              usa el dashboard de Supabase.
            </p>
          </div>
        </div>

        <div v-if="status.message" class="form-status" :class="`form-status--${status.type}`">
          {{ status.message }}
        </div>

        <footer class="modal-footer">
          <button type="button" @click="handleClose" class="cancel-button">Cancelar</button>
          <button type="submit" class="save-button" :disabled="isSaving">
            <span v-if="!isSaving">{{ isEditMode ? 'Guardar cambios' : 'Crear usuario' }}</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              {{ isEditMode ? 'Guardando...' : 'Creando...' }}
            </span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { createUser, updateUser } from '@/services/adminService'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const isEditMode = computed(() => !!props.user)

const isOpen = ref(false)
const isSaving = ref(false)
const modalRef = ref(null)
let previousFocus = null

const formData = reactive({
  email: '',
  password: '',
  newPassword: '',
})

const errors = reactive({
  email: '',
  password: '',
  newPassword: '',
  email_confirm: '',
})

const status = reactive({
  message: '',
  type: 'idle',
})

// Inicializar formData cuando se abre el modal
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.email = newUser.email || ''
      formData.password = ''
      formData.newPassword = ''
    } else {
      formData.email = ''
      formData.password = ''
      formData.newPassword = ''
    }
    isOpen.value = true
    nextTick(() => {
      focusFirstField()
    })
  },
  { immediate: true },
)

onMounted(() => {
  if (props.user || !isEditMode.value) {
    isOpen.value = true
    nextTick(() => {
      focusFirstField()
    })
  }
})

const focusFirstField = () => {
  if (modalRef.value) {
    const firstInput = modalRef.value.querySelector('input:not([disabled])')
    if (firstInput) {
      previousFocus = document.activeElement
      firstInput.focus()
    }
  }
}

const handleClose = () => {
  isOpen.value = false
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  status.message = ''
  status.type = 'idle'
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

  if (!formData.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'El correo electrónico no es válido'
    isValid = false
  }

  if (!isEditMode.value) {
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es obligatoria'
      isValid = false
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres'
      isValid = false
    }
  } else {
    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres'
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

  try {
    if (isEditMode.value) {
      // Actualizar usuario existente (solo contraseña del usuario actual)
      if (!formData.newPassword) {
        status.type = 'idle'
        status.message = 'No hay cambios para guardar'
        isSaving.value = false
        return
      }

      const result = await updateUser(props.user.id, {
        password: formData.newPassword,
      })

      if (result.success) {
        status.type = 'success'
        status.message = 'Contraseña actualizada correctamente'
        setTimeout(() => {
          emit('saved', result.user)
          handleClose()
        }, 1000)
      } else {
        status.type = 'error'
        status.message = result.error || 'Error al actualizar la contraseña'
      }
    } else {
      // Crear nuevo usuario (requiere confirmación de email)
      const result = await createUser(formData.email, formData.password)

      if (result.success) {
        status.type = 'success'
        status.message =
          'Usuario creado correctamente. El usuario recibirá un email para confirmar su cuenta antes de poder iniciar sesión.'
        setTimeout(() => {
          emit('saved', result.user)
          handleClose()
        }, 2000)
      } else {
        status.type = 'error'
        status.message = result.error || 'Error al crear el usuario'
      }
    }
  } catch (error) {
    status.type = 'error'
    status.message = error.message || 'Error inesperado'
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
  max-width: 500px;
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  background-color: var(--color-white);
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus-visible {
  border-color: var(--color-primary);
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.form-group input:disabled {
  background-color: var(--color-cream);
  cursor: not-allowed;
}

.form-help {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}

.form-info {
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: var(--color-cream);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin: 0;
}

.checkbox-single {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox-single input[type='checkbox'] {
  width: auto;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label {
  font-weight: 400;
  cursor: pointer;
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
