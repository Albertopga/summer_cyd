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

        <div v-if="loading" class="loading-message" role="status" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          Cargando registros...
        </div>

        <div v-else-if="error" class="error-message" role="alert">
          {{ error }}
        </div>

        <div v-else class="registrations-list">
          <div class="list-header">
            <h2>Registros de asistentes ({{ totalRegistrations }})</h2>
            <div class="sort-controls">
              <label for="sort-field" class="sr-only">Ordenar por</label>
              <select
                id="sort-field"
                v-model="sortField"
                @change="handleSortChange"
                class="sort-select"
              >
                <option value="accommodation_paid,created_at">Estado pago → Fecha registro</option>
                <option value="created_at">Fecha registro</option>
                <option value="accommodation_paid">Estado pago</option>
                <option value="first_name">Nombre</option>
                <option value="email">Email</option>
                <option value="accommodation">Alojamiento</option>
              </select>
              <label for="sort-direction" class="sr-only">Dirección del orden</label>
              <select
                id="sort-direction"
                v-model="sortDirection"
                @change="handleSortChange"
                class="sort-select"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>

          <div v-if="registrations.length === 0" class="empty-state" role="status">
            No hay registros disponibles
          </div>

          <div v-else class="registrations-table-wrapper">
            <table class="registrations-table" aria-label="Lista de registros de asistentes">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Email</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Alojamiento</th>
                  <th scope="col">Pagado</th>
                  <th scope="col">Fecha registro</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="registration in registrations" :key="registration.id">
                  <td>{{ registration.first_name }} {{ registration.last_name }}</td>
                  <td>{{ registration.email }}</td>
                  <td>{{ registration.phone }}</td>
                  <td>{{ getAccommodationLabel(registration.accommodation) }}</td>
                  <td>
                    <span
                      class="payment-status"
                      :class="
                        registration.accommodation_paid
                          ? 'payment-status--paid'
                          : 'payment-status--unpaid'
                      "
                      :aria-label="
                        registration.accommodation_paid
                          ? 'Alojamiento pagado'
                          : 'Alojamiento no pagado'
                      "
                    >
                      {{ registration.accommodation_paid ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td>{{ formatDate(registration.created_at) }}</td>
                  <td>
                    <button
                      type="button"
                      @click="openEditModal(registration)"
                      class="edit-button"
                      aria-label="Editar registro de {{ registration.first_name }} {{ registration.last_name }}"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Modal de edición -->
      <AdminEditModal
        v-if="selectedRegistration"
        :registration="selectedRegistration"
        @close="closeEditModal"
        @saved="handleRegistrationUpdated"
      />
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { signIn, signOut, getCurrentUser, onAuthStateChange } from '@/services/authService'
import { getAllRegistrations } from '@/services/adminService'
import { ACCOMMODATION_OPTIONS } from '@/constants'
import AdminEditModal from '@/components/AdminEditModal.vue'

defineOptions({
  name: 'AdminView',
})

const isAuthenticated = ref(false)
const isLoggingIn = ref(false)
const loading = ref(false)
const error = ref('')
const registrations = ref([])
const totalRegistrations = ref(0)
const selectedRegistration = ref(null)

// Controles de ordenamiento
const sortField = ref('accommodation_paid,created_at')
const sortDirection = ref('asc')

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
    loadRegistrations()
  }

  // Escuchar cambios en el estado de autenticación
  onAuthStateChange((event, session) => {
    isAuthenticated.value = !!session
    if (session) {
      loadRegistrations()
    } else {
      registrations.value = []
    }
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
    await loadRegistrations()
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
    registrations.value = []
  }
}

const loadRegistrations = async () => {
  loading.value = true
  error.value = ''

  // Preparar ordenamiento según selección
  let orderBy = sortField.value
  let ascending = sortDirection.value === 'asc'

  // Si es ordenamiento múltiple (accommodation_paid,created_at)
  if (orderBy === 'accommodation_paid,created_at') {
    // Para este caso especial, accommodation_paid ascendente (false primero)
    // y created_at descendente (más recientes primero)
    orderBy = 'accommodation_paid,created_at'
    ascending = 'true,false'
  }

  const result = await getAllRegistrations({
    limit: 1000,
    orderBy,
    ascending,
  })

  if (result.success) {
    registrations.value = result.data || []
    totalRegistrations.value = result.count || 0
  } else {
    error.value = result.error || 'Error al cargar los registros'
  }

  loading.value = false
}

const openEditModal = (registration) => {
  selectedRegistration.value = { ...registration }
}

const closeEditModal = () => {
  selectedRegistration.value = null
}

const handleRegistrationUpdated = () => {
  closeEditModal()
  loadRegistrations()
}

const handleSortChange = () => {
  loadRegistrations()
}

const getAccommodationLabel = (value) => {
  const option = ACCOMMODATION_OPTIONS.find((opt) => opt.value === value)
  return option ? option.label : value
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  background-color: var(--color-accent-dark);
}

.logout-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: var(--spacing-lg);
  font-size: 1.125rem;
}

.error-message {
  color: var(--color-accent);
  background-color: #fce8e6;
  border-radius: var(--radius-lg);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.list-header h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.sort-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-cream-dark);
  background-color: var(--color-white);
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.sort-select:hover {
  border-color: var(--color-primary);
}

.sort-select:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.registrations-table-wrapper {
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.registrations-table {
  width: 100%;
  border-collapse: collapse;
}

.registrations-table thead {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.registrations-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
}

.registrations-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-cream-dark);
}

.registrations-table tbody tr:hover {
  background-color: var(--color-cream);
}

.edit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-button:hover {
  background-color: var(--color-primary-dark);
}

.edit-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.payment-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
}

.payment-status--paid {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.payment-status--unpaid {
  background-color: #fce8e6;
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-controls {
    width: 100%;
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
  }

  .registrations-table {
    font-size: 0.875rem;
  }

  .registrations-table th,
  .registrations-table td {
    padding: var(--spacing-sm);
  }
}
</style>
