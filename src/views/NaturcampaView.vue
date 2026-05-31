<template>
  <div class="naturcampa-map-block">
    <AppMap
      map-src="https://www.google.com/maps/d/u/1/embed?mid=1bDj_DZCCOwyj1tIIquIUq58bIE74jUQ&ehbc=2E312F&noprof=1&ll=41.41150,-4.76138&z=17&t=h"
      label="¿Dónde estamos?"
      title="Naturcampa"
      description="Naturcampa, Matapozuelos, Valladolid, VA-403, 19, 47230"
      map-title="Mapa interactivo de Naturcampa en Matapozuelos, Valladolid"
      map-aria-label="Mapa interactivo de Google Earth mostrando la ubicación de Naturcampa en Matapozuelos, Valladolid"
    />
    <p class="map-directions">
      <a
        :href="TRAVEL_INFO.mapsDirectionsUrl"
        class="map-directions-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Abrir indicaciones en Google Maps<span class="sr-only"> (se abre en nueva ventana)</span>
      </a>
    </p>
  </div>
</template>
<script setup>
import AppMap from '../components/AppMap.vue'
import { TRAVEL_INFO } from '@/constants'
</script>
<style scoped>
.naturcampa-map-block :deep(.map-section) {
  padding-bottom: 0;
}

.map-directions {
  text-align: center;
  margin: 0;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-white);
}

.map-directions-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.map-directions-link:hover {
  color: var(--color-primary-dark);
}

.map-directions-link:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
