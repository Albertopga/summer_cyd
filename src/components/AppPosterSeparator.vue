<template>
  <section class="poster-separator" aria-label="Cartel del evento">
    <div class="poster-separator__top-cut"></div>
    <div class="poster-separator__overlay"></div>
    <img
      class="poster-separator__image"
      src="@/assets/images/cartel-evento.jpeg"
      alt="Cartel del Retiro Lúdico C&D 2026"
      role="button"
      tabindex="0"
      aria-label="Abrir cartel a pantalla completa"
      @click="openLightbox"
      @keydown.enter.prevent="openLightbox"
      @keydown.space.prevent="openLightbox"
    />
  </section>

  <Teleport to="body">
    <Transition name="poster-lightbox">
      <div
        v-if="isLightboxOpen"
        class="poster-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Cartel del evento a pantalla completa"
        @click="closeLightbox"
      >
        <button
          type="button"
          class="poster-lightbox__close"
          aria-label="Cerrar cartel a pantalla completa"
          @click="closeLightbox"
        >
          ×
        </button>
        <img
          src="@/assets/images/cartel-evento.jpeg"
          alt="Cartel del Retiro Lúdico C&D 2026"
          class="poster-lightbox__image"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({
  name: 'AppPosterSeparator',
})

const isLightboxOpen = ref(false)

const openLightbox = () => {
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  isLightboxOpen.value = false
  document.body.style.overflow = 'auto'
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && isLightboxOpen.value) {
    closeLightbox()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.poster-separator {
  position: relative;
  width: 100%;
  padding: calc(var(--spacing-lg) + 24px) var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(
    135deg,
    var(--color-primary-dark) 0%,
    var(--color-primary) 50%,
    var(--color-primary-light) 100%
  );
  overflow: hidden;
  display: grid;
  place-items: center;
}

.poster-separator__top-cut {
  position: absolute;
  top: -2px;
  left: 0;
  width: 100%;
  height: 36px;
  background: var(--color-white);
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 100%);
  z-index: 3;
}

.poster-separator__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(244, 162, 97, 0.18) 0%, transparent 55%);
  z-index: 1;
}

.poster-separator__image {
  position: relative;
  width: 100%;
  max-width: min(520px, calc(100vw - (var(--spacing-sm) * 2)));
  height: auto;
  opacity: 1;
  filter: none;
  z-index: 2;
  pointer-events: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  cursor: zoom-in;
}

@media (width >= 768px) {
  .poster-separator {
    padding: calc(var(--spacing-xl) + 32px) var(--spacing-lg) var(--spacing-xl);
  }

  .poster-separator__top-cut {
    height: 52px;
  }
}

.poster-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.92);
  display: grid;
  place-items: center;
  padding: var(--spacing-md);
}

.poster-lightbox__image {
  max-width: 96vw;
  max-height: 94vh;
  width: auto;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.poster-lightbox__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-primary);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
}

.poster-lightbox__close:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

.poster-lightbox-enter-active,
.poster-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.poster-lightbox-enter-from,
.poster-lightbox-leave-to {
  opacity: 0;
}
</style>
