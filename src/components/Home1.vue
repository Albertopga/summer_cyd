<template>
  <div class="min-h-screen site-container">
    <header class="hero-section">
      <div class="hero-background">
        <!-- <img
          src="/placeholder.svg?height=1080&width=1920"
          alt="Naturcampa background"
          class="hero-image"
        /> -->
        <div class="hero-gradient-overlay"></div>
      </div>

      <div class="hero-content">
        <div class="logo-container">
          <!-- <img
            src="/placeholder.svg?height=120&width=120"
            alt="C&D Logo"
            class="logo-image"
          /> -->
        </div>
        <h1 class="hero-title">C&D Summer Edition</h1>
        <p class="hero-subtitle-year">2025</p>
        <p class="hero-description">
          Una experiencia única en Naturcampa donde la aventura y la comunidad se encuentran
        </p>
        <button class="cta-button primary-cta">Inscríbete Ahora</button>
      </div>
    </header>

    <section class="info-section">
      <div class="max-w-6xl mx-auto">
        <div class="info-cards-grid">
          <div class="info-card">
            <div class="info-icon-container forest-icon-bg">
              <span class="info-icon">📅</span>
            </div>
            <h3 class="info-card-title">Fechas</h3>
            <p class="info-card-text">Del 15 al 22 de Julio, 2025</p>
          </div>

          <div class="info-card">
            <div class="info-icon-container peach-icon-bg">
              <span class="info-icon">📍</span>
            </div>
            <h3 class="info-card-title">Ubicación</h3>
            <p class="info-card-text">Naturcampa, España</p>
          </div>

          <div class="info-card">
            <div class="info-icon-container forest-icon-bg">
              <span class="info-icon">👥</span>
            </div>
            <h3 class="info-card-title">Comunidad</h3>
            <p class="info-card-text">Más de 200 participantes</p>
          </div>
        </div>

        <div class="event-description-container">
          <h2 class="section-title">El Evento</h2>
          <p class="event-description-text">
            C&D Summer Edition es más que un campamento, es una experiencia transformadora donde
            conectarás con la naturaleza, harás amistades duraderas y vivirás aventuras inolvidables
            en el corazón de Naturcampa.
          </p>
        </div>

        <div class="image-gallery">
          <div class="gallery-item large-item">
            <!-- <img
              src="/placeholder.svg?height=600&width=600"
              alt="Actividades grupales"
              class="gallery-image"
            /> -->
          </div>
          <div class="gallery-item">
            <!-- <img
              src="/placeholder.svg?height=300&width=300"
              alt="Campamento"
              class="gallery-image"
            /> -->
          </div>
          <div class="gallery-item">
            <!-- <img
              src="/placeholder.svg?height=300&width=300"
              alt="Fogata nocturna"
              class="gallery-image"
            /> -->
          </div>
          <div class="gallery-item">
            <!-- <img
              src="/placeholder.svg?height=300&width=300"
              alt="Senderismo"
              class="gallery-image"
            /> -->
          </div>
          <div class="gallery-item">
            <!-- <img
              src="/placeholder.svg?height=300&width=300"
              alt="Juegos al aire libre"
              class="gallery-image"
            /> -->
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="cta-title">¿Listo para la Aventura?</h2>
        <p class="cta-text">
          Las plazas son limitadas. Asegura tu lugar en la experiencia del verano.
        </p>
        <button class="cta-button secondary-cta">Reserva Tu Plaza</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');

:root {
  /* Color Palette */
  --color-forest: #1a4d2e;
  --color-forest-dark: #0f3320;
  --color-peach: #f4a261;
  --color-peach-dark: #e76f51;
  --color-cream: #faf8f3;
  --color-charcoal: #2d2d2d;
  --color-white: #ffffff;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-display {
  font-family: 'Playfair Display', serif;
}

.site-container {
  min-height: 100vh;
  background-color: var(--color-cream);
}

/* --- Hero Section Styles --- */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0; /* Equivalent to top: 0; right: 0; bottom: 0; left: 0; */
  background-color: var(--color-charcoal);
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(45, 45, 45, 0.4) 0%,
    transparent 50%,
    rgba(45, 45, 45, 0.6) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  max-width: 64rem; /* max-w-5xl */
}

.logo-container {
  margin-bottom: 2rem; /* mb-8 */
}

.logo-image {
  width: 7rem; /* w-28 */
  height: 7rem; /* h-28 */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
  margin-bottom: 1.5rem; /* mb-6 */
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 3.75rem; /* text-6xl */
  line-height: 1;
  font-weight: 700; /* font-bold */
  color: var(--color-cream);
  margin-bottom: 1.5rem; /* mb-6 */
  letter-spacing: -0.05em; /* tracking-tight */
}

.hero-subtitle-year {
  font-family: 'Playfair Display', serif;
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700;
  color: var(--color-peach);
  margin-bottom: 1rem; /* mb-4 */
}

.hero-description {
  font-size: 1.25rem; /* text-xl */
  color: rgba(250, 248, 243, 0.9); /* text-cream/90 */
  margin-bottom: 3rem; /* mb-12 */
  max-width: 42rem; /* max-w-2xl */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
  line-height: 1.625; /* leading-relaxed */
}

@media (min-width: 768px) {
  /* md: */
  .hero-title {
    font-size: 5rem; /* md:text-8xl */
  }
  .hero-subtitle-year {
    font-size: 2.25rem; /* md:text-4xl */
  }
  .hero-description {
    font-size: 1.5rem; /* md:text-2xl */
  }
}

/* Buttons */
.cta-button {
  padding: 1rem 2.5rem; /* px-10 py-4 / px-12 py-5 */
  border: none;
  border-radius: 9999px; /* rounded-full */
  font-size: 1.125rem; /* text-lg */
  font-weight: 600; /* font-semibold / font-bold */
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1); /* shadow-lg */
}

.primary-cta {
  background-color: var(--color-forest);
  color: var(--color-cream);
}

.primary-cta:hover {
  background-color: var(--color-forest-dark);
  transform: scale(1.05); /* hover:scale-105 */
}

.secondary-cta {
  background-color: var(--color-peach);
  color: var(--color-charcoal);
  font-weight: 700; /* font-bold */
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1); /* shadow-xl */
  padding: 1.25rem 3rem;
}

.secondary-cta:hover {
  background-color: var(--color-peach-dark);
  transform: scale(1.05); /* hover:scale-105 */
}

/* --- Info Section Styles --- */
.info-section {
  padding-top: 5rem; /* py-20 */
  padding-bottom: 5rem; /* py-20 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  background-color: var(--color-cream);
}

.info-cards-grid {
  display: grid;
  gap: 2rem; /* gap-8 */
  margin-bottom: 4rem; /* mb-16 */
}

@media (min-width: 768px) {
  .info-cards-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* md:grid-cols-3 */
  }
}

.info-card {
  background-color: var(--color-white);
  padding: 2rem; /* p-8 */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  border: 1px solid rgba(26, 77, 46, 0.1); /* border border-forest/10 */
}

.info-icon-container {
  width: 3rem; /* w-12 */
  height: 3rem; /* h-12 */
  border-radius: 9999px; /* rounded-full */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem; /* mb-4 */
}

.forest-icon-bg {
  background-color: rgba(26, 77, 46, 0.1); /* bg-forest/10 */
}

.peach-icon-bg {
  background-color: rgba(244, 162, 97, 0.2); /* bg-peach/20 */
}

.info-icon {
  font-size: 1.5rem; /* text-2xl */
}

.info-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  color: var(--color-charcoal);
  margin-bottom: 0.5rem; /* mb-2 */
}

.info-card-text {
  color: rgba(45, 45, 45, 0.7); /* text-charcoal/70 */
  line-height: 1.625; /* leading-relaxed */
}

.event-description-container {
  text-align: center;
  margin-bottom: 4rem; /* mb-16 */
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  color: var(--color-charcoal);
  margin-bottom: 1.5rem; /* mb-6 */
}

@media (min-width: 768px) {
  .section-title {
    font-size: 3rem; /* md:text-5xl */
  }
}

.event-description-text {
  font-size: 1.125rem; /* text-lg */
  color: rgba(45, 45, 45, 0.8); /* text-charcoal/80 */
  max-width: 56rem; /* max-w-3xl */
  margin-left: auto; /* mx-auto */
  margin-right: auto; /* mx-auto */
  line-height: 1.625; /* leading-relaxed */
}

/* Image Gallery Styles */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
  gap: 1rem; /* gap-4 */
}

@media (min-width: 768px) {
  .image-gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr)); /* md:grid-cols-4 */
  }
}

.gallery-item {
  /* Default item, occupies 1 column and 1 row */
}

.large-item {
  grid-column: span 2 / span 2; /* col-span-2 */
  grid-row: span 2 / span 2; /* row-span-2 */
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem; /* rounded-2xl */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1); /* shadow-md */
  transition: box-shadow 0.3s ease-in-out;
}

.gallery-image:hover {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1); /* hover:shadow-xl */
}

/* --- CTA Section Styles --- */
.cta-section {
  padding-top: 5rem; /* py-20 */
  padding-bottom: 5rem; /* py-20 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  background-color: var(--color-forest);
  color: var(--color-cream);
}

.cta-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  margin-bottom: 1.5rem; /* mb-6 */
}

@media (min-width: 768px) {
  .cta-title {
    font-size: 3rem; /* md:text-5xl */
  }
}

.cta-text {
  font-size: 1.25rem; /* text-xl */
  margin-bottom: 2.5rem; /* mb-10 */
  color: rgba(250, 248, 243, 0.9); /* text-cream/90 */
  line-height: 1.625; /* leading-relaxed */
}

/* Utility to center content within a max-width */
.max-w-6xl {
  max-width: 72rem;
}
.max-w-4xl {
  max-width: 56rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
