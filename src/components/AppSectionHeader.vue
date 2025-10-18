<template>
  <div class="section-header">
    <span class="section-label">{{ label }}</span>
    <h2 class="section-title">{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.section-label {
  display: inline-block;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: var(--spacing-xs);
  line-height: 1.2;
}
</style>
