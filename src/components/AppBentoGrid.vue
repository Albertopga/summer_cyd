<template>
  <div class="bento-grid">
    <div class="bento-item bento-large" @click="openModal(entorno, 'Entorno')">
      <AppImage :src="entorno" alt="Entorno" object-position="center" />
    </div>
    <div class="bento-item bento-tall" @click="openModal(logo, 'Logo')">
      <AppImage :src="logo" alt="Logo" object-position="bottom" />
    </div>
    <div class="bento-item bento-tall" @click="openModal(vistas, 'Vistas')">
      <AppImage :src="vistas" alt="Vistas" object-position="center" />
    </div>
    <div class="bento-item bento-wide" @click="openModal(comedor, 'Comedor')">
      <AppImage :src="comedor" alt="Comedor" object-position="center" />
    </div>
    <div class="bento-item" @click="openModal(lagos, 'Lagos')">
      <AppImage :src="lagos" alt="Lagos" object-position="center" />
    </div>
    <div class="bento-item" @click="openModal(piscina, 'Piscina')">
      <AppImage :src="piscina" alt="Piscina" object-position="bottom" />
    </div>
  </div>

  <!-- Modal/Lightbox -->
  <AppModal
    :is-open="isModalOpen"
    :image-src="modalImage"
    :image-alt="modalAlt"
    @close="closeModal"
  />
</template>
<script setup>
import { ref } from 'vue'
import AppImage from './AppImage.vue'
import AppModal from './AppModal.vue'
import logo from '@/assets/images/logo_C&D_2025.png'
import entorno from '@/assets/images/entorno.jpg'
import vistas from '@/assets/images/vistas.jpeg'
import comedor from '@/assets/images/comedor.jpg'
import lagos from '@/assets/images/lagos.jpg'
import piscina from '@/assets/images/piscina.jpg'

// Modal state
const isModalOpen = ref(false)
const modalImage = ref('')
const modalAlt = ref('')

const openModal = (imageSrc, alt) => {
  modalImage.value = imageSrc
  modalAlt.value = alt
  isModalOpen.value = true
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  // Restore body scroll
  document.body.style.overflow = 'auto'
}
</script>
<style scoped>
/* Mobile-first styles (por defecto) */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 160px;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
}

.bento-item {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.4s ease;
  cursor: pointer;
}

.bento-item:hover {
  transform: none; /* No hover effects on mobile */
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.bento-large,
.bento-tall,
.bento-wide {
  grid-column: span 1;
  grid-row: span 1;
}

/* Media queries para pantallas más grandes usando sintaxis moderna */

/* Tablet */
@media (width >= 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 180px;
    gap: var(--spacing-md);
  }

  .bento-item:hover {
    transform: scale(1.01);
  }

  .bento-large {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-tall {
    grid-row: span 1;
  }

  .bento-wide {
    grid-column: span 2;
    grid-row: span 1;
  }
}

/* Desktop */
@media (width >= 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 200px;
    gap: var(--spacing-md);
  }

  .bento-item:hover {
    transform: scale(1.02);
  }

  .bento-large {
    grid-column: span 2;
    grid-row: span 2;
  }

  .bento-tall {
    grid-row: span 2;
  }

  .bento-wide {
    grid-column: span 2;
    grid-row: span 1;
  }
}
</style>
