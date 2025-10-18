<template>
  <div class="card" :class="[`card--${variant}`, { 'card--featured': isFeatured }]">
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'featured', 'activities'].includes(value),
  },
})
</script>

<style scoped>
.card {
  background-color: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent-light);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.card-text {
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.7;
}
/* Card Variants */
.card--info {
  background-color: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.card--featured {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-white);
}

.card--featured .card-title,
.card--featured .card-text {
  color: var(--color-white);
}

.card--activities {
  background-color: var(--color-cream);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}
.card--activities:hover::before {
  transform: scaleX(1);
}

.card--activities:hover {
  background-color: var(--color-white);
  border-color: var(--color-accent-light);
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.card--activities::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
</style>
