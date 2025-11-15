<template>
  <section class="section registration">
    <div class="container">
      <AppSectionHeader label="Inscripción" title="Reserva tu plaza" />

      <p class="registration-intro">
        Completa el formulario para preinscribirte en el Retiro Lúdico de Castilla y Dragón de 2026.
        La información nos ayuda a reservar tu alojamiento y a organizar las comidas y actividades
        accesibles para todas las personas participantes.
      </p>

      <div class="registration-layout">
        <aside class="registration-summary" aria-label="Información adicional para la inscripción">
          <AppCard
            title="Detalles clave"
            text="El retiro se celebra del 24 al 26 de julio de 2026 en Naturcampa, Matapozuelos. El check-in comenzará el Viernes 24 a las 17:00 y finalizará a las 20:30. La salida y cierre del evento al público será el Domingo 26 a las 21:00."
            icon="🗓️"
            variant="info"
          />

          <AppCard title="Qué incluye la cuota" icon="🎒" variant="info">
            <template #text>
              La inscripción cubre el tipo de alojamiento que escojas, pensión completa y acceso a
              todas las actividades del retiro.
            </template>
          </AppCard>

          <article class="summary-note">
            <h3>¿Tienes dudas?</h3>
            <p>
              Escríbenos a
              <a href="mailto:castillaydragon@gmail.com">castillaydragon@gmail.com</a>
              o contacta en nuestro Telegram al <a href="tel:+34600123456">600 123 456</a>.
              Estaremos encantadas de ayudarte.
            </p>
          </article>
        </aside>

        <form
          id="registration-form"
          class="registration-form"
          @submit.prevent="handleSubmit"
          novalidate
        >
          <div v-if="isDev" class="dev-tools" aria-label="Herramientas de desarrollo">
            <p class="dev-tools-label">🧪 Datos de prueba:</p>
            <div class="dev-buttons">
              <button
                class="dev-button"
                type="button"
                @click="() => fillMockData('adult')"
                :disabled="isSubmitting"
              >
                Adulto
              </button>
              <button
                class="dev-button"
                type="button"
                @click="() => fillMockData('minor')"
                :disabled="isSubmitting"
              >
                Menor
              </button>
              <button
                class="dev-button"
                type="button"
                @click="() => fillMockData('special')"
                :disabled="isSubmitting"
              >
                Especial
              </button>
              <button
                class="dev-button"
                type="button"
                @click="() => fillMockData('minimal')"
                :disabled="isSubmitting"
              >
                Mínimo
              </button>
            </div>
          </div>
          <fieldset class="form-fieldset">
            <legend>Datos personales</legend>
            <div class="form-row">
              <label for="firstName">Nombre *</label>
              <input
                id="firstName"
                v-model.trim="form.firstName"
                type="text"
                name="firstName"
                autocomplete="given-name"
                required
                aria-required="true"
                :aria-invalid="errors.firstName ? 'true' : 'false'"
                :aria-describedby="describedByFor('firstName')"
                @blur="() => validateField('firstName')"
              />
              <span v-if="errors.firstName" id="firstName-error" class="form-error" role="alert">
                {{ errors.firstName }}
              </span>
            </div>

            <div class="form-row">
              <label for="lastName">Apellidos *</label>
              <input
                id="lastName"
                v-model.trim="form.lastName"
                type="text"
                name="lastName"
                autocomplete="family-name"
                required
                aria-required="true"
                :aria-invalid="errors.lastName ? 'true' : 'false'"
                :aria-describedby="describedByFor('lastName')"
                @blur="() => validateField('lastName')"
              />
              <span v-if="errors.lastName" id="lastName-error" class="form-error" role="alert">
                {{ errors.lastName }}
              </span>
            </div>

            <div class="form-row">
              <label for="email">Correo electrónico *</label>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                required
                aria-required="true"
                :aria-invalid="errors.email ? 'true' : 'false'"
                :aria-describedby="describedByFor('email')"
                @blur="() => validateField('email')"
              />
              <span v-if="errors.email" id="email-error" class="form-error" role="alert">
                {{ errors.email }}
              </span>
            </div>

            <div class="form-row">
              <label for="phone">Teléfono de contacto *</label>
              <input
                id="phone"
                v-model.trim="form.phone"
                type="tel"
                name="phone"
                autocomplete="tel"
                inputmode="tel"
                required
                aria-required="true"
                :aria-invalid="errors.phone ? 'true' : 'false'"
                :aria-describedby="describedByFor('phone')"
                @blur="() => validateField('phone')"
              />
              <p id="phone-help" class="form-help">
                Usa un teléfono activo durante los días del retiro. Te mantendremos informado vía
                Telegram de actividades y horarios durante el evento.
              </p>
              <span v-if="errors.phone" id="phone-error" class="form-error" role="alert">
                {{ errors.phone }}
              </span>
            </div>

            <div class="form-row">
              <label for="birthDate">Fecha de nacimiento *</label>
              <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                name="birthDate"
                :max="eventDates.start"
                required
                aria-required="true"
                :aria-invalid="errors.birthDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('birthDate')"
                @blur="() => validateField('birthDate')"
              />
              <span v-if="errors.birthDate" id="birthDate-error" class="form-error" role="alert">
                {{ errors.birthDate }}
              </span>
            </div>
            <fieldset class="form-fieldset">
              <legend v-if="isMinor">Responsable del menor</legend>
              <legend v-else>Contacto de emergencia (opcional)</legend>

              <div class="form-row">
                <label for="emergencyContactName">Nombre completo {{ isMinor ? '*' : '' }}</label>
                <input
                  id="emergencyContactName"
                  v-model.trim="form.emergencyContactName"
                  type="text"
                  name="emergencyContactName"
                  :required="isMinor"
                  :aria-required="isMinor"
                  :aria-invalid="errors.emergencyContactName ? 'true' : 'false'"
                  :aria-describedby="describedByFor('emergencyContactName')"
                  @blur="() => validateField('emergencyContactName')"
                />
                <span
                  v-if="errors.emergencyContactName"
                  id="emergencyContactName-error"
                  class="form-error"
                  role="alert"
                >
                  {{ errors.emergencyContactName }}
                </span>
              </div>

              <div class="form-row">
                <label for="emergencyContactPhone"
                  >Teléfono de emergencia {{ isMinor ? '*' : '' }}</label
                >
                <input
                  id="emergencyContactPhone"
                  v-model.trim="form.emergencyContactPhone"
                  type="tel"
                  name="emergencyContactPhone"
                  inputmode="tel"
                  :required="isMinor"
                  :aria-required="isMinor"
                  :aria-invalid="errors.emergencyContactPhone ? 'true' : 'false'"
                  :aria-describedby="describedByFor('emergencyContactPhone')"
                  @blur="() => validateField('emergencyContactPhone')"
                />
                <p id="emergency-contact-phone-help" class="form-help">
                  Este número solo se utilizará en caso de urgencia durante el evento.
                </p>
                <span
                  v-if="errors.emergencyContactPhone"
                  id="emergencyContactPhone-error"
                  class="form-error"
                  role="alert"
                >
                  {{ errors.emergencyContactPhone }}
                </span>
              </div>
            </fieldset>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>Logística del retiro</legend>

            <div class="form-row">
              <label for="arrivalDate">Llegada estimada *</label>
              <input
                id="arrivalDate"
                v-model="form.arrivalDate"
                type="date"
                name="arrivalDate"
                :min="eventDates.start"
                :max="eventDates.end"
                required
                aria-required="true"
                :aria-invalid="errors.arrivalDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('arrivalDate')"
                @blur="() => validateField('arrivalDate')"
                @change="() => validateField('arrivalDate')"
              />
              <span
                v-if="errors.arrivalDate"
                id="arrivalDate-error"
                class="form-error"
                role="alert"
              >
                {{ errors.arrivalDate }}
              </span>
            </div>

            <div class="form-row">
              <label for="departureDate">Salida estimada</label>
              <input
                id="departureDate"
                v-model="form.departureDate"
                type="date"
                name="departureDate"
                :min="minDepartureDate"
                :max="eventDates.end"
                aria-required="false"
                :aria-invalid="errors.departureDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('departureDate')"
                @blur="() => validateField('departureDate')"
                @change="() => validateField('departureDate')"
              />
              <span
                v-if="errors.departureDate"
                id="departureDate-error"
                class="form-error"
                role="alert"
              >
                {{ errors.departureDate }}
              </span>
            </div>

            <fieldset
              class="form-subfieldset"
              role="radiogroup"
              :aria-describedby="describedByFor('accommodation')"
            >
              <legend>Alojamiento preferido *</legend>
              <div class="option-list option-list--radio">
                <div v-for="option in accommodationOptions" :key="option.value" class="option-item">
                  <input
                    :id="`accommodation-${option.value}`"
                    v-model="form.accommodation"
                    type="radio"
                    name="accommodation"
                    :value="option.value"
                    required
                    aria-required="true"
                    @change="() => validateField('accommodation')"
                  />
                  <label :for="`accommodation-${option.value}`">{{ option.label }}</label>
                </div>
              </div>
              <div class="form-row" v-if="form.accommodation === 'especial'">
                <label for="comments">Comentarios adicionales</label>
                <textarea
                  id="comments"
                  v-model.trim="form.comments"
                  name="comments"
                  rows="4"
                  :aria-describedby="describedByFor('comments')"
                  maxlength="600"
                ></textarea>
                <p id="comments-help" class="form-help">
                  Cuéntanos tu caso particular, o dudas que tengas para que podamos ayudarte mejor.
                </p>
              </div>
              <span
                v-if="errors.accommodation"
                id="accommodation-error"
                class="form-error"
                role="alert"
              >
                {{ errors.accommodation }}
              </span>
            </fieldset>

            <fieldset class="form-subfieldset" aria-describedby="diet-help">
              <legend>Restricciones alimentarias</legend>
              <p id="diet-help" class="form-help">
                Selecciona todas las opciones que apliquen. Si no tienes restricciones, deja las
                casillas sin marcar.
              </p>
              <div class="option-list option-list--checkbox">
                <div v-for="option in dietOptions" :key="option.value" class="option-item">
                  <input
                    :id="`diet-${option.value}`"
                    v-model="form.diet"
                    type="checkbox"
                    name="diet"
                    :value="option.value"
                  />
                  <label :for="`diet-${option.value}`">{{ option.label }}</label>
                </div>
              </div>
              <div class="form-row">
                <label for="dietComments">Comentarios adicionales</label>
                <textarea
                  id="dietComments"
                  v-model.trim="form.dietComments"
                  name="dietComments"
                  rows="4"
                  :aria-describedby="describedByFor('dietComments')"
                  maxlength="600"
                ></textarea>
                <p id="dietComments-help" class="form-help">
                  Cuéntanos tus restricciones alimentarias para que podamos organizar la comida
                  adecuadamente.
                </p>
              </div>
            </fieldset>
          </fieldset>

          <div class="form-consent">
            <label class="checkbox-consent">
              <input
                id="terms"
                v-model="form.terms"
                type="checkbox"
                name="terms"
                required
                aria-required="true"
                :aria-invalid="errors.terms ? 'true' : 'false'"
                :aria-describedby="describedByFor('terms')"
                @change="() => validateField('terms')"
              />
              <span>
                Acepto la
                <a href="/politica-privacidad" class="privacy-link">política de privacidad</a>
                y autorizo el tratamiento de mis datos para la gestión de mi inscripción al evento.
              </span>
            </label>
            <span v-if="errors.terms" id="terms-error" class="form-error" role="alert">
              {{ errors.terms }}
            </span>
          </div>

          <div class="form-actions">
            <button class="cta-button cta-primary" type="submit" :disabled="isSubmitting">
              <span v-if="!isSubmitting">Enviar solicitud</span>
              <span v-else>
                <span class="spinner" aria-hidden="true"></span>
                Enviando...
              </span>
            </button>
            <button class="form-reset" type="button" @click="handleReset" :disabled="isSubmitting">
              Limpiar formulario
            </button>
          </div>

          <div
            v-if="status.message"
            class="form-status"
            :class="`form-status--${status.type}`"
            :role="statusRole"
            :aria-live="statusAriaLive"
            aria-atomic="true"
          >
            {{ status.message }}
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import AppCard from '@/components/AppCard.vue'

defineOptions({
  name: 'RegistrationView',
})

const eventDates = {
  start: '2026-07-24',
  end: '2026-07-26',
}

const accommodationOptions = [
  {
    value: 'albergue',
    label: 'Albergue compartido (130€)',
  },
  {
    value: 'chozos',
    label: 'Chozos (150€)',
  },
  {
    value: 'especial',
    label: 'Antes necesito comentarlo con vosotros',
    description:
      'Si tienes algún caso particular, nos pondremos en contacto contigo para ayudarte.',
  },
]

const dietOptions = [
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'sin-gluten', label: 'Sin gluten' },
  { value: 'sin-lactosa', label: 'Sin lactosa' },
  { value: 'alergias', label: 'Tengo alergias (detállalo en comentarios)' },
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  guardianFullName: '',
  arrivalDate: '',
  departureDate: '',
  accommodation: '',
  diet: [],
  comments: '',
  dietComments: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  terms: false,
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  guardianFullName: '',
  arrivalDate: '',
  departureDate: '',
  accommodation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  terms: '',
})

const status = reactive({
  message: '',
  type: 'idle',
})

const isSubmitting = ref(false)
const isDev = import.meta.env.DEV

const minDepartureDate = computed(() => form.arrivalDate || eventDates.start)

const statusRole = computed(() => (status.type === 'error' ? 'alert' : 'status'))
const statusAriaLive = computed(() => (status.type === 'error' ? 'assertive' : 'polite'))

const isMinor = computed(() => {
  if (!form.birthDate) {
    return false
  }

  const birth = new Date(form.birthDate)

  if (Number.isNaN(birth.getTime())) {
    return false
  }

  const eventStart = new Date(eventDates.start)
  const eighteenthBirthday = new Date(birth)
  eighteenthBirthday.setFullYear(birth.getFullYear() + 18)

  return eighteenthBirthday > eventStart
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const phonePattern = /^[0-9+\s()-]{9,15}$/

const clearStatus = () => {
  if (status.type !== 'idle') {
    status.type = 'idle'
    status.message = ''
  }
}

const describedByFor = (field) => {
  const ids = []

  const helpIds = {
    phone: 'phone-help',
    birthDate: 'birthDate-help',
    guardianFullName: 'guardianFullName-help',
    comments: 'comments-help',
    emergencyContactPhone: 'emergency-contact-phone-help',
  }

  if (helpIds[field]) {
    ids.push(helpIds[field])
  }

  if (errors[field]) {
    ids.push(`${field}-error`)
  }

  return ids.length > 0 ? ids.join(' ') : undefined
}

const validateField = (field) => {
  clearStatus()

  switch (field) {
    case 'firstName':
      if (!form.firstName.trim()) {
        errors.firstName = 'El nombre es obligatorio.'
        return false
      }
      errors.firstName = ''
      return true

    case 'lastName':
      if (!form.lastName.trim()) {
        errors.lastName = 'Los apellidos son obligatorios.'
        return false
      }
      errors.lastName = ''
      return true

    case 'email':
      if (!form.email.trim()) {
        errors.email = 'Introduce tu correo electrónico.'
        return false
      }
      if (!emailPattern.test(form.email)) {
        errors.email = 'Revisa el formato del correo electrónico.'
        return false
      }
      errors.email = ''
      return true

    case 'phone':
      if (!form.phone.trim()) {
        errors.phone = 'Indica un teléfono de contacto.'
        return false
      }
      if (!phonePattern.test(form.phone)) {
        errors.phone = 'El teléfono debe tener al menos 9 dígitos.'
        return false
      }
      errors.phone = ''
      return true

    case 'birthDate': {
      if (!form.birthDate) {
        errors.birthDate = 'La fecha de nacimiento es obligatoria.'
        return false
      }
      const birth = new Date(form.birthDate)
      const eventStart = new Date(eventDates.start)
      if (Number.isNaN(birth.getTime()) || birth >= eventStart) {
        errors.birthDate = 'Introduce una fecha válida anterior al evento.'
        return false
      }
      errors.birthDate = ''
      return true
    }

    case 'guardianFullName':
      if (isMinor.value && !form.guardianFullName.trim()) {
        errors.guardianFullName = 'Indica el nombre y apellidos del tutor o responsable.'
        return false
      }
      errors.guardianFullName = ''
      return true

    case 'arrivalDate': {
      if (!form.arrivalDate) {
        errors.arrivalDate = 'Indica tu fecha de llegada.'
        return false
      }
      const arrival = new Date(form.arrivalDate)
      const start = new Date(eventDates.start)
      const end = new Date(eventDates.end)
      if (arrival < start || arrival > end) {
        errors.arrivalDate = 'La llegada debe ser entre el 24 y el 26 de julio.'
        return false
      }
      errors.arrivalDate = ''
      return true
    }

    case 'departureDate': {
      if (!form.departureDate) {
        errors.departureDate = ''
        return true
      }
      const departure = new Date(form.departureDate)
      const start = new Date(eventDates.start)
      const end = new Date(eventDates.end)
      if (departure < start || departure > end) {
        errors.departureDate = 'La salida debe ser entre el 24 y el 26 de julio.'
        return false
      }
      if (form.arrivalDate) {
        const arrival = new Date(form.arrivalDate)
        if (departure < arrival) {
          errors.departureDate = 'La fecha de salida no puede ser anterior a la de llegada.'
          return false
        }
      }
      errors.departureDate = ''
      return true
    }

    case 'accommodation':
      if (!form.accommodation) {
        errors.accommodation = 'Selecciona una opción de alojamiento.'
        return false
      }
      errors.accommodation = ''
      return true

    case 'emergencyContactName':
      // Solo requerido si es menor
      if (isMinor.value && !form.emergencyContactName.trim()) {
        errors.emergencyContactName = 'Indica el nombre y apellidos del tutor o responsable.'
        return false
      }
      // Para adultos es opcional, siempre válido
      errors.emergencyContactName = ''
      return true

    case 'emergencyContactPhone':
      if (isMinor.value && !form.emergencyContactPhone.trim()) {
        errors.emergencyContactPhone = 'Indica el teléfono de emergencia.'
        return false
      }
      // Si es menor o si hay valor (opcional para adultos), validar formato
      if (form.emergencyContactPhone.trim() && !phonePattern.test(form.emergencyContactPhone)) {
        errors.emergencyContactPhone = 'El teléfono de emergencia debe ser válido.'
        return false
      }
      errors.emergencyContactPhone = ''
      return true

    case 'terms':
      if (!form.terms) {
        errors.terms = 'Debes aceptar la política de privacidad.'
        return false
      }
      errors.terms = ''
      return true

    default:
      return true
  }
}

const fieldsToValidate = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'birthDate',
  'arrivalDate',
  'departureDate',
  'accommodation',
  'emergencyContactName',
  'emergencyContactPhone',
  'terms',
]

const validateForm = () => {
  let isValid = true
  const failedFields = []

  fieldsToValidate.forEach((field) => {
    const fieldValid = validateField(field)
    if (!fieldValid) {
      isValid = false
      failedFields.push(field)
    }
  })

  // En desarrollo, mostrar qué campos fallaron en consola
  if (import.meta.env.DEV && failedFields.length > 0) {
    console.log('Campos con errores:', failedFields)
    console.log('Errores actuales:', { ...errors })
  }

  return isValid
}

const resetForm = () => {
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.phone = ''
  form.birthDate = ''
  form.guardianFullName = ''
  form.arrivalDate = ''
  form.departureDate = ''
  form.accommodation = ''
  form.diet = []
  form.comments = ''
  form.dietComments = ''
  form.emergencyContactName = ''
  form.emergencyContactPhone = ''
  form.terms = false

  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const saveToFile = (data, isMinorValue) => {
  try {
    // Crear objeto con los datos del formulario y metadatos
    const submissionData = {
      timestamp: new Date().toISOString(),
      datos: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate,
        isMinor: isMinorValue,
        guardianFullName: data.guardianFullName,
        arrivalDate: data.arrivalDate,
        departureDate: data.departureDate,
        accommodation: data.accommodation,
        diet: data.diet,
        comments: data.comments,
        dietComments: data.dietComments,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        terms: data.terms,
      },
    }

    // Convertir a JSON con formato legible
    const jsonString = JSON.stringify(submissionData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // Generar nombre de archivo único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const emailPrefix = data.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `inscripcion_${emailPrefix}_${timestamp}.json`

    // Crear enlace temporal y descargar
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // Limpiar
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Error al guardar el archivo:', error)
    return false
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) {
    return
  }

  const isValid = validateForm()

  if (!isValid) {
    status.type = 'error'
    // Obtener nombres de campos con errores para mensaje más específico
    const errorFields = Object.keys(errors).filter((key) => errors[key])
    const fieldLabels = {
      firstName: 'Nombre',
      lastName: 'Apellidos',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      birthDate: 'Fecha de nacimiento',
      arrivalDate: 'Fecha de llegada',
      departureDate: 'Fecha de salida',
      accommodation: 'Alojamiento',
      emergencyContactName: 'Contacto de emergencia (nombre)',
      emergencyContactPhone: 'Contacto de emergencia (teléfono)',
      terms: 'Aceptación de términos',
    }
    const errorFieldNames = errorFields.map((field) => fieldLabels[field] || field).join(', ')

    if (errorFieldNames) {
      status.message = `Revisa los siguientes campos: ${errorFieldNames}.`
    } else {
      status.message = 'Revisa los campos marcados para completar la inscripción.'
    }

    // Scroll al primer campo con error
    const firstErrorField = errorFields[0]
    if (firstErrorField) {
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.focus()
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return
  }

  isSubmitting.value = true
  status.type = 'idle'
  status.message = ''

  // Guardar datos en archivo local
  const saved = saveToFile(form, isMinor.value)

  await new Promise((resolve) => setTimeout(resolve, 1200))

  if (saved) {
    status.type = 'success'
    status.message =
      '¡Gracias por tu interés! Hemos recibido la solicitud y se ha guardado tus datos. Te contactaremos en las próximas horas.'
  } else {
    status.type = 'error'
    status.message =
      'Se produjo un error al guardar los datos. Por favor, inténtalo de nuevo o contacta con nosotros.'
    isSubmitting.value = false
    return
  }

  resetForm()

  isSubmitting.value = false
}

const handleReset = () => {
  resetForm()
  status.type = 'idle'
  status.message = ''

  // Scroll al inicio del formulario
  const formElement = document.getElementById('registration-form')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Enfocar el primer campo del formulario
    const firstInput = formElement.querySelector('input, textarea, select')
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus()
      }, 300)
    }
  }
}

const fillMockData = (scenario = 'adult') => {
  clearStatus()

  const mockScenarios = {
    adult: {
      firstName: 'María',
      lastName: 'González Pérez',
      email: 'maria.gonzalez@example.com',
      phone: '+34 600 123 456',
      birthDate: '1995-05-15',
      arrivalDate: '2026-07-24',
      departureDate: '2026-07-26',
      accommodation: 'chozos',
      diet: ['vegetariana'],
      comments: '',
      dietComments: 'Preferiría opciones sin lácteos si es posible.',
      emergencyContactName: 'Juan González',
      emergencyContactPhone: '+34 600 654 321',
      terms: true,
    },
    minor: {
      firstName: 'Ana',
      lastName: 'Martínez López',
      email: 'ana.martinez@example.com',
      phone: '+34 611 222 333',
      birthDate: '2010-08-20',
      arrivalDate: '2026-07-24',
      departureDate: '2026-07-26',
      accommodation: 'albergue',
      diet: ['sin-gluten', 'sin-lactosa'],
      comments: '',
      dietComments: 'Necesita dieta estricta sin gluten y sin lactosa.',
      emergencyContactName: 'Carmen López Martínez',
      emergencyContactPhone: '+34 622 333 444',
      terms: true,
    },
    special: {
      firstName: 'Carlos',
      lastName: 'Ruiz Sánchez',
      email: 'carlos.ruiz@example.com',
      phone: '+34 633 444 555',
      birthDate: '1988-12-10',
      arrivalDate: '2026-07-24',
      departureDate: '2026-07-25',
      accommodation: 'especial',
      diet: ['vegana'],
      comments: 'Necesito acceso para silla de ruedas y alojamiento adaptado.',
      dietComments: 'Dieta vegana estricta, sin excepciones.',
      emergencyContactName: 'Laura Sánchez',
      emergencyContactPhone: '+34 644 555 666',
      terms: true,
    },
    minimal: {
      firstName: 'Luis',
      lastName: 'Fernández García',
      email: 'luis.fernandez@example.com',
      phone: '+34 655 666 777',
      birthDate: '1992-03-25',
      arrivalDate: '2026-07-24',
      departureDate: '',
      accommodation: 'albergue',
      diet: [],
      comments: '',
      dietComments: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      terms: true,
    },
  }

  const mockData = mockScenarios[scenario] || mockScenarios.adult

  Object.assign(form, mockData)

  // Limpiar errores después de rellenar
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  status.type = 'idle'
  status.message = ''
}

// Exponer función globalmente para uso desde consola (solo en desarrollo)
if (import.meta.env.DEV) {
  window.fillMockData = fillMockData
}

watch(
  () => form.arrivalDate,
  () => {
    if (errors.arrivalDate) {
      validateField('arrivalDate')
    }
    if (form.departureDate) {
      validateField('departureDate')
    }
  },
)

watch(isMinor, (value) => {
  if (!value) {
    form.guardianFullName = ''
    errors.guardianFullName = ''
  }
})

watch(
  () => form.departureDate,
  () => {
    if (errors.departureDate) {
      validateField('departureDate')
    }
  },
)

watch(
  () => form.terms,
  () => {
    if (errors.terms) {
      validateField('terms')
    }
  },
)
</script>

<style scoped>
.registration-intro {
  margin-top: var(--spacing-sm);
  color: var(--color-text-light);
  font-size: 1rem;
}

.registration-layout {
  display: grid;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  grid-template-areas:
    'summary'
    'form';
}

.registration-form {
  grid-area: form;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  background-color: var(--color-cream);
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.form-fieldset,
.form-subfieldset {
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: grid;
  gap: var(--spacing-md);
}

.form-fieldset legend,
.form-subfieldset legend {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--color-primary);
  padding: 0 var(--spacing-xs);
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
.form-row textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  background-color: var(--color-white);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-row input:focus-visible,
.form-row textarea:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(26, 77, 46, 0.12);
}

.form-row input[aria-invalid='true'],
.form-row textarea[aria-invalid='true'] {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(231, 111, 81, 0.15);
}

.form-help {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
}

.option-list {
  display: grid;
  gap: var(--spacing-sm);
}

.option-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-sm);
  align-items: start;
}

.option-item input[type='checkbox'],
.option-item input[type='radio'] {
  width: 1.25rem;
  height: 1.25rem;
}

.option-item label {
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.4;
}

.option-list--radio .option-item {
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid transparent;
}

.option-list--radio .option-item:hover {
  border-color: var(--color-accent-light);
}

.form-consent {
  display: grid;
  gap: var(--spacing-sm);
}

.checkbox-consent {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-sm);
  align-items: start;
  background-color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
}

.checkbox-consent input {
  margin-top: 0.3rem;
}

.checkbox-consent span {
  color: var(--color-text);
  font-size: 0.95rem;
}

.privacy-link {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.privacy-link:hover {
  color: var(--color-primary-dark);
}

.privacy-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.form-actions {
  display: grid;
  gap: var(--spacing-sm);
}

.form-reset {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.form-reset:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.form-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dev-tools {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: rgba(255, 193, 7, 0.1);
  border: 2px dashed rgba(255, 193, 7, 0.5);
  border-radius: var(--radius-lg);
}

.dev-tools-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.dev-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--spacing-xs);
}

.dev-button {
  background: rgba(255, 193, 7, 0.2);
  color: var(--color-text);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.dev-button:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.3);
  border-color: rgba(255, 193, 7, 0.7);
}

.dev-button:focus-visible {
  outline: 2px solid rgba(255, 193, 7, 0.8);
  outline-offset: 2px;
}

.dev-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-status {
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  font-weight: 600;
}

.form-status--success {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.form-status--error {
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

.registration-summary {
  grid-area: summary;
  display: grid;
  gap: var(--spacing-md);
}

.summary-note {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-md);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.summary-note h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  margin-bottom: var(--spacing-xs);
}

.summary-note a {
  color: var(--color-accent-light);
  text-decoration: underline;
}

@keyframes spinner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (width >= 768px) {
  .registration-layout {
    grid-template-columns: 2fr 1fr;
    grid-template-areas: 'form summary';
  }

  .registration-form {
    padding: var(--spacing-lg);
  }

  .form-fieldset,
  .form-subfieldset {
    padding: var(--spacing-lg);
  }

  .form-actions {
    grid-template-columns: auto auto;
    align-items: center;
  }
}

@media (width >= 1024px) {
  .registration-intro {
    max-width: 720px;
  }
}
</style>
