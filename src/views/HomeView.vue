<template>
  <div class="app">
    <AppHeader />
    <AppInfoSection />
    <AppMap
      map-src="https://www.google.com/maps/d/u/1/embed?mid=1bDj_DZCCOwyj1tIIquIUq58bIE74jUQ&ehbc=2E312F&noprof=1&ll=41.41150,-4.76138&z=17&t=h"
      title="Ubicación"
      label="¿Dónde estamos?"
      description="Naturcampa, Matapozuelos, Valladolid"
      map-title="Mapa interactivo de Naturcampa en Matapozuelos, Valladolid"
      map-aria-label="Mapa interactivo de Google Earth mostrando la ubicación de Naturcampa en Matapozuelos, Valladolid"
    />
    <AppGallerySection />
    <AppActivitiesSection />
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para la Aventura?</h2>
          <p class="cta-text">No te pierdas esta experiencia única. Las plazas son limitadas.</p>
          <button class="cta-button cta-large" type="button">Reserva tu Plaza Ahora</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppInfoSection from '../components/AppInfoSection.vue'
import AppMap from '../components/AppMap.vue'
import AppGallerySection from '../components/AppGallerySection.vue'
import AppActivitiesSection from '../components/AppActivitiesSection.vue'
</script>

<style scoped>
.cta-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: var(--spacing-2xl) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 70% 50%, rgba(244, 162, 97, 0.2) 0%, transparent 50%);
}
.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.cta-text {
  font-size: 1rem;
  color: var(--color-white);
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
}

/* @media (width >= 768px) {
  .cta-title {
    font-size: 3rem;
  }

  .cta-text {
    font-size: 1.125rem;
  }
} */

/* @media (width >= 1024px) {
  .cta-title {
    font-size: 4rem;
  }

  .cta-text {
    font-size: 1.25rem;
  }
} */
</style>
