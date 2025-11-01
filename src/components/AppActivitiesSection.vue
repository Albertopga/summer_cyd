<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="Programa" title="Actividades" />
      <div class="activities-grid">
        <AppCard
          v-for="activity in activities"
          :key="activity.id"
          :title="activity.title"
          :icon="activity.icon"
          variant="activities"
          @click="openModal(activity)"
        />
      </div>
    </div>

    <!-- Modal de actividad -->
    <ActivityModal :isOpen="isModalOpen" :activity="selectedActivity" @close="closeModal" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import AppSectionHeader from './AppSectionHeader.vue'
import AppCard from './AppCard.vue'
import ActivityModal from './ActivityModal.vue'

/* Recuperable de base de datos */
const activities = [
  {
    id: 1,
    title: 'Actividades',
    text: 'Actividades disponibles.',
    icon: '🎯',
    description: 'Actividades disponibles.',
  },
  {
    id: 2,
    title: 'Alojamiento',
    text: 'Opciones de alojamiento.',
    icon: '🏕️',
    description: 'Opciones de alojamiento.',
  },
  {
    id: 3,
    title: 'Comida',
    text: 'Menú de comidas.',
    icon: '🍖',
    description: 'Menú de comidas.',
  },
  {
    id: 4,
    title: 'Juegos',
    text: 'Catálogo de juegos de mesa.',
    icon: '🎮',
    description: 'Catálogo de juegos de mesa.',
  },
]

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
</style>
