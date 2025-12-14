<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="Programa" title="Actividades" />
      <div class="activities-grid">
        <AppCard
          v-for="activity in ACTIVITIES"
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
</style>
