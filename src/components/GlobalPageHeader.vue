<template>
  <header role="banner" class="page-header">
    <div class="container page-header-content">
      <RouterLink to="/" class="page-logo-link" aria-label="Ir a la página de inicio">
        <img :src="siteLogo" alt="Logo de C&D Retiro Lúdico" class="page-logo" />
      </RouterLink>

      <div class="page-title-wrap">
        <p v-if="pageEyebrow" class="page-eyebrow">{{ pageEyebrow }}</p>
        <p class="page-title">{{ pageTitle }}</p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import siteLogo from '@/assets/images/logo_C&D_2025.png'

const route = useRoute()

const pageTitle = computed(() => route.meta.pageTitle ?? 'C&D: Retiro Lúdico')
const pageEyebrow = computed(() => route.meta.pageEyebrow ?? '')
</script>

<style scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(
    135deg,
    var(--color-primary-dark) 0%,
    var(--color-primary) 50%,
    var(--color-primary-light) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: var(--shadow-md);
}

.page-header-content {
  min-height: 4.8rem;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  padding-bottom: var(--spacing-xs);
}

.page-logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: 2.5rem;
  height: 2.5rem;
  transition: transform 0.2s ease;
}

.page-logo-link:hover {
  transform: scale(1.04);
}

.page-logo {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
}

.page-title-wrap {
  grid-column: 2;
  text-align: center;
}

.page-eyebrow {
  margin: 0;
  color: var(--color-accent-light);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.95;
}

.page-title {
  margin: 0;
  color: var(--color-white);
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-wrap: balance;
}

@media (width >= 768px) {
  .page-header-content {
    min-height: 5.2rem;
  }

  .page-logo-link {
    width: 3rem;
    height: 3rem;
  }

  .page-logo {
    width: 2.15rem;
    height: 2.15rem;
  }

  .page-eyebrow {
    font-size: 0.78rem;
  }

  .page-title {
    font-size: 1.75rem;
  }
}
</style>
