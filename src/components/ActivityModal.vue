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

          <div
            class="activity-modal-body"
            :class="{
              'has-accommodations': activity.accommodations,
              'has-menu': activity.menu,
            }"
          >
            <div class="activity-modal-icon">{{ activity.icon }}</div>
            <h2 class="activity-modal-title">{{ activity.title }}</h2>
            <p class="activity-modal-text">
              {{
                activity.description && activity.description.trim() !== ''
                  ? activity.description
                  : activity.text
              }}
            </p>

            <!-- Enlace externo -->
            <div v-if="activity.link" class="activity-modal-link">
              <a
                :href="activity.link"
                target="_blank"
                rel="noopener noreferrer"
                class="activity-link-button"
              >
                {{ activity.linkText || 'Ver enlace' }}
                <span class="sr-only">(se abre en nueva ventana)</span>
              </a>
            </div>

            <!-- Contenido de alojamiento -->
            <div v-if="activity.accommodations" class="accommodations-section">
              <div
                v-for="accommodation in activity.accommodations"
                :key="accommodation.value"
                class="accommodation-item"
              >
                <h3 class="accommodation-title">{{ accommodation.label }}</h3>
                <p v-if="accommodation.description" class="accommodation-description">
                  {{ accommodation.description }}
                </p>
                <div
                  v-if="accommodation.images && accommodation.images.length > 0"
                  class="accommodation-images"
                >
                  <img
                    v-for="(image, index) in accommodation.images"
                    :key="index"
                    :src="image"
                    :alt="`${accommodation.label} - Imagen ${index + 1}`"
                    class="accommodation-image"
                    loading="lazy"
                    @click="openImageModal(image, accommodation.images, index)"
                    role="button"
                    tabindex="0"
                    @keydown.enter="openImageModal(image, accommodation.images, index)"
                    @keydown.space.prevent="openImageModal(image, accommodation.images, index)"
                  />
                </div>
              </div>
            </div>

            <!-- Contenido del menú -->
            <div v-if="activity.menu" class="menu-section">
              <div v-for="dayMenu in activity.menu" :key="dayMenu.date" class="menu-day">
                <h3 class="menu-day-title">{{ dayMenu.day }}</h3>
                <div
                  v-for="meal in dayMenu.meals"
                  :key="`${dayMenu.date}-${meal.type}`"
                  class="menu-meal"
                >
                  <div class="menu-meal-header">
                    <h4 class="menu-meal-type">{{ meal.type }}</h4>
                    <span v-if="meal.time" class="menu-meal-time">{{ meal.time }}</span>
                  </div>
                  <ul v-if="meal.dishes && meal.dishes.length > 0" class="menu-dishes">
                    <li v-for="(dish, index) in meal.dishes" :key="index" class="menu-dish">
                      {{ dish }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Slot para contenido adicional -->
            <div class="activity-modal-extra">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de imagen ampliada -->
    <Teleport to="body">
      <Transition name="image-lightbox">
        <div
          v-if="isImageModalOpen"
          class="image-lightbox-overlay"
          @click="closeImageModal"
          @keydown.esc="closeImageModal"
        >
          <button
            class="image-lightbox-close"
            @click="closeImageModal"
            aria-label="Cerrar imagen ampliada"
          >
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

          <button
            v-if="currentImageIndex > 0"
            class="image-lightbox-nav image-lightbox-prev"
            @click.stop="previousImage"
            aria-label="Imagen anterior"
          >
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
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            v-if="currentImageIndex < currentImages.length - 1"
            class="image-lightbox-nav image-lightbox-next"
            @click.stop="nextImage"
            aria-label="Imagen siguiente"
          >
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
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div class="image-lightbox-content" @click.stop>
            <img
              :src="currentImage"
              :alt="`Imagen ${currentImageIndex + 1} de ${currentImages.length}`"
              class="image-lightbox-image"
            />
            <div class="image-lightbox-counter">
              {{ currentImageIndex + 1 }} / {{ currentImages.length }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
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

// Estado para el modal de imagen ampliada
const isImageModalOpen = ref(false)
const currentImages = ref([])
const currentImageIndex = ref(0)

const currentImage = computed(() => {
  return currentImages.value[currentImageIndex.value] || ''
})

const openImageModal = (image, images, index) => {
  currentImages.value = images
  currentImageIndex.value = index
  isImageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  isImageModalOpen.value = false
  document.body.style.overflow = 'auto'
}

const nextImage = () => {
  if (currentImageIndex.value < currentImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

// Manejar navegación con teclado
const handleKeydown = (event) => {
  if (!isImageModalOpen.value) return

  if (event.key === 'ArrowRight') {
    nextImage()
  } else if (event.key === 'ArrowLeft') {
    previousImage()
  } else if (event.key === 'Escape') {
    closeImageModal()
  }
}

// Cerrar modal de imagen cuando se cierra el modal principal
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      closeImageModal()
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
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

.activity-modal-body.has-accommodations {
  text-align: left;
}

.activity-modal-body.has-accommodations .activity-modal-icon,
.activity-modal-body.has-accommodations .activity-modal-title,
.activity-modal-body.has-accommodations .activity-modal-text,
.activity-modal-body.has-menu .activity-modal-icon,
.activity-modal-body.has-menu .activity-modal-title,
.activity-modal-body.has-menu .activity-modal-text {
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

/* Estilos para el enlace en el modal */
.activity-modal-link {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.activity-link-button {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-accent);
  color: var(--color-white);
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.activity-link-button:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.activity-link-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Estilos para sección de alojamiento */
.accommodations-section {
  margin-top: var(--spacing-xl);
  text-align: left;
}

.accommodation-item {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-cream-dark);
}

.accommodation-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.accommodation-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.accommodation-description {
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.accommodation-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.accommodation-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.accommodation-image {
  cursor: pointer;
}

.accommodation-image:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.accommodation-image:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Responsive para imágenes de alojamiento */
@media (max-width: 768px) {
  .accommodation-title {
    font-size: 1.5rem;
  }

  .accommodation-images {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .accommodation-title {
    font-size: 1.25rem;
  }

  .accommodation-images {
    grid-template-columns: 1fr;
  }
}

/* Estilos para sección de menú */
.menu-section {
  margin-top: var(--spacing-xl);
  text-align: left;
}

.menu-day {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-cream-dark);
}

.menu-day:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.menu-day-title {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
}

.menu-meal {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-cream);
  border-radius: var(--radius-md);
}

.menu-meal:last-child {
  margin-bottom: 0;
}

.menu-meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.menu-meal-type {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.menu-meal-time {
  font-size: 0.875rem;
  color: var(--color-text-light);
  font-weight: 500;
  background-color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.menu-dishes {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-dish {
  font-size: 1rem;
  color: var(--color-text);
  line-height: 1.8;
  padding-left: var(--spacing-md);
  position: relative;
}

.menu-dish::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-accent);
  font-weight: bold;
}

/* Responsive para menú */
@media (max-width: 768px) {
  .menu-day-title {
    font-size: 1.5rem;
  }

  .menu-meal-type {
    font-size: 1.125rem;
  }

  .menu-dish {
    font-size: 0.9375rem;
  }
}

@media (max-width: 480px) {
  .menu-day-title {
    font-size: 1.25rem;
  }

  .menu-meal {
    padding: var(--spacing-sm);
  }

  .menu-meal-type {
    font-size: 1rem;
  }

  .menu-meal-time {
    font-size: 0.8125rem;
  }

  .menu-dish {
    font-size: 0.875rem;
    line-height: 1.6;
  }
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
    padding: var(--spacing-lg);
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

/* Estilos para el modal de imagen ampliada (lightbox) */
.image-lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  cursor: pointer;
}

.image-lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}

.image-lightbox-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
}

.image-lightbox-close {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.image-lightbox-close:hover {
  background-color: var(--color-white);
  border-color: var(--color-accent-light);
  transform: rotate(90deg) scale(1.1);
  box-shadow: var(--shadow-md);
}

.image-lightbox-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.95);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--spacing-md);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.image-lightbox-nav:hover {
  background-color: var(--color-white);
  border-color: var(--color-accent-light);
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--shadow-md);
}

.image-lightbox-prev {
  left: var(--spacing-lg);
}

.image-lightbox-next {
  right: var(--spacing-lg);
}

.image-lightbox-counter {
  margin-top: var(--spacing-md);
  color: var(--color-white);
  font-size: 1rem;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.6);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
}

/* Animaciones para el lightbox */
.image-lightbox-enter-active {
  transition: opacity 0.3s ease;
}

.image-lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.image-lightbox-enter-from,
.image-lightbox-leave-to {
  opacity: 0;
}

.image-lightbox-enter-active .image-lightbox-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.image-lightbox-leave-active .image-lightbox-content {
  transition: transform 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.image-lightbox-enter-from .image-lightbox-content,
.image-lightbox-leave-to .image-lightbox-content {
  transform: scale(0.8);
}

/* Responsive para el lightbox */
@media (max-width: 768px) {
  .image-lightbox-overlay {
    padding: var(--spacing-md);
  }

  .image-lightbox-close {
    top: var(--spacing-md);
    right: var(--spacing-md);
  }

  .image-lightbox-nav {
    padding: var(--spacing-sm);
  }

  .image-lightbox-prev {
    left: var(--spacing-sm);
  }

  .image-lightbox-next {
    right: var(--spacing-sm);
  }

  .image-lightbox-counter {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .image-lightbox-overlay {
    padding: var(--spacing-sm);
  }

  .image-lightbox-image {
    max-height: 80vh;
  }

  .image-lightbox-counter {
    font-size: 0.75rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>
