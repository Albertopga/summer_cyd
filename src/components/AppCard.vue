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
    <p class="card-text">
      <slot name="text">
        <span v-html="text"></span>
      </slot>
    </p>
  </div>

  <!-- Modal genérico -->
  <Teleport v-if="hasModal" to="body">
    <Transition name="card-modal">
      <div
        v-if="isModalOpen"
        class="card-modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        @click="closeModal"
      >
        <div class="card-modal-content" @click.stop>
          <button
            type="button"
            class="card-modal-close"
            @click="closeModal"
            aria-label="Cerrar modal"
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <h2 v-if="modalTitle" :id="modalTitleId" class="sr-only">{{ modalTitle }}</h2>
          <slot name="modal" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, useSlots } from 'vue'
import router from '@/router'

const slots = useSlots()

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
  modalTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const iconIsImage = computed(() => /\.(svg|png|jpe?g|webp|gif|ico)$/i.test(props.icon))

const iconAltText = computed(() => props.iconAlt || `Icono de ${props.title}`)

const hasModal = computed(() => !!props.modalTitle || !!slots.modal)

const isModalOpen = ref(false)

const modalTitleId = computed(() => `card-modal-title-${Math.random().toString(36).slice(2, 10)}`)

const openModal = () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = 'auto'
}

const handleClick = () => {
  if (props.link && props.link !== '#') {
    router.push(props.link)
  } else if (hasModal.value) {
    openModal()
  } else {
    emit('click')
  }
}

// Exponer métodos para uso externo (ej: desde un botón en el slot text)
defineExpose({
  openModal,
  closeModal,
})
</script>

<style scoped>
/* Mobile-first styles - estilos específicos del componente */
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
/* Estilos del modal */
.card-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 46, 28, 0.92);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.card-modal-content {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.card-modal-close {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 40px;
  height: 40px;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-primary);
  z-index: 10;
  transition: all 0.2s ease;
}

.card-modal-close:hover {
  background-color: var(--color-white);
  transform: scale(1.1);
}

.card-modal-close:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* Transiciones del modal */
.card-modal-enter-active,
.card-modal-leave-active {
  transition: opacity 0.3s ease;
}

.card-modal-enter-from,
.card-modal-leave-to {
  opacity: 0;
}

.card-modal-enter-active .card-modal-content,
.card-modal-leave-active .card-modal-content {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.card-modal-enter-from .card-modal-content,
.card-modal-leave-to .card-modal-content {
  transform: scale(0.9);
  opacity: 0;
}

/* Ajustes para contenido dentro del modal */
.card-modal-content :deep(.map-section) {
  padding: 0;
}

.card-modal-content :deep(.map-wrapper) {
  margin-top: 0;
}

.card-modal-content :deep(.map-container) {
  border-radius: 0;
}

/* Tablet */
@media (width >= 768px) {
  .card-modal-content {
    max-width: 90vw;
  }
}

/* Desktop */
@media (width >= 1024px) {
  .card-modal-content {
    max-width: 1200px;
  }
}
</style>
