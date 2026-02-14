<template>
  <div class="admin-tab-content">
    <div>
      <div class="list-header">
        <h2>Usuarios administradores ({{ totalUsers }})</h2>
        <div class="controls-group">
          <button
            type="button"
            @click="openCreateModal"
            class="create-button"
            aria-label="Crear nuevo usuario"
          >
            Crear usuario
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-message" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        Cargando usuarios...
      </div>

      <div v-else-if="error" class="error-message" role="alert">
        {{ error }}
      </div>

      <div v-else-if="users.length === 0" class="empty-state" role="status">
        No hay usuarios registrados
      </div>

      <div v-else class="users-table-wrapper">
        <table class="users-table" aria-label="Lista de usuarios administradores">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Email confirmado</th>
              <th scope="col">Última sesión</th>
              <th scope="col">Fecha creación</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="
                    user.email_confirmed_at ? 'status-badge--confirmed' : 'status-badge--pending'
                  "
                  :aria-label="
                    user.email_confirmed_at ? 'Email confirmado' : 'Email pendiente de confirmación'
                  "
                >
                  {{ user.email_confirmed_at ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>{{ formatDate(user.last_sign_in_at) }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button
                  type="button"
                  @click="openEditModal(user)"
                  class="edit-button"
                  :aria-label="`Editar usuario ${user.email}`"
                  :disabled="user.id !== currentUserId"
                  :title="
                    user.id !== currentUserId
                      ? 'Solo puedes editar tu propia contraseña'
                      : 'Editar tu contraseña'
                  "
                >
                  Editar
                </button>
                <button
                  type="button"
                  @click="confirmDelete(user)"
                  class="delete-button"
                  :aria-label="`Eliminar usuario ${user.email}`"
                  disabled
                  title="No se pueden eliminar usuarios desde aquí. Usa el dashboard de Supabase."
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="info-section" role="region" aria-labelledby="users-info-title">
      <h3 id="users-info-title">Información sobre gestión de usuarios</h3>
      <p>
        Como esta aplicación solo tiene frontend (sin backend), la gestión completa de usuarios
        administradores debe hacerse desde el
        <strong>Dashboard de Supabase</strong> por seguridad.
      </p>
      <p>
        <strong>Para crear usuarios administradores:</strong>
      </p>
      <ol>
        <li>
          Ve a tu proyecto en
          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer"
            >Supabase Dashboard</a
          >
        </li>
        <li>Navega a <strong>Authentication</strong> → <strong>Users</strong></li>
        <li>Haz clic en <strong>Add user</strong> → <strong>Create new user</strong></li>
        <li>Completa el formulario y marca <strong>Auto Confirm User</strong></li>
      </ol>
      <p>
        <strong>Nota sobre usuarios creados desde aquí:</strong>
      </p>
      <ul>
        <li>Los usuarios creados son <strong>usuarios reales</strong> en Supabase Auth</li>
        <li>
          <strong>Necesitan confirmar su email</strong> antes de poder iniciar sesión (recibirán un
          email de confirmación)
        </li>
        <li>
          Una vez confirmado el email, <strong>pueden iniciar sesión</strong> y acceder al panel de
          administración
        </li>
        <li>
          Para crear usuarios que puedan iniciar sesión inmediatamente (sin confirmar email), usa el
          dashboard de Supabase y marca "Auto Confirm User"
        </li>
      </ul>
    </div>
    <!-- Modal de creación -->
    <AdminUserModal v-if="showCreateModal" @close="closeCreateModal" @saved="handleUserCreated" />

    <!-- Modal de edición -->
    <AdminUserModal
      v-if="selectedUser"
      :user="selectedUser"
      @close="closeEditModal"
      @saved="handleUserUpdated"
    />

    <!-- Modal de confirmación de eliminación -->
    <div
      v-if="userToDelete"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      @click.self="cancelDelete"
      @keydown.esc="cancelDelete"
    >
      <div class="modal-content delete-modal">
        <header class="modal-header">
          <h2 id="delete-modal-title">Confirmar eliminación</h2>
          <button
            type="button"
            @click="cancelDelete"
            class="close-button"
            aria-label="Cerrar modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div class="modal-body">
          <p>No se pueden eliminar usuarios desde el panel de administración por seguridad.</p>
          <p>
            Para eliminar usuarios, ve al{' '}
            <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer"
              >Dashboard de Supabase</a
            >
            → <strong>Authentication</strong> → <strong>Users</strong>.
          </p>
          <p v-if="userToDelete.id === currentUserId" class="warning-text">
            <strong>⚠️ Advertencia:</strong> No puedes eliminar tu propia cuenta mientras estés
            autenticado.
          </p>
        </div>
        <footer class="modal-footer">
          <button type="button" @click="cancelDelete" class="cancel-button">Cancelar</button>
          <button type="button" @click="executeDelete" class="delete-button" :disabled="isDeleting">
            <span v-if="!isDeleting">Eliminar</span>
            <span v-else>
              <span class="spinner" aria-hidden="true"></span>
              Eliminando...
            </span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getAllUsers } from '@/services/adminService'
import { supabase } from '@/lib/supabase'
import AdminUserModal from '@/components/AdminUserModal.vue'

defineOptions({
  name: 'AdminUsersTab',
})

const emit = defineEmits(['update-count'])

const loading = ref(false)
const error = ref('')
const users = ref([])
const totalUsers = ref(0)
const selectedUser = ref(null)
const showCreateModal = ref(false)
const userToDelete = ref(null)
const isDeleting = ref(false)
const currentUserId = ref(null)

const loadUsers = async () => {
  loading.value = true
  error.value = ''

  // Obtener el usuario actual primero
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  currentUserId.value = currentUser?.id || null

  const result = await getAllUsers()

  if (result.success) {
    users.value = result.data || []
    totalUsers.value = result.count || 0
    emit('update-count', result.count || 0)
  } else {
    error.value = result.error || 'Error al cargar los usuarios'
  }

  loading.value = false
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const openEditModal = (user) => {
  selectedUser.value = { ...user }
}

const closeEditModal = () => {
  selectedUser.value = null
}

const handleUserCreated = () => {
  closeCreateModal()
  loadUsers()
}

const handleUserUpdated = () => {
  closeEditModal()
  loadUsers()
}

const confirmDelete = (user) => {
  userToDelete.value = user
}

const cancelDelete = () => {
  userToDelete.value = null
}

const executeDelete = async () => {
  // Esta función nunca debería ejecutarse porque el botón está deshabilitado
  // Pero por si acaso, cancelamos la operación
  cancelDelete()
  error.value =
    'No se pueden eliminar usuarios desde aquí. Usa el dashboard de Supabase (Authentication → Users).'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadUsers()
})

defineExpose({
  loadUsers,
})
</script>

<style scoped>
.admin-tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-section {
  background-color: var(--color-cream);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.info-section h3 {
  margin-top: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.info-section p {
  margin: var(--spacing-sm) 0;
}

.info-section ol {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
}

.info-section li {
  margin: var(--spacing-xs) 0;
}

.info-section a {
  color: var(--color-primary);
  text-decoration: underline;
}

.info-section a:hover {
  color: var(--color-primary-dark);
}

.info-section a:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
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

.controls-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.create-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.875rem;
}

.create-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.create-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.create-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
}

.users-table-wrapper {
  overflow-x: auto;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.users-table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: 600;
}

.users-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-cream-dark);
}

.users-table tbody tr:hover {
  background-color: var(--color-cream);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge--confirmed {
  background-color: #e6f4ea;
  color: var(--color-primary);
}

.status-badge--pending {
  background-color: #fff3cd;
  color: #856404;
}

.edit-button,
.delete-button {
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-right: var(--spacing-xs);
}

.edit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.edit-button:hover {
  background-color: var(--color-primary-dark);
}

.edit-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.delete-button {
  background-color: var(--color-accent);
  color: var(--color-white);
}

.delete-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.delete-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.delete-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: var(--color-cream-dark);
  color: var(--color-text-light);
}

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

.modal-body {
  padding: var(--spacing-lg);
}

.warning-text {
  color: var(--color-accent);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
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
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .controls-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .create-button {
    width: 100%;
  }

  .users-table {
    font-size: 0.875rem;
  }

  .users-table th,
  .users-table td {
    padding: var(--spacing-sm);
  }

  .edit-button,
  .delete-button {
    display: block;
    width: 100%;
    margin-bottom: var(--spacing-xs);
  }
}
</style>
