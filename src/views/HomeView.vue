<template>
  <div class="app">
    <AppHeader />
    <AppInfoSection />
    <AppGallerySection />
    <AppActivitiesSection />
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para la Aventura?</h2>
          <p class="cta-text">No te pierdas esta experiencia única. Las plazas son limitadas.</p>
          <button class="cta-button cta-large">Reserva tu Plaza Ahora</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppInfoSection from '../components/AppInfoSection.vue'
import AppGallerySection from '../components/AppGallerySection.vue'
import AppActivitiesSection from '../components/AppActivitiesSection.vue'
</script>

<style></style>
