<template>
  <Teleport to="body">
    <Transition name="activity-modal">
      <div v-if="isOpen" class="activity-modal-overlay" @click="closeModal">
        <div class="activity-modal-content" @click.stop>
          <button class="activity-modal-close" @click="closeModal" aria-label="Cerrar modal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="activity-modal-body">
            <div class="activity-modal-icon">{{ activity.icon }}</div>
            <h2 class="activity-modal-title">{{ activity.title }}</h2>
            <p class="activity-modal-text">{{ activity.text }}</p>

            <!-- Slot para contenido adicional -->
            <div class="activity-modal-extra">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  activity: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      text: '',
      icon: '',
      description: '',
    }),
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Overlay con efecto de fade */
.activity-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 46, 28, 0.92);
  backdrop-filter: blur(8px);
  z-index: 1000;
  cursor: pointer;
  overflow-y: auto;
  padding: var(--spacing-md);
}

/* Contenido del modal con animación de expansión y rotación */
.activity-modal-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  cursor: default;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Botón de cerrar - estilo similar a AppCard hover */
.activity-modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.activity-modal-close:hover {
  background-color: var(--color-white);
  border-color: var(--color-accent-light);
  transform: rotate(90deg) scale(1.1);
  box-shadow: var(--shadow-md);
}

.activity-modal-close svg {
  display: block;
}

/* Cuerpo del modal */
.activity-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2xl);
  text-align: center;
}

/* Scrollbar personalizado */
.activity-modal-body::-webkit-scrollbar {
  width: 8px;
}

.activity-modal-body::-webkit-scrollbar-track {
  background: var(--color-cream);
}

.activity-modal-body::-webkit-scrollbar-thumb {
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
}

.activity-modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* Estilos de contenido */
.activity-modal-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
  animation: iconBounce 0.6s ease 0.3s both;
}

@keyframes iconBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.activity-modal-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.activity-modal-text {
  font-size: 1.125rem;
  color: var(--color-text-light);
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
}

.activity-modal-extra {
  margin-top: var(--spacing-xl);
}

/* Animación de entrada/salida del overlay */
.activity-modal-enter-active {
  transition: opacity 0.4s ease;
}

.activity-modal-leave-active {
  transition: opacity 0.4s ease;
}

.activity-modal-enter-from,
.activity-modal-leave-to {
  opacity: 0;
}

/* Animación del contenido - expansión y rotación */
.activity-modal-enter-active .activity-modal-content {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.activity-modal-leave-active .activity-modal-content {
  transition: all 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.activity-modal-enter-from .activity-modal-content,
.activity-modal-leave-to .activity-modal-content {
  transform: scale(0.3) rotateZ(180deg);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .activity-modal-overlay {
    padding: var(--spacing-sm);
  }

  .activity-modal-content {
    border-radius: var(--radius-lg);
  }

  .activity-modal-body {
    padding: var(--spacing-xl);
  }

  .activity-modal-icon {
    font-size: 3rem;
  }

  .activity-modal-title {
    font-size: 2rem;
  }

  .activity-modal-text {
    font-size: 1rem;
  }

  .activity-modal-close {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .activity-modal-overlay {
    padding: 0;
  }

  .activity-modal-content {
    max-height: 100vh;
  }

  .activity-modal-body {
    padding: var(--spacing-lg);
  }

  .activity-modal-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-sm);
  }

  .activity-modal-title {
    font-size: 1.75rem;
  }
}
</style>
