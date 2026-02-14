<template>
  <section class="section registration">
    <div class="container">
      <nav class="registration-nav" aria-label="Navegación">
        <RouterLink to="/registration" class="back-link">
          <span aria-hidden="true">←</span>
          Volver al registro
        </RouterLink>
      </nav>

      <AppSectionHeader label="Organización de actividades" title="Registra tu actividad" />

      <p class="registration-intro">
        Si quieres organizar alguna actividad durante el Retiro Lúdico, completa este formulario.
        Por motivos organizativos y para dar opción a que todos los participantes puedan tanto
        organizar como disfrutar de las actividades, limitamos a 2 el número de actividades a
        dirigir por cada participante.
      </p>

      <form
        id="activity-registration-form"
        class="registration-form"
        @submit.prevent="handleSubmit"
        novalidate
      >
        <fieldset class="form-fieldset">
          <legend>Datos del organizador</legend>
          <p class="form-help" style="margin-bottom: var(--spacing-md)">
            Introduce tu nombre y email para vincular las actividades con tu registro. El email debe
            ser el mismo que usaste al registrarte.
          </p>

          <div class="form-row-group">
            <div class="form-row">
              <label for="organizerName">Nombre del Organizador *</label>
              <input
                id="organizerName"
                v-model.trim="form.organizerName"
                type="text"
                name="organizerName"
                required
                aria-required="true"
                :aria-invalid="errors.organizerName ? 'true' : 'false'"
                :aria-describedby="'organizerName-error'"
                placeholder="Nombre completo"
                @blur="validateOrganizerName"
              />
              <span
                id="organizerName-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.organizerName }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.organizerName || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label for="organizerEmail">Email del organizador *</label>
              <input
                id="organizerEmail"
                v-model.trim="form.organizerEmail"
                type="email"
                name="organizerEmail"
                required
                aria-required="true"
                :aria-invalid="errors.organizerEmail ? 'true' : 'false'"
                :aria-describedby="'organizerEmail-error'"
                placeholder="tu@email.com"
                @blur="validateOrganizerEmail"
              />
              <span
                id="organizerEmail-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.organizerEmail }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.organizerEmail || '&nbsp;' }}
              </span>
            </div>
          </div>
        </fieldset>

        <div v-if="form.activities.length === 0" class="no-activities">
          <p>No has añadido ninguna actividad todavía.</p>
          <button type="button" class="add-activity-button" @click="addActivity">
            + Añadir primera actividad
          </button>
        </div>

        <div v-else class="activities-container">
          <div v-for="(activity, index) in form.activities" :key="index" class="activity-form">
            <h3 class="activity-form-title">Actividad {{ index + 1 }}</h3>

            <div class="form-row">
              <label :for="`activityType-${index}`">
                Tipo de Actividad *
                <span class="legend-note"
                  >(Rol en Vivo: mínimo viable igual o inferior a 15 participantes)</span
                >
              </label>
              <select
                :id="`activityType-${index}`"
                v-model="activity.type"
                :name="`activityType-${index}`"
                required
                aria-required="true"
                :aria-invalid="errors[`activities.${index}.type`] ? 'true' : 'false'"
                :aria-describedby="`activityType-${index}-error`"
                @change="() => validateActivityField(index, 'type')"
              >
                <option value="">Selecciona un tipo</option>
                <option v-for="option in ACTIVITY_TYPES" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <span
                :id="`activityType-${index}-error`"
                class="form-error"
                :class="{ 'form-error-hidden': !errors[`activities.${index}.type`] }"
                role="alert"
                aria-live="polite"
              >
                {{ errors[`activities.${index}.type`] || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label :for="`activityName-${index}`">Nombre de la actividad *</label>
              <input
                :id="`activityName-${index}`"
                v-model.trim="activity.name"
                type="text"
                :name="`activityName-${index}`"
                required
                aria-required="true"
                :aria-invalid="errors[`activities.${index}.name`] ? 'true' : 'false'"
                :aria-describedby="`activityName-${index}-error`"
                @blur="() => validateActivityField(index, 'name')"
              />
              <span
                :id="`activityName-${index}-error`"
                class="form-error"
                :class="{ 'form-error-hidden': !errors[`activities.${index}.name`] }"
                role="alert"
                aria-live="polite"
              >
                {{ errors[`activities.${index}.name`] || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <div class="form-row-group">
                <div class="form-row form-row-inline">
                  <label :for="`activityMinParticipants-${index}`"
                    >Mínimo viable de participantes <span class="help-indicator">(1)</span>*</label
                  >
                  <input
                    :id="`activityMinParticipants-${index}`"
                    v-model.number="activity.minParticipants"
                    type="number"
                    :name="`activityMinParticipants-${index}`"
                    min="1"
                    required
                    aria-required="true"
                    :aria-invalid="errors[`activities.${index}.minParticipants`] ? 'true' : 'false'"
                    :aria-describedby="`activityMinParticipants-${index}-error activityMinParticipants-${index}-help`"
                    @blur="() => validateActivityField(index, 'minParticipants')"
                  />
                  <span
                    :id="`activityMinParticipants-${index}-error`"
                    class="form-error"
                    :class="{
                      'form-error-hidden': !errors[`activities.${index}.minParticipants`],
                    }"
                    role="alert"
                    aria-live="polite"
                  >
                    {{ errors[`activities.${index}.minParticipants`] || '&nbsp;' }}
                  </span>
                </div>

                <div class="form-row form-row-inline">
                  <label :for="`activityMaxParticipants-${index}`">Máximo de participantes *</label>
                  <input
                    :id="`activityMaxParticipants-${index}`"
                    v-model.number="activity.maxParticipants"
                    type="number"
                    :name="`activityMaxParticipants-${index}`"
                    min="1"
                    required
                    aria-required="true"
                    :aria-invalid="errors[`activities.${index}.maxParticipants`] ? 'true' : 'false'"
                    :aria-describedby="`activityMaxParticipants-${index}-error`"
                    @blur="() => validateActivityField(index, 'maxParticipants')"
                  />
                  <span
                    :id="`activityMaxParticipants-${index}-error`"
                    class="form-error"
                    :class="{
                      'form-error-hidden': !errors[`activities.${index}.maxParticipants`],
                    }"
                    role="alert"
                    aria-live="polite"
                  >
                    {{ errors[`activities.${index}.maxParticipants`] || '&nbsp;' }}
                  </span>
                </div>
              </div>
              <p :id="`activityMinParticipants-${index}-help`" class="form-help">
                <span class="help-indicator">(1)</span> El mínimo de personas necesarias para que la
                actividad se pueda desarrollar correctamente. La actividad solo se realizará si se
                alcanza este número de participantes.
              </p>
            </div>

            <div class="form-row">
              <label :for="`activityDescription-${index}`">Descripción *</label>
              <textarea
                :id="`activityDescription-${index}`"
                v-model.trim="activity.description"
                :name="`activityDescription-${index}`"
                rows="4"
                required
                aria-required="true"
                :aria-invalid="errors[`activities.${index}.description`] ? 'true' : 'false'"
                :aria-describedby="`activityDescription-${index}-error`"
                maxlength="1000"
                @blur="() => validateActivityField(index, 'description')"
              ></textarea>
              <span
                :id="`activityDescription-${index}-error`"
                class="form-error"
                :class="{ 'form-error-hidden': !errors[`activities.${index}.description`] }"
                role="alert"
                aria-live="polite"
              >
                {{ errors[`activities.${index}.description`] || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label :for="`activityPreferredTimeSlot-${index}`"
                >Franja horaria preferida *
                <span class="legend-note"
                  >(La organización intentará respetar tus preferencias)</span
                ></label
              >
              <select
                :id="`activityPreferredTimeSlot-${index}`"
                v-model="activity.preferredTimeSlot"
                :name="`activityPreferredTimeSlot-${index}`"
                required
                aria-required="true"
                :aria-invalid="errors[`activities.${index}.preferredTimeSlot`] ? 'true' : 'false'"
                :aria-describedby="`activityPreferredTimeSlot-${index}-error`"
                @change="() => validateActivityField(index, 'preferredTimeSlot')"
              >
                <option value="">Selecciona una franja horaria</option>
                <option v-for="option in TIME_SLOTS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <span
                :id="`activityPreferredTimeSlot-${index}-error`"
                class="form-error"
                :class="{
                  'form-error-hidden': !errors[`activities.${index}.preferredTimeSlot`],
                }"
                role="alert"
                aria-live="polite"
              >
                {{ errors[`activities.${index}.preferredTimeSlot`] || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label :for="`activityDuration-${index}`">Duración de la actividad *</label>
              <input
                :id="`activityDuration-${index}`"
                v-model.trim="activity.duration"
                type="text"
                :name="`activityDuration-${index}`"
                placeholder="Ej: 2 horas, 3 horas, 4 horas..."
                required
                aria-required="true"
                :aria-invalid="errors[`activities.${index}.duration`] ? 'true' : 'false'"
                :aria-describedby="`activityDuration-${index}-error`"
                @blur="() => validateActivityField(index, 'duration')"
              />
              <span
                :id="`activityDuration-${index}-error`"
                class="form-error"
                :class="{ 'form-error-hidden': !errors[`activities.${index}.duration`] }"
                role="alert"
                aria-live="polite"
              >
                {{ errors[`activities.${index}.duration`] || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label :for="`activityParticipantNeeds-${index}`"
                >Necesidades a cubrir por los participantes</label
              >
              <textarea
                :id="`activityParticipantNeeds-${index}`"
                v-model.trim="activity.participantNeeds"
                :name="`activityParticipantNeeds-${index}`"
                rows="3"
                maxlength="500"
                :aria-describedby="`activityParticipantNeeds-${index}-help`"
              ></textarea>
              <p :id="`activityParticipantNeeds-${index}-help`" class="form-help">
                Indica qué necesitan traer o preparar los participantes (materiales, personajes,
                etc.)
              </p>
            </div>

            <div class="form-row">
              <label :for="`activityOrganizationNeeds-${index}`"
                >Necesidades a cubrir por la organización del evento</label
              >
              <textarea
                :id="`activityOrganizationNeeds-${index}`"
                v-model.trim="activity.organizationNeeds"
                :name="`activityOrganizationNeeds-${index}`"
                rows="3"
                maxlength="500"
                :aria-describedby="`activityOrganizationNeeds-${index}-help`"
              ></textarea>
              <p :id="`activityOrganizationNeeds-${index}-help`" class="form-help">
                Indica qué necesitas que proporcione la organización (espacios, materiales,
                equipamiento, etc.)
              </p>
            </div>

            <div class="form-row">
              <label :for="`activityDocuments-${index}`"
                >Documentos para imprimir (si es necesario)</label
              >
              <input
                :id="`activityDocuments-${index}`"
                :ref="`fileInput-${index}`"
                type="file"
                :name="`activityDocuments-${index}`"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                :aria-describedby="`activityDocuments-${index}-help`"
                @change="(e) => handleFileChange(index, e)"
              />
              <p :id="`activityDocuments-${index}-help`" class="form-help">
                Si necesitas que la organización imprima algún documento para tu actividad, súbelo
                aquí. Formatos aceptados: PDF, Word, imágenes (JPG, PNG). Máximo 10MB por archivo.
              </p>
              <div v-if="activity.documents && activity.documents.length > 0" class="file-list">
                <p class="file-list-title">Archivos seleccionados:</p>
                <ul class="file-list-items">
                  <li
                    v-for="(file, fileIndex) in activity.documents"
                    :key="fileIndex"
                    class="file-item"
                  >
                    <span class="file-name">{{ file.name }}</span>
                    <button
                      type="button"
                      class="file-remove"
                      @click="removeFile(index, fileIndex)"
                      :aria-label="`Eliminar archivo ${file.name}`"
                    >
                      ✕
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-row">
              <label :for="`activitySpaceNeed-${index}`">Necesidad de espacio</label>
              <select
                :id="`activitySpaceNeed-${index}`"
                v-model="activity.spaceNeed"
                :name="`activitySpaceNeed-${index}`"
              >
                <option value="">Selecciona una opción</option>
                <option v-for="option in SPACE_NEEDS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="form-row">
              <label :for="`activitySetup-${index}`">Puesta en Marcha</label>
              <textarea
                :id="`activitySetup-${index}`"
                v-model.trim="activity.setup"
                :name="`activitySetup-${index}`"
                rows="3"
                maxlength="500"
                :aria-describedby="`activitySetup-${index}-help`"
              ></textarea>
              <p :id="`activitySetup-${index}-help`" class="form-help">
                Describe cómo se prepara o monta la actividad
              </p>
            </div>

            <div class="form-row">
              <label :for="`activityObservations-${index}`">Observaciones</label>
              <textarea
                :id="`activityObservations-${index}`"
                v-model.trim="activity.observations"
                :name="`activityObservations-${index}`"
                rows="3"
                maxlength="500"
                :aria-describedby="`activityObservations-${index}-help`"
              ></textarea>
              <p :id="`activityObservations-${index}-help`" class="form-help">
                Cualquier información adicional que consideres relevante. Código "TORRIJAS" en
                observaciones para descuento de Asociación.
              </p>
            </div>

            <button
              v-if="form.activities.length > 1"
              type="button"
              class="remove-activity-button"
              @click="removeActivity(index)"
              aria-label="Eliminar actividad"
            >
              Eliminar actividad
            </button>
          </div>

          <button
            v-if="form.activities.length < 2"
            type="button"
            class="add-activity-button"
            @click="addActivity"
          >
            + Añadir otra actividad (máximo 2)
          </button>

          <p class="form-help" style="margin-top: var(--spacing-md)">
            <strong>Nota importante:</strong> Las actividades deberán alcanzar el mínimo de
            participantes para poder realizarse. La Organización limita la inscripción para
            participar en una actividad por franja horaria, para que no se solapen. Se tendrá en
            cuenta la hora de inicio de la actividad + la duración de la actividad + 30 minutos de
            margen. Para realizar las actividades se debe cumplimentar el formulario de actividad
            pertinente y tener el visto bueno de la organización.
          </p>
        </div>

        <div
          v-if="status.message"
          :class="['status-message', `status-${status.type}`]"
          role="alert"
        >
          {{ status.message }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleReset">
            Limpiar formulario
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Enviar actividades</span>
            <span v-else>Enviando...</span>
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import { ACTIVITY_TYPES, SPACE_NEEDS, TIME_SLOTS, VALIDATION_PATTERNS } from '@/constants'
import { saveActivities } from '@/services/activityService'

const emailPattern = VALIDATION_PATTERNS.email

defineOptions({
  name: 'ActivityRegistrationView',
})

const form = reactive({
  organizerName: '',
  organizerEmail: '',
  activities: [],
})

const errors = reactive({
  organizerName: '',
  organizerEmail: '',
})

const status = reactive({
  message: '',
  type: 'idle',
})

const isSubmitting = ref(false)

const createEmptyActivity = () => ({
  type: '',
  name: '',
  minParticipants: null,
  maxParticipants: null,
  description: '',
  preferredTimeSlot: '',
  duration: '',
  participantNeeds: '',
  organizationNeeds: '',
  spaceNeed: '',
  setup: '',
  observations: '',
  documents: [],
})

const addActivity = () => {
  if (form.activities.length < 2) {
    form.activities.push(createEmptyActivity())
  }
}

const removeActivity = (index) => {
  if (form.activities.length > 0) {
    form.activities.splice(index, 1)
    // Limpiar errores de la actividad eliminada
    Object.keys(errors).forEach((key) => {
      if (key.startsWith(`activities.${index}`)) {
        delete errors[key]
      }
    })
  }
}

const clearStatus = () => {
  status.type = 'idle'
  status.message = ''
}

const validateOrganizerName = () => {
  clearStatus()
  if (!form.organizerName.trim()) {
    errors.organizerName = 'El nombre del organizador es obligatorio.'
    return false
  }
  errors.organizerName = ''
  return true
}

const validateOrganizerEmail = () => {
  clearStatus()
  if (!form.organizerEmail.trim()) {
    errors.organizerEmail = 'El email del organizador es obligatorio.'
    return false
  }
  if (!emailPattern.test(form.organizerEmail)) {
    errors.organizerEmail = 'Revisa el formato del correo electrónico.'
    return false
  }
  errors.organizerEmail = ''
  return true
}

const handleFileChange = (activityIndex, event) => {
  const files = Array.from(event.target.files)
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ]

  const validFiles = files.filter((file) => {
    if (file.size > maxSize) {
      alert(`El archivo ${file.name} excede el tamaño máximo de 10MB.`)
      return false
    }
    if (!allowedTypes.includes(file.type)) {
      alert(`El archivo ${file.name} no es un formato válido.`)
      return false
    }
    return true
  })

  if (!form.activities[activityIndex].documents) {
    form.activities[activityIndex].documents = []
  }
  form.activities[activityIndex].documents.push(...validFiles)
}

const removeFile = (activityIndex, fileIndex) => {
  form.activities[activityIndex].documents.splice(fileIndex, 1)
  // Resetear el input de archivos
  const fileInput = document.getElementById(`activityDocuments-${activityIndex}`)
  if (fileInput) {
    fileInput.value = ''
  }
}

const validateActivityField = (activityIndex, field) => {
  clearStatus()
  const activity = form.activities[activityIndex]
  if (!activity) return false

  const errorKey = `activities.${activityIndex}.${field}`

  switch (field) {
    case 'type':
      if (!activity.type) {
        errors[errorKey] = 'Selecciona un tipo de actividad.'
        return false
      }
      // Validar límite de participantes para Rol en Vivo (solo si ya tiene minParticipants)
      if (
        activity.type === 'rol-vivo' &&
        activity.minParticipants !== null &&
        activity.minParticipants > 15
      ) {
        errors[errorKey] =
          'La organización permitirá roles en vivo cuyo mínimo viable sea igual o inferior a 15 participantes.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'name':
      if (!activity.name.trim()) {
        errors[errorKey] = 'El nombre de la actividad es obligatorio.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'minParticipants':
      if (!activity.minParticipants || activity.minParticipants < 1) {
        errors[errorKey] = 'El mínimo de participantes debe ser al menos 1.'
        return false
      }
      if (activity.maxParticipants && activity.minParticipants > activity.maxParticipants) {
        errors[errorKey] =
          'El mínimo de participantes no puede ser mayor que el máximo de participantes.'
        return false
      }
      // Validar límite para Rol en Vivo
      if (activity.type === 'rol-vivo' && activity.minParticipants > 15) {
        errors[errorKey] =
          'La organización permitirá roles en vivo cuyo mínimo viable sea igual o inferior a 15 participantes.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'maxParticipants':
      if (!activity.maxParticipants || activity.maxParticipants < 1) {
        errors[errorKey] = 'El máximo de participantes debe ser al menos 1.'
        return false
      }
      if (activity.minParticipants && activity.minParticipants > activity.maxParticipants) {
        errors[errorKey] =
          'El máximo de participantes no puede ser menor que el mínimo de participantes.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'description':
      if (!activity.description.trim()) {
        errors[errorKey] = 'La descripción es obligatoria.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'preferredTimeSlot':
      if (!activity.preferredTimeSlot) {
        errors[errorKey] = 'Selecciona una franja horaria preferida.'
        return false
      }
      errors[errorKey] = ''
      return true

    case 'duration':
      if (!activity.duration.trim()) {
        errors[errorKey] = 'La duración de la actividad es obligatoria.'
        return false
      }
      errors[errorKey] = ''
      return true

    default:
      return true
  }
}

const validateActivities = () => {
  if (form.activities.length === 0) {
    return false
  }

  let isValid = true
  const requiredFields = [
    'type',
    'organizerName',
    'name',
    'minParticipants',
    'maxParticipants',
    'description',
    'preferredTimeSlot',
    'duration',
  ]

  form.activities.forEach((activity, index) => {
    requiredFields.forEach((field) => {
      const fieldValid = validateActivityField(index, field)
      if (!fieldValid) {
        isValid = false
      }
    })
  })

  return isValid
}

const handleSubmit = async () => {
  clearStatus()

  // Validar datos del organizador primero
  const nameValid = validateOrganizerName()
  const emailValid = validateOrganizerEmail()
  if (!nameValid || !emailValid) {
    status.type = 'error'
    status.message = 'Por favor, completa correctamente los datos del organizador.'
    const nameInput = document.getElementById('organizerName')
    const emailInput = document.getElementById('organizerEmail')
    if (nameInput && !nameValid) {
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      nameInput.focus()
    } else if (emailInput && !emailValid) {
      emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      emailInput.focus()
    }
    return
  }

  if (form.activities.length === 0) {
    status.type = 'error'
    status.message = 'Debes añadir al menos una actividad antes de enviar.'
    return
  }

  const isValid = validateActivities()

  if (!isValid) {
    status.type = 'error'
    status.message =
      'Por favor, completa todos los campos obligatorios correctamente antes de enviar.'
    // Scroll al primer error
    const firstError = document.querySelector('[aria-invalid="true"]')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstError.focus()
    }
    return
  }

  isSubmitting.value = true
  status.type = 'idle'
  status.message = ''

  try {
    const result = await saveActivities(form.organizerName, form.organizerEmail, form.activities)

    if (result.success) {
      status.type = 'success'
      status.message =
        '¡Gracias! Hemos recibido tu solicitud de actividades correctamente. Te contactaremos en las próximas horas para confirmar los detalles.'
      resetForm()
    } else {
      status.type = 'error'
      if (result.error?.includes('network') || result.error?.includes('fetch')) {
        status.message =
          'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.'
      } else {
        status.message =
          'Se produjo un error al guardar las actividades. Por favor, inténtalo de nuevo o contacta con nosotros.'
      }
      console.error('Error al guardar las actividades:', result.error)
    }
  } catch (error) {
    status.type = 'error'
    status.message =
      'Se produjo un error inesperado. Por favor, inténtalo de nuevo o contacta con nosotros.'
    console.error('Error inesperado:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.organizerName = ''
  form.organizerEmail = ''
  form.activities = []
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
  errors.organizerName = ''
  errors.organizerEmail = ''
}

const handleReset = () => {
  resetForm()
  status.type = 'idle'
  status.message = ''

  // Scroll al inicio del formulario
  const formElement = document.getElementById('activity-registration-form')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Watchers para validar actividades cuando cambian campos relacionados
watch(
  () => form.activities,
  () => {
    form.activities.forEach((activity, index) => {
      // Validar tipo y minParticipants cuando cambia el tipo
      if (activity.type && errors[`activities.${index}.type`]) {
        validateActivityField(index, 'type')
      }
      if (activity.minParticipants && errors[`activities.${index}.minParticipants`]) {
        validateActivityField(index, 'minParticipants')
      }
      if (activity.maxParticipants && errors[`activities.${index}.maxParticipants`]) {
        validateActivityField(index, 'maxParticipants')
      }
    })
  },
  { deep: true },
)
</script>

<style scoped>
.registration-nav {
  margin-bottom: var(--spacing-md);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  padding: var(--spacing-xs) 0;
}

.back-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.back-link:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.back-link span {
  font-size: 1.2rem;
  line-height: 1;
}

.registration-intro {
  margin-top: var(--spacing-sm);
  color: var(--color-text-light);
  font-size: 1rem;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  background-color: var(--color-cream);
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  margin-top: var(--spacing-lg);
}

.form-fieldset {
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: grid;
  gap: var(--spacing-md);
}

.form-fieldset legend {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-primary);
  padding: 0 var(--spacing-xs);
}

.form-row-group {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
}

.form-row {
  display: grid;
  gap: var(--spacing-xs);
}

.form-row label {
  font-weight: 600;
  color: var(--color-primary);
}

.form-row input,
.form-row textarea,
.form-row select {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  background-color: var(--color-white);
  font-family: inherit;
  font-size: 1rem;
}

.form-row input:focus-visible,
.form-row textarea:focus-visible,
.form-row select:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(26, 77, 46, 0.12);
}

.form-row input[aria-invalid='true'],
.form-row textarea[aria-invalid='true'],
.form-row select[aria-invalid='true'] {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(231, 111, 81, 0.15);
}

.form-help {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-top: 0.25rem;
}

.form-row-inline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.help-indicator {
  font-weight: 600;
  color: var(--color-primary);
}

.legend-note {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-light);
  margin-left: var(--spacing-xs);
}

.form-error {
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.form-error-hidden {
  visibility: hidden;
}

.no-activities {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--color-white);
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
}

.activities-container {
  display: grid;
  gap: var(--spacing-lg);
}

.activity-form {
  background-color: var(--color-white);
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: grid;
  gap: var(--spacing-md);
}

.activity-form-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  color: var(--color-primary);
  margin: 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 2px solid var(--color-cream-dark);
}

.add-activity-button,
.remove-activity-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background-color: var(--color-white);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.add-activity-button:hover,
.remove-activity-button:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.add-activity-button:focus-visible,
.remove-activity-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.remove-activity-button {
  border-color: var(--color-accent);
  color: var(--color-accent);
  margin-top: var(--spacing-sm);
}

.remove-activity-button:hover {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.status-message {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-align: center;
}

.status-success {
  background-color: rgba(26, 77, 46, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.status-error {
  background-color: rgba(231, 111, 81, 0.1);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-cream);
}

.file-list {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-cream);
  border-radius: var(--radius-md);
}

.file-list-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.file-list-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-white);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-cream-dark);
}

.file-name {
  font-size: 0.875rem;
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remove {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 var(--spacing-xs);
  line-height: 1;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.file-remove:hover {
  color: var(--color-accent-dark);
}

.file-remove:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (min-width: 768px) {
  .form-row-group {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
