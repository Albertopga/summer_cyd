<template>
  <div v-if="isOpen" class="modal-overlay" role="presentation" @click="closeModal">
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="ariaLabelId"
      :aria-describedby="ariaDescriptionId"
      :aria-label="ariaFallbackLabel"
      ref="modalContent"
      tabindex="-1"
      @click.stop
      @keydown="handleKeydown"
    >
      <button
        class="modal-close"
        type="button"
        @click="closeModal"
        aria-label="Cerrar modal"
        ref="closeButton"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <img :src="imageSrc" :alt="imageAlt" class="modal-image" />
      <div v-if="imageAlt" :id="modalCaptionId" class="modal-caption">
        {{ imageAlt }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  imageSrc: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const modalContent = ref(null)
const closeButton = ref(null)
let previouslyFocusedElement = null

const modalId = `app-modal-${Math.random().toString(36).slice(2, 10)}`
const modalCaptionId = `${modalId}-caption`

const ariaLabelId = computed(() => (props.imageAlt ? modalCaptionId : undefined))
const ariaDescriptionId = ariaLabelId
const ariaFallbackLabel = computed(() =>
  props.imageAlt ? undefined : 'Vista ampliada de la imagen seleccionada',
)

const closeModal = () => {
  emit('close')
}

const getFocusableElements = () => {
  if (!modalContent.value) {
    return []
  }

  return Array.from(
    modalContent.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled'))
}

const focusFirstElement = () => {
  if (closeButton.value) {
    closeButton.value.focus()
    return
  }

  const focusableElements = getFocusableElements()

  if (focusableElements.length > 0) {
    focusableElements[0].focus()
    return
  }

  modalContent.value?.focus()
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeModal()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const focusableElements = getFocusableElements()

  if (focusableElements.length === 0) {
    event.preventDefault()
    modalContent.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    focusableElements[0].focus()
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      previouslyFocusedElement = document.activeElement

      nextTick(() => {
        focusFirstElement()
      })
    } else if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus()
      previouslyFocusedElement = null
    }
  },
)

onBeforeUnmount(() => {
  if (previouslyFocusedElement instanceof HTMLElement) {
    previouslyFocusedElement.focus()
  }
})
</script>

<style scoped>
/* Modal/Lightbox styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  z-index: 1001;
}

.modal-close:hover {
  opacity: 0.7;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-caption {
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Responsive modal styles */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }

  .modal-close {
    top: -30px;
    font-size: 1.5rem;
  }

  .modal-caption {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-image {
    max-height: 70vh;
  }

  .modal-caption {
    font-size: 0.9rem;
  }
}
</style>
