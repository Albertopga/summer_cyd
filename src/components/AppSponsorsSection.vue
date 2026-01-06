<template>
  <section class="section sponsors-section">
    <div class="container">
      <AppSectionHeader label="Agradecimientos" title="Patrocinadores y Colaboradores" />
      <div v-if="sponsors.length === 0" class="sponsors-empty" role="status">
        <p>Próximamente anunciaremos nuestros patrocinadores y colaboradores.</p>
      </div>
      <div v-else class="sponsors-grid">
        <component
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          :is="sponsor.url ? 'a' : 'div'"
          :href="sponsor.url || undefined"
          :target="sponsor.url ? '_blank' : undefined"
          :rel="sponsor.url ? 'noopener noreferrer' : undefined"
          class="sponsor-item"
          :aria-label="sponsor.url ? `Visitar sitio web de ${sponsor.name}` : sponsor.name"
        >
          <img
            v-if="sponsor.logo"
            :src="sponsor.logo"
            :alt="`Logo de ${sponsor.name}`"
            class="sponsor-logo"
          />
          <span v-else class="sponsor-placeholder">{{ sponsor.name }}</span>
        </component>
      </div>
    </div>
  </section>
</template>

<script setup>
import AppSectionHeader from './AppSectionHeader.vue'
import { SPONSORS_AND_COLLABORATORS } from '@/constants'

defineOptions({
  name: 'AppSponsorsSection',
})

const sponsors = SPONSORS_AND_COLLABORATORS.filter((sponsor) => sponsor.logo || sponsor.name)
</script>

<style scoped>
.sponsors-section {
  background-color: var(--color-cream);
}

.sponsors-empty {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-light);
}

.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  align-items: center;
  justify-items: center;
}

.sponsor-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  text-decoration: none;
  width: 100%;
  max-width: 200px;
  min-height: 120px;
}

.sponsor-item[href] {
  cursor: pointer;
}

.sponsor-item:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-md);
}

.sponsor-item:active {
  transform: scale(1.05);
}

.sponsor-item:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.sponsor-logo {
  max-width: 100%;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.sponsor-item:hover .sponsor-logo {
  transform: scale(1.05);
}

.sponsor-placeholder {
  color: var(--color-text-light);
  font-size: 0.875rem;
  text-align: center;
  font-weight: 600;
}

@media (width >= 768px) {
  .sponsors-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-xl);
  }

  .sponsor-item {
    max-width: 250px;
    min-height: 150px;
  }

  .sponsor-logo {
    max-height: 100px;
  }
}

@media (width >= 1024px) {
  .sponsors-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
