<template>
  <div
    class="card"
    :class="[`card--${variant}`, { 'card--featured': isFeatured }]"
    @click="handleClick"
  >
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-text">{{ text }}</p>
  </div>
</template>

<script setup>
import router from '@/router'

const props = defineProps({
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
  link: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.link && props.link !== '#') {
    router.push(props.link)
  } else {
    emit('click')
  }
}
</script>

<style scoped>
/* Mobile-first styles - estilos específicos del componente */
.card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent-light);
}

/* Los estilos base (.card, .card-icon, .card-title, .card-text) están en main.css */
/* Card Variants - solo estilos específicos de variantes */

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
  text-align: center;
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
