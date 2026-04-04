<template>
  <main id="main-content" class="admin-view">
    <div class="container">
      <!-- Recuperación: nueva contraseña (tras enlace del correo) -->
      <section v-if="showRecoveryPasswordForm" class="admin-login">
        <h1>Establecer nueva contraseña</h1>
        <p class="admin-login-lead">
          Elige una contraseña nueva para tu cuenta de administración.
        </p>
        <form @submit.prevent="handleRecoveryPasswordSubmit" class="login-form" novalidate>
          <div class="form-group">
            <label for="recovery-password">Nueva contraseña</label>
            <input
              id="recovery-password"
              v-model.trim="recoveryForm.password"
              type="password"
              required
              aria-required="true"
              autocomplete="new-password"
              minlength="6"
              :aria-invalid="recoveryErrors.password ? 'true' : 'false'"
              :aria-describedby="recoveryErrors.password ? 'recovery-password-error' : undefined"
            />
            <span
              v-if="recoveryErrors.password"
              id="recovery-password-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ recoveryErrors.password }}
            </span>
          </div>
          <div class="form-group">
            <label for="recovery-password-confirm">Confirmar contraseña</label>
            <input
              id="recovery-password-confirm"
              v-model.trim="recoveryForm.passwordConfirm"
              type="password"
              required
              aria-required="true"
              autocomplete="new-password"
              minlength="6"
              :aria-invalid="recoveryErrors.passwordConfirm ? 'true' : 'false'"
              :aria-describedby="
                recoveryErrors.passwordConfirm ? 'recovery-password-confirm-error' : undefined
              "
            />
            <span
              v-if="recoveryErrors.passwordConfirm"
              id="recovery-password-confirm-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ recoveryErrors.passwordConfirm }}
            </span>
          </div>
          <div
            v-if="recoveryStatus.message"
            class="form-status"
            :class="`form-status--${recoveryStatus.type}`"
          >
            {{ recoveryStatus.message }}
          </div>
          <button type="submit" class="cta-button cta-primary" :disabled="isSavingRecoveryPassword">
            <span v-if="!isSavingRecoveryPassword">Guardar contraseña</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Guardando...
            </span>
          </button>
          <button
            type="button"
            class="cta-button cta-secondary"
            :disabled="isSavingRecoveryPassword"
            @click="cancelPasswordRecovery"
          >
            Cancelar
          </button>
        </form>
      </section>

      <!-- Solicitar correo de recuperación -->
      <section v-else-if="authMode === 'requestReset'" class="admin-login">
        <h1>Recuperar contraseña</h1>
        <p class="admin-login-lead">
          Te enviaremos un enlace a tu correo para restablecer la contraseña.
        </p>
        <form @submit.prevent="handleRequestResetSubmit" class="login-form" novalidate>
          <div class="form-group">
            <label for="reset-email">Correo electrónico</label>
            <input
              id="reset-email"
              v-model.trim="resetForm.email"
              type="email"
              required
              aria-required="true"
              autocomplete="email"
              :aria-invalid="resetErrors.email ? 'true' : 'false'"
              :aria-describedby="resetErrors.email ? 'reset-email-error' : undefined"
            />
            <span
              v-if="resetErrors.email"
              id="reset-email-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ resetErrors.email }}
            </span>
          </div>
          <div
            v-if="resetStatus.message"
            class="form-status"
            :class="`form-status--${resetStatus.type}`"
          >
            {{ resetStatus.message }}
          </div>
          <button type="submit" class="cta-button cta-primary" :disabled="isSendingReset">
            <span v-if="!isSendingReset">Enviar enlace</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Enviando...
            </span>
          </button>
          <button
            type="button"
            class="cta-button cta-secondary"
            :disabled="isSendingReset"
            @click="goBackToLogin"
          >
            Volver al inicio de sesión
          </button>
        </form>
      </section>

      <!-- Login -->
      <section v-else-if="!isAuthenticated" class="admin-login">
        <h1>Panel de Administración</h1>
        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="form-group">
            <label for="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              v-model.trim="loginForm.email"
              type="email"
              required
              aria-required="true"
              autocomplete="email"
              :aria-invalid="loginErrors.email ? 'true' : 'false'"
              :aria-describedby="loginErrors.email ? 'email-error' : undefined"
            />
            <span
              v-if="loginErrors.email"
              id="email-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ loginErrors.email }}
            </span>
          </div>

          <div class="form-group">
            <label for="admin-password">Contraseña</label>
            <input
              id="admin-password"
              v-model.trim="loginForm.password"
              type="password"
              required
              aria-required="true"
              autocomplete="current-password"
              :aria-invalid="loginErrors.password ? 'true' : 'false'"
              :aria-describedby="loginErrors.password ? 'password-error' : undefined"
            />
            <span
              v-if="loginErrors.password"
              id="password-error"
              class="form-error"
              role="alert"
              aria-live="polite"
            >
              {{ loginErrors.password }}
            </span>
          </div>

          <div
            v-if="loginStatus.message"
            class="form-status"
            :class="`form-status--${loginStatus.type}`"
          >
            {{ loginStatus.message }}
          </div>

          <button type="submit" class="cta-button cta-primary" :disabled="isLoggingIn">
            <span v-if="!isLoggingIn">Iniciar sesión</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Iniciando sesión...
            </span>
          </button>
          <p class="admin-forgot-wrap">
            <button type="button" class="link-button" @click="authMode = 'requestReset'">
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </form>
      </section>

      <!-- Panel de administración -->
      <section v-else class="admin-panel">
        <header class="admin-header">
          <h1>Panel de Administración</h1>
          <button
            type="button"
            @click="handleLogout"
            class="logout-button"
            aria-label="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </header>

        <AdminTabs
          :tabs="tabs"
          :default-tab="defaultTab"
          aria-label="Secciones del panel de administración"
          @tab-change="handleTabChange"
        >
          <template #registrations>
            <AdminRegistrationsTab
              @update-count="(count) => updateTabCount('registrations', count)"
            />
          </template>

          <template #activities>
            <AdminActivitiesTab @update-count="(count) => updateTabCount('activities', count)" />
          </template>

          <template #users>
            <AdminUsersTab @update-count="(count) => updateTabCount('users', count)" />
          </template>
        </AdminTabs>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
  requestPasswordReset,
  updatePasswordAfterRecovery,
} from '@/services/authService'
import AdminTabs from '@/components/AdminTabs.vue'
import AdminRegistrationsTab from '@/components/AdminRegistrationsTab.vue'
import AdminActivitiesTab from '@/components/AdminActivitiesTab.vue'
import AdminUsersTab from '@/components/AdminUsersTab.vue'

defineOptions({
  name: 'AdminView',
})

/** @type {import('vue').Ref<import('@supabase/supabase-js').Session|null>} */
const sessionRef = ref(null)
const needsRecoveryPassword = ref(false)
/** @type {import('vue').Ref<'login'|'requestReset'>} */
const authMode = ref('login')

const isAuthenticated = computed(() => !!sessionRef.value)

const showRecoveryPasswordForm = computed(
  () => needsRecoveryPassword.value && !!sessionRef.value,
)

const isLoggingIn = ref(false)
const isSendingReset = ref(false)
const isSavingRecoveryPassword = ref(false)
const defaultTab = ref('registrations')

const tabCounts = reactive({
  registrations: 0,
  activities: 0,
  users: 0,
})

const tabs = computed(() => [
  {
    id: 'registrations',
    label: 'Asistentes',
    count: tabCounts.registrations,
  },
  {
    id: 'activities',
    label: 'Actividades',
    count: tabCounts.activities,
  },
  {
    id: 'users',
    label: 'Usuarios',
    count: tabCounts.users,
  },
])

const loginForm = reactive({
  email: '',
  password: '',
})

const loginErrors = reactive({
  email: '',
  password: '',
})

const loginStatus = reactive({
  message: '',
  type: 'idle',
})

const resetForm = reactive({
  email: '',
})

const resetErrors = reactive({
  email: '',
})

const resetStatus = reactive({
  message: '',
  type: 'idle',
})

const recoveryForm = reactive({
  password: '',
  passwordConfirm: '',
})

const recoveryErrors = reactive({
  password: '',
  passwordConfirm: '',
})

const recoveryStatus = reactive({
  message: '',
  type: 'idle',
})

/** @type {import('vue').Ref<{ unsubscribe: () => void }|null>} */
let authSubscription = null

function stripAuthHashFromUrl() {
  if (typeof window === 'undefined') return
  if (!window.location.pathname.endsWith('/admin')) return
  if (!window.location.hash) return
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
}

onMounted(async () => {
  const { data } = onAuthStateChange((event, session) => {
    sessionRef.value = session

    if (event === 'PASSWORD_RECOVERY') {
      needsRecoveryPassword.value = true
      authMode.value = 'login'
      nextTick(() => stripAuthHashFromUrl())
    }

    if (event === 'SIGNED_OUT') {
      needsRecoveryPassword.value = false
      authMode.value = 'login'
    }
  })
  authSubscription = data?.subscription ?? null

  const { session } = await getSession()
  sessionRef.value = session
  if (
    typeof window !== 'undefined' &&
    session &&
    window.location.hash &&
    window.location.hash.includes('type=recovery')
  ) {
    needsRecoveryPassword.value = true
    nextTick(() => stripAuthHashFromUrl())
  }
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
  authSubscription = null
})

const handleLogin = async () => {
  loginErrors.email = ''
  loginErrors.password = ''
  loginStatus.message = ''
  loginStatus.type = 'idle'

  let isValid = true

  if (!loginForm.email.trim()) {
    loginErrors.email = 'El correo electrónico es obligatorio'
    isValid = false
  }

  if (!loginForm.password.trim()) {
    loginErrors.password = 'La contraseña es obligatoria'
    isValid = false
  }

  if (!isValid) {
    return
  }

  isLoggingIn.value = true
  loginStatus.type = 'idle'
  loginStatus.message = ''

  const result = await signIn(loginForm.email, loginForm.password)

  if (result.success) {
    loginForm.email = ''
    loginForm.password = ''
  } else {
    loginStatus.type = 'error'
    loginStatus.message = result.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  }

  isLoggingIn.value = false
}

const goBackToLogin = () => {
  authMode.value = 'login'
  resetForm.email = ''
  resetErrors.email = ''
  resetStatus.message = ''
  resetStatus.type = 'idle'
}

const handleRequestResetSubmit = async () => {
  resetErrors.email = ''
  resetStatus.message = ''
  resetStatus.type = 'idle'

  if (!resetForm.email.trim()) {
    resetErrors.email = 'El correo electrónico es obligatorio'
    return
  }

  isSendingReset.value = true
  const result = await requestPasswordReset(resetForm.email)
  isSendingReset.value = false

  if (result.success) {
    resetStatus.type = 'success'
    resetStatus.message =
      'Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña. Revisa también la carpeta de spam.'
  } else {
    resetStatus.type = 'error'
    resetStatus.message = result.error || 'No se pudo enviar el correo. Inténtalo de nuevo.'
  }
}

const handleRecoveryPasswordSubmit = async () => {
  recoveryErrors.password = ''
  recoveryErrors.passwordConfirm = ''
  recoveryStatus.message = ''
  recoveryStatus.type = 'idle'

  let ok = true
  if (!recoveryForm.password || recoveryForm.password.length < 6) {
    recoveryErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    ok = false
  }
  if (recoveryForm.password !== recoveryForm.passwordConfirm) {
    recoveryErrors.passwordConfirm = 'Las contraseñas no coinciden.'
    ok = false
  }
  if (!ok) return

  isSavingRecoveryPassword.value = true
  const result = await updatePasswordAfterRecovery(recoveryForm.password)
  isSavingRecoveryPassword.value = false

  if (result.success) {
    recoveryStatus.type = 'success'
    recoveryStatus.message = 'Contraseña actualizada. Ya puedes usar el panel.'
    recoveryForm.password = ''
    recoveryForm.passwordConfirm = ''
    needsRecoveryPassword.value = false
  } else {
    recoveryStatus.type = 'error'
    recoveryStatus.message = result.error || 'No se pudo guardar la contraseña.'
  }
}

const cancelPasswordRecovery = async () => {
  await signOut()
  needsRecoveryPassword.value = false
  recoveryForm.password = ''
  recoveryForm.passwordConfirm = ''
  recoveryErrors.password = ''
  recoveryErrors.passwordConfirm = ''
  recoveryStatus.message = ''
  recoveryStatus.type = 'idle'
}

const handleLogout = async () => {
  const result = await signOut()
  if (result.success) {
    needsRecoveryPassword.value = false
  }
}

const handleTabChange = (tabId) => {
  console.log('Tab cambiado a:', tabId)
}

const updateTabCount = (tabId, count) => {
  if (Object.prototype.hasOwnProperty.call(tabCounts, tabId)) {
    tabCounts[tabId] = count
  }
}
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding: var(--spacing-lg) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Login */
.admin-login {
  max-width: 400px;
  margin: 4rem auto;
  background-color: var(--color-cream);
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.admin-login h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.admin-login-lead {
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.95rem;
  margin: 0 0 var(--spacing-lg);
  line-height: 1.45;
}

.login-form {
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
}

.form-group input:focus-visible {
  border-color: var(--color-primary);
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.form-error {
  font-size: 0.875rem;
  color: var(--color-accent);
}

.form-status {
  padding: var(--spacing-sm);
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

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.cta-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.cta-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.cta-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.cta-primary:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.cta-secondary {
  background-color: var(--color-cream-dark);
  color: var(--color-text);
}

.cta-secondary:hover:not(:disabled) {
  background-color: var(--color-cream);
}

.cta-secondary:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.admin-forgot-wrap {
  text-align: center;
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.link-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
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

/* Panel de administración */
.admin-panel {
  display: grid;
  gap: var(--spacing-lg);
}

.admin-tab-content .empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.admin-tab-content .empty-state p {
  margin: var(--spacing-sm) 0;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-cream-dark);
}

.admin-header h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0;
}

.logout-button {
  background-color: var(--color-accent);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: var(--color-accent-hover);
}

.logout-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
