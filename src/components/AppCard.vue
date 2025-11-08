<template>
  <div
    class="card"
    :class="[`card--${variant}`, { 'card--featured': isFeatured }]"
    @click="handleClick"
  >
    <figure class="card-icon">
      <img v-if="iconIsImage" :src="icon" :alt="iconAltText" loading="lazy" class="icon-max-lg" />
      <span v-else aria-hidden="true" style="">{{ icon }}</span>
    </figure>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  iconAlt: {
    type: String,
    default: '',
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

const iconIsImage = computed(() => /\.(svg|png|jpe?g|webp|gif|ico)$/i.test(props.icon))

const iconAltText = computed(() => props.iconAlt || `Icono de ${props.title}`)

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

.card-icon {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon img {
  max-width: 100%;
  height: auto;
  display: block;
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
.card-icon span {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  max-width: 64px;
  max-height: 64px;
  padding: 1rem;
  margin-bottom: 0.3rem;
}
</style>
