<template>
  <section class="map-section">
    <div class="container">
      <AppSectionHeader
        v-if="title || label"
        :label="!title ? '' : label"
        :title="title ? title : label"
      />
      <div class="map-wrapper">
        <div class="map-container">
          <iframe
            :src="mapSrc"
            :title="mapTitle"
            :aria-label="mapAriaLabel"
            class="map-iframe"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
        <p v-if="description" class="map-description">{{ description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import AppSectionHeader from './AppSectionHeader.vue'

defineProps({
  mapSrc: {
    type: String,
    required: true,
  },
  mapTitle: {
    type: String,
    default: 'Mapa interactivo de la ubicación',
  },
  mapAriaLabel: {
    type: String,
    default: 'Mapa interactivo de Google Earth mostrando la ubicación del evento',
  },
  title: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.map-section {
  padding: var(--spacing-lg) 0;
  background-color: var(--color-white);
}

.map-wrapper {
  margin-top: var(--spacing-lg);
}

.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* Aspect ratio 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  background-color: var(--color-cream);
}

.map-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.map-description {
  margin-top: var(--spacing-md);
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Tablet */
@media (width >= 768px) {
  .map-section {
    padding: var(--spacing-xl) 0;
  }

  .map-container {
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
  }

  .map-description {
    font-size: 1rem;
  }
}

/* Desktop */
@media (width >= 1024px) {
  .map-section {
    padding: var(--spacing-2xl) 0;
  }

  .map-description {
    font-size: 1.125rem;
  }
}
</style>
