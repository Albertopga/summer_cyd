<template>
  <main id="main-content" class="admin-view">
    <div class="container">
      <!-- Pantalla de login -->
      <section v-if="!isAuthenticated" class="admin-login">
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

          <!-- Pestaña de usuarios -->
          <template #users>
            <AdminUsersTab @update-count="(count) => updateTabCount('users', count)" />
          </template>
        </AdminTabs>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { signIn, signOut, getCurrentUser, onAuthStateChange } from '@/services/authService'
import AdminTabs from '@/components/AdminTabs.vue'
import AdminRegistrationsTab from '@/components/AdminRegistrationsTab.vue'
import AdminActivitiesTab from '@/components/AdminActivitiesTab.vue'
import AdminUsersTab from '@/components/AdminUsersTab.vue'

defineOptions({
  name: 'AdminView',
})

const isAuthenticated = ref(false)
const isLoggingIn = ref(false)
const defaultTab = ref('registrations')

// Contadores para las pestañas
const tabCounts = reactive({
  registrations: 0,
  activities: 0,
  users: 0,
})

// Configuración de pestañas
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

// Verificar autenticación al montar el componente
onMounted(async () => {
  const { user } = await getCurrentUser()
  if (user) {
    isAuthenticated.value = true
  }

  // Escuchar cambios en el estado de autenticación
  onAuthStateChange((event, session) => {
    isAuthenticated.value = !!session
  })
})

const handleLogin = async () => {
  // Validar formulario
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
    isAuthenticated.value = true
    loginForm.email = ''
    loginForm.password = ''
  } else {
    loginStatus.type = 'error'
    loginStatus.message = result.error || 'Error al iniciar sesión. Verifica tus credenciales.'
  }

  isLoggingIn.value = false
}

const handleLogout = async () => {
  const result = await signOut()
  if (result.success) {
    isAuthenticated.value = false
  }
}

const handleTabChange = (tabId) => {
  // Aquí puedes agregar lógica adicional cuando cambia la pestaña
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
  margin-bottom: var(--spacing-lg);
  text-align: center;
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
