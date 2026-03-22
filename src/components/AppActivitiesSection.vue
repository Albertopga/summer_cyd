<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader title="Detalles del evento" />
      <div class="activities-grid">
        <AppCard
          v-for="activity in ACTIVITIES"
          :key="activity.id"
          :title="activity.title"
          :icon="activity.icon"
          :text="activity.text"
          variant="activities"
          @click="openModal(activity)"
        />
        <div class="form-info-card activities-register-card">
          <h3>¿Quieres organizar alguna actividad?</h3>
          <p>
            Si quieres proponer y dirigir actividades durante el evento, registralas en el
            formulario de actividades.
          </p>
          <RouterLink to="/actividades" class="activity-link">
            Ir al formulario de actividades
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Modal de actividad -->
    <ActivityModal :isOpen="isModalOpen" :activity="selectedActivity" @close="closeModal" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppSectionHeader from './AppSectionHeader.vue'
import AppCard from './AppCard.vue'
import ActivityModal from './ActivityModal.vue'
import { ACTIVITIES } from '@/constants'

const isModalOpen = ref(false)
const selectedActivity = ref({
  title: '',
  text: '',
  icon: '',
  description: '',
})

const openModal = (activity) => {
  selectedActivity.value = activity
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}
</script>

<style scoped>
/* Mobile-first styles (por defecto) */
.activities-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* Media queries para pantallas más grandes usando sintaxis moderna */

/* Tablet */
@media (width >= 768px) {
  .activities-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }
}

/* Desktop */
@media (width >= 1024px) {
  .activities-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
  }
}

.activities-register-card {
  grid-column: 1 / -1;
}

.form-info-card {
  background-color: var(--color-white);
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: grid;
  gap: var(--spacing-sm);
}

.form-info-card h3 {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  color: var(--color-primary);
  margin: 0;
}

.form-info-card p {
  margin: 0;
  color: var(--color-text-light);
}

.activity-link {
  display: inline-block;
  margin-top: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: background-color 0.2s ease;
  text-align: center;
}

.activity-link:hover {
  background-color: var(--color-primary-dark);
}

.activity-link:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
