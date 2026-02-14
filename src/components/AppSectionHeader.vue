<template>
  <div class="section-header">
    <span class="section-label">{{ label }}</span>
    <component :is="headingLevel" class="section-title">{{ title }}</component>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  useH1: {
    type: Boolean,
    default: false,
  },
})

const headingLevel = computed(() => {
  return props.useH1 ? 'h1' : 'h2'
})
</script>

<style scoped>
/* Mobile-first styles (por defecto) */
.section-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.section-label {
  display: inline-block;
  color: var(--color-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: var(--spacing-xs);
  line-height: 1.2;
}

/* Media queries para pantallas más grandes usando sintaxis moderna */

/* Tablet */
/* @media (width >= 768px) {
  .section-header {
    margin-bottom: var(--spacing-xl);
  }

  .section-label {
    font-size: 0.875rem;
    letter-spacing: 2px;
  }

  .section-title {
    font-size: 2.25rem;
    line-height: 1.2;
  }
} */

/* Desktop */
/* @media (width >= 1024px) {
  .section-header {
    margin-bottom: var(--spacing-2xl);
  }

  .section-label {
    font-size: 0.875rem;
    letter-spacing: 2px;
  }

  .section-title {
    font-size: 3rem;
    line-height: 1.1;
  }
} */
</style>
