<template>
  <section class="section registration">
    <div class="container">
      <nav class="registration-nav" aria-label="Navegación">
        <RouterLink to="/" class="back-link">
          <span aria-hidden="true">←</span>
          Volver al inicio
        </RouterLink>
      </nav>

      <AppSectionHeader label="Inscripción" title="Reserva tu plaza" />

      <p class="registration-intro">
        Completa el formulario para preinscribirte en el Retiro Lúdico de la asociación cultural
        <strong>Castilla y Dragón</strong>
        {{ EVENT_YEAR }}. La información nos ayuda a reservar tu alojamiento y a organizar las
        comidas y actividades accesibles para todas las personas participantes.
      </p>

      <div class="registration-layout">
        <aside class="registration-summary" aria-label="Información adicional para la inscripción">
          <AppCard title="Detalles clave" :text="eventDetailsText" icon="🗓️" variant="info" />
          <AppCard title="Canal de Telegram" icon="📢" variant="info">
            <template #text>
              <p>
                Mantente informado durante el evento a través de nuestro canal oficial de Telegram.
                Recibirás anuncios importantes, avisos de partidas, horarios y cambios de agenda en
                tiempo real.
              </p>
              <p style="margin-top: 0.75rem">
                <a
                  :href="CONTACT_INFO.telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="telegram-link-small"
                >
                  Únete al canal
                  <span class="sr-only"> (se abre en nueva ventana)</span>
                </a>
              </p>
            </template>
          </AppCard>

          <AppCard title="Qué incluye la cuota" icon="🎒" variant="info">
            <template #text>
              La inscripción cubre el tipo de alojamiento que escojas, pensión completa y acceso a
              todas las actividades del retiro.
            </template>
          </AppCard>

          <article class="summary-note">
            <h3>¿Tienes dudas?</h3>
            <p>
              Consulta nuestras
              <RouterLink to="/faqs" class="summary-link">preguntas frecuentes</RouterLink>
              o escríbenos a
              <a :href="`mailto:${CONTACT_INFO.email}`" class="summary-link">{{
                CONTACT_INFO.email
              }}</a>
              o contacta en nuestro Telegram al
              <a :href="`tel:${CONTACT_INFO.phone}`" class="summary-link">{{
                CONTACT_INFO.phone
              }}</a
              >. Estaremos encantadas de ayudarte.
            </p>
          </article>
        </aside>

        <form
          id="registration-form"
          class="registration-form"
          @submit.prevent="handleSubmit"
          novalidate
        >
          <fieldset class="form-fieldset">
            <legend>
              Datos personales
              <span class="legend-note">(nombre y apellidos, tal como aparecen en tu DNI)</span>
            </legend>
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
              <span
                id="firstName-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.firstName }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.firstName || '&nbsp;' }}
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
              <span
                id="lastName-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.lastName }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.lastName || '&nbsp;' }}
              </span>
            </div>
            <div class="form-row">
              <label for="lastName"
                >Mote/Alias
                <span class="legend-note"
                  >(Este nombre será el que usaremos para identificarte en el evento)</span
                ></label
              >
              <input
                id="nickname"
                v-model.trim="form.nickname"
                type="text"
                name="nickname"
                autocomplete="family-name"
                required
                aria-required="true"
                :aria-describedby="describedByFor('nickname')"
                @blur="() => validateField('nickname')"
              />
              <span
                id="nickname-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.nickname }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.nickname || '&nbsp;' }}
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
              <span
                id="email-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.email }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.email || '&nbsp;' }}
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
                <button
                  type="button"
                  class="tooltip-trigger"
                  :aria-expanded="showTelegramTooltip"
                  :aria-controls="'telegram-tooltip'"
                  @click="toggleTelegramTooltip"
                  @mouseenter="showTelegramTooltip = true"
                  @mouseleave="handleTooltipMouseLeave"
                  aria-label="Más información sobre Telegram"
                >
                  Telegram
                </button>
                de actividades y horarios durante el evento.
                <span
                  v-if="showTelegramTooltip"
                  id="telegram-tooltip"
                  class="tooltip"
                  role="tooltip"
                  aria-live="polite"
                  @mouseenter="
                    () => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout)
                      showTelegramTooltip = true
                    }
                  "
                  @mouseleave="
                    () => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout)
                      showTelegramTooltip = false
                    }
                  "
                >
                  <span class="tooltip-content">
                    {{ TELEGRAM_TOOLTIP }}
                  </span>
                  <button
                    type="button"
                    class="tooltip-close"
                    @click="showTelegramTooltip = false"
                    aria-label="Cerrar información sobre Telegram"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </span>
              </p>
              <span
                id="phone-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.phone }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.phone || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label for="birthDate">Fecha de nacimiento *</label>
              <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                name="birthDate"
                :max="EVENT_DATES.start"
                required
                aria-required="true"
                :aria-invalid="errors.birthDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('birthDate')"
                @blur="() => validateField('birthDate')"
              />
              <span
                id="birthDate-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.birthDate }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.birthDate || '&nbsp;' }}
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
                  id="emergencyContactName-error"
                  class="form-error"
                  :class="{ 'form-error-hidden': !errors.emergencyContactName }"
                  role="alert"
                  aria-live="polite"
                >
                  {{ errors.emergencyContactName || '&nbsp;' }}
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
                  id="emergencyContactPhone-error"
                  class="form-error"
                  :class="{ 'form-error-hidden': !errors.emergencyContactPhone }"
                  role="alert"
                  aria-live="polite"
                >
                  {{ errors.emergencyContactPhone || '&nbsp;' }}
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
                type="datetime-local"
                name="arrivalDate"
                :min="minArrivalDateTime"
                :max="maxArrivalDateTime"
                required
                aria-required="true"
                :aria-invalid="errors.arrivalDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('arrivalDate')"
                @blur="() => validateField('arrivalDate')"
                @change="() => validateField('arrivalDate')"
              />
              <span
                id="arrivalDate-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.arrivalDate }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.arrivalDate || '&nbsp;' }}
              </span>
            </div>

            <div class="form-row">
              <label for="departureDate">Salida estimada (fecha y hora)</label>
              <input
                id="departureDate"
                v-model="form.departureDate"
                type="datetime-local"
                name="departureDate"
                :min="minDepartureDateTime"
                :max="maxDepartureDateTime"
                aria-required="false"
                :aria-invalid="errors.departureDate ? 'true' : 'false'"
                :aria-describedby="describedByFor('departureDate')"
                @blur="() => validateField('departureDate')"
                @change="() => validateField('departureDate')"
              />
              <span
                id="departureDate-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.departureDate }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.departureDate || '&nbsp;' }}
              </span>
            </div>

            <fieldset
              class="form-subfieldset"
              role="radiogroup"
              :aria-describedby="describedByFor('accommodation')"
            >
              <legend>Alojamiento preferido *</legend>
              <div class="option-list option-list--radio">
                <div
                  v-for="option in ACCOMMODATION_OPTIONS"
                  :key="option.value"
                  class="option-item"
                >
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
                id="accommodation-error"
                class="form-error"
                :class="{ 'form-error-hidden': !errors.accommodation }"
                role="alert"
                aria-live="polite"
              >
                {{ errors.accommodation || '&nbsp;' }}
              </span>
            </fieldset>

            <fieldset class="form-subfieldset" aria-describedby="diet-help">
              <legend>Restricciones alimentarias</legend>
              <p id="diet-help" class="form-help">
                Selecciona todas las opciones que apliquen. Si no tienes restricciones, deja las
                casillas sin marcar.
              </p>
              <div class="option-list option-list--checkbox">
                <div v-for="option in DIET_OPTIONS" :key="option.value" class="option-item">
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
                <RouterLink to="/politica-privacidad" class="privacy-link"
                  >política de privacidad</RouterLink
                >
                y autorizo el tratamiento de mis datos para la gestión de mi inscripción al evento.
              </span>
            </label>
            <span
              id="terms-error"
              class="form-error"
              :class="{ 'form-error-hidden': !errors.terms }"
              role="alert"
              aria-live="polite"
            >
              {{ errors.terms || '&nbsp;' }}
            </span>

            <label class="checkbox-consent">
              <input
                id="norms"
                v-model="form.norms"
                type="checkbox"
                name="norms"
                required
                aria-required="true"
                :aria-invalid="errors.norms ? 'true' : 'false'"
                :aria-describedby="describedByFor('norms')"
                @change="() => validateField('norms')"
              />
              <span>
                Declaro haber leído y aceptado las
                <RouterLink to="/normas" class="privacy-link">normas</RouterLink>
                del evento.
              </span>
            </label>

            <span
              id="norms-error"
              class="form-error"
              :class="{ 'form-error-hidden': !errors.norms }"
              role="alert"
              aria-live="polite"
            >
              {{ errors.norms || '&nbsp;' }}
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import AppCard from '@/components/AppCard.vue'
import {
  ACCOMMODATION_OPTIONS,
  CONTACT_INFO,
  DIET_OPTIONS,
  EVENT_DATES_LABEL_SHORT,
  EVENT_DATES,
  EVENT_YEAR,
  FIELD_LABELS,
  TELEGRAM_TOOLTIP,
  VALIDATION_PATTERNS,
} from '@/constants'
import { saveRegistration } from '@/services/registrationService'

defineOptions({
  name: 'RegistrationView',
})

const form = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
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
  norms: false,
})

const errors = reactive({
  firstName: '',
  lastName: '',
  nickname: '',
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
  norms: '',
})

const status = reactive({
  message: '',
  type: 'idle',
})

const isSubmitting = ref(false)
const showTelegramTooltip = ref(false)

const toggleTelegramTooltip = () => {
  showTelegramTooltip.value = !showTelegramTooltip.value
}

// Manejar cuando el ratón sale del botón (con delay para permitir mover el ratón al tooltip)
let tooltipTimeout = null
const handleTooltipMouseLeave = () => {
  // Limpiar timeout anterior si existe
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }
  // Pequeño delay para permitir mover el ratón al tooltip
  tooltipTimeout = setTimeout(() => {
    // Solo cerrar si el ratón no está sobre el tooltip ni el botón
    const tooltipElement = document.getElementById('telegram-tooltip')
    const triggerElement = document.querySelector('.tooltip-trigger')
    if (
      tooltipElement &&
      !tooltipElement.matches(':hover') &&
      triggerElement &&
      !triggerElement.matches(':hover')
    ) {
      showTelegramTooltip.value = false
    }
  }, 150)
}

// Cerrar tooltip al presionar Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && showTelegramTooltip.value) {
    showTelegramTooltip.value = false
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
    }
  }
}

// Cerrar tooltip al hacer clic fuera
const handleClickOutside = (event) => {
  if (
    showTelegramTooltip.value &&
    !event.target.closest('.tooltip') &&
    !event.target.closest('.tooltip-trigger')
  ) {
    showTelegramTooltip.value = false
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('click', handleClickOutside)
})

// Helper para obtener el día de la semana en español
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString)
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[date.getDay()]
}

// Helper para obtener el día del mes
const getDayOfMonth = (dateString) => {
  const date = new Date(dateString)
  return date.getDate()
}

const eventDetailsText = computed(() => {
  const startDayOfWeek = getDayOfWeek(EVENT_DATES.start)
  const startDay = getDayOfMonth(EVENT_DATES.start)
  const endDayOfWeek = getDayOfWeek(EVENT_DATES.end)
  const endDay = getDayOfMonth(EVENT_DATES.end)

  return `El retiro Lúdico se celebra ${EVENT_DATES_LABEL_SHORT} de ${EVENT_YEAR} en Naturcampa, Matapozuelos. El check-in comenzará el ${startDayOfWeek} ${startDay} a las 17:00 y finalizará a las 20:30. La salida y cierre del evento al público será el ${endDayOfWeek} ${endDay} a las 20:00.`
})

const minArrivalDateTime = computed(() => {
  return EVENT_DATES.start ? `${EVENT_DATES.start}T17:00` : ''
})

const maxArrivalDateTime = computed(() => {
  return EVENT_DATES.start ? `${EVENT_DATES.start}T20:00` : ''
})
const minDepartureDateTime = computed(() => {
  return EVENT_DATES.start ? `${EVENT_DATES.start}T00:00` : ''
})

const maxDepartureDateTime = computed(() => {
  return EVENT_DATES.end ? `${EVENT_DATES.end}T21:00` : ''
})

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

  const eventStart = new Date(EVENT_DATES.start)
  const eighteenthBirthday = new Date(birth)
  eighteenthBirthday.setFullYear(birth.getFullYear() + 18)

  return eighteenthBirthday > eventStart
})

const emailPattern = VALIDATION_PATTERNS.email
const phonePattern = VALIDATION_PATTERNS.phone

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
      const eventStart = new Date(EVENT_DATES.start)
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
      const start = new Date(EVENT_DATES.start)
      const end = new Date(EVENT_DATES.end)
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
      const start = new Date(EVENT_DATES.start + 'T00:00')
      const end = new Date(EVENT_DATES.end + 'T21:00')
      if (departure < start || departure > end) {
        errors.departureDate =
          'La salida debe ser entre el 21 y el 23 de agosto, hasta las 21:00 del día 23.'
        return false
      }
      if (form.arrivalDate) {
        const arrival = new Date(form.arrivalDate + 'T00:00')
        if (departure < arrival) {
          errors.departureDate = 'La fecha y hora de salida no puede ser anterior a la de llegada.'
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

    case 'norms':
      if (!form.norms) {
        errors.norms = 'Debes aceptar las normas del evento.'
        return false
      }
      errors.norms = ''
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
  'norms',
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
  form.nickname = ''
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
  form.norms = false

  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
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
    const errorFieldNames = errorFields.map((field) => FIELD_LABELS[field] || field).join(', ')

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

  try {
    // Guardar datos en Supabase
    const result = await saveRegistration(form, isMinor.value)

    if (result.success) {
      status.type = 'success'
      status.message =
        '¡Gracias por tu interés! Hemos recibido tu solicitud correctamente. Te contactaremos en las próximas horas.'
      resetForm()
    } else {
      status.type = 'error'
      // Mensajes de error más específicos según el tipo de error
      if (result.error?.includes('duplicate') || result.error?.includes('unique')) {
        status.message =
          'Ya existe un registro con esta combinación de correo electrónico, nombre y fecha de nacimiento. Si crees que es un error, contacta con nosotros.'
      } else if (result.error?.includes('network') || result.error?.includes('fetch')) {
        status.message =
          'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.'
      } else {
        status.message =
          'Se produjo un error al guardar los datos. Por favor, inténtalo de nuevo o contacta con nosotros.'
      }
      console.error('Error al guardar el registro:', result.error)
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

watch(
  () => form.norms,
  () => {
    if (errors.norms) {
      validateField('norms')
    }
  },
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

.legend-note {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-light);
  margin-left: var(--spacing-xs);
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
  position: relative;
}

.tooltip-trigger {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  transition: color 0.2s ease;
}

.tooltip-trigger:hover {
  color: var(--color-primary-dark);
}

.tooltip-trigger:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  width: 100%;
  z-index: 1000;
  display: flex;
  gap: var(--spacing-xs);
  align-items: flex-start;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 1rem;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--color-primary);
}

.tooltip-content {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-line;
}

.tooltip-close {
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.tooltip-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.tooltip-close:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .tooltip {
    left: 0;
    right: 0;
  }

  .tooltip::before {
    left: 1rem;
  }
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
  min-height: 1.25rem;
  display: block;
}

.form-error-hidden {
  visibility: hidden;
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

.form-status {
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
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

.summary-note a,
.summary-link {
  color: var(--color-accent-light);
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.summary-note a:hover,
.summary-link:hover {
  opacity: 0.8;
}

.summary-note a:focus-visible,
.summary-link:focus-visible {
  outline: 2px solid var(--color-accent-light);
  outline-offset: 2px;
  border-radius: 2px;
}

.telegram-link-small {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.telegram-link-small:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
}

.telegram-link-small:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
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
