<template>
  <div class="app">
    Hero Section
    <header class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Verano 2025</div>
        <h1 class="hero-title">C&D Summer Edition</h1>
        <p class="hero-subtitle">Una aventura inolvidable en Naturcampa</p>
        <div class="hero-actions">
          <button class="cta-button cta-primary">Inscríbete Ahora</button>
          <button class="cta-button cta-secondary">Más Información</button>
        </div>
      </div>
      <div class="hero-decoration"></div>
    </header>

    Información del Evento
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">El Evento</span>
          <h2 class="section-title">Una Experiencia Única</h2>
        </div>
        <div class="content-grid">
          <div class="info-card">
            <div class="card-icon">🐉</div>
            <h3 class="card-title">¿Qué es C&D?</h3>
            <p class="card-text">
              Un encuentro único donde la comunidad se reúne para compartir experiencias, crear
              recuerdos y disfrutar de la naturaleza en un ambiente de camaradería.
            </p>
          </div>
          <div class="info-card info-card-featured">
            <div class="card-icon">📍</div>
            <h3 class="card-title">Fecha y Lugar</h3>
            <p class="card-text">
              <strong>Verano 2025</strong><br />
              Naturcampa - Un espacio natural perfecto para la aventura
            </p>
          </div>
          <div class="info-card">
            <div class="card-icon">👥</div>
            <h3 class="card-title">Comunidad</h3>
            <p class="card-text">
              Únete a una comunidad vibrante de aventureros que comparten tu pasión por la
              naturaleza y las experiencias memorables.
            </p>
          </div>
        </div>
      </div>
    </section>

    Galería Bento Grid
    <section class="section section-alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Galería</span>
          <h2 class="section-title">Momentos Memorables</h2>
        </div>
        <div class="bento-grid">
          <div class="bento-item bento-large">
            <div class="image-placeholder">
              <span class="placeholder-text">Aventura Principal</span>
            </div>
          </div>
          <div class="bento-item bento-tall">
            <div class="image-placeholder">
              <span class="placeholder-text">Naturaleza</span>
            </div>
          </div>
          <div class="bento-item">
            <div class="image-placeholder">
              <span class="placeholder-text">Camping</span>
            </div>
          </div>
          <div class="bento-item">
            <div class="image-placeholder">
              <span class="placeholder-text">Diversión</span>
            </div>
          </div>
          <div class="bento-item bento-wide">
            <div class="image-placeholder">
              <span class="placeholder-text">Comunidad</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    Actividades
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Programa</span>
          <h2 class="section-title">Actividades</h2>
        </div>
        <div class="activities-grid">
          <div class="activity-card">
            <div class="activity-icon">🏕️</div>
            <h3 class="activity-title">Camping</h3>
            <p class="activity-description">Noches bajo las estrellas en un entorno natural</p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">🎮</div>
            <h3 class="activity-title">Juegos</h3>
            <p class="activity-description">Diversión y competencias para todos</p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">🍖</div>
            <h3 class="activity-title">Barbacoa</h3>
            <p class="activity-description">Comida deliciosa preparada al aire libre</p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">🎵</div>
            <h3 class="activity-title">Música</h3>
            <p class="activity-description">Ambiente festivo con música en vivo</p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">🌲</div>
            <h3 class="activity-title">Senderismo</h3>
            <p class="activity-description">Explora los senderos naturales</p>
          </div>
          <div class="activity-card">
            <div class="activity-icon">🔥</div>
            <h3 class="activity-title">Fogata</h3>
            <p class="activity-description">Historias y canciones junto al fuego</p>
          </div>
        </div>
      </div>
    </section>

    CTA Final
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">¿Listo para la Aventura?</h2>
          <p class="cta-text">No te pierdas esta experiencia única. Las plazas son limitadas.</p>
          <button class="cta-button cta-large">Reserva tu Plaza Ahora</button>
        </div>
      </div>
    </section>

    Footer
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4 class="footer-title">C&D Summer Edition</h4>
            <p class="footer-description">Una aventura inolvidable en Naturcampa</p>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">Contacto</h4>
            <p class="footer-link">info@cydsummer.com</p>
          </div>
          <div class="footer-section">
            <h4 class="footer-title">Síguenos</h4>
            <div class="footer-social">
              <span class="social-icon">📱</span>
              <span class="social-icon">📧</span>
              <span class="social-icon">🌐</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-text">
            © 2025 C&D Summer Edition - Naturcampa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const eventDate = ref('Verano 2025')
</script>

<style>
/* Importar fuentes de Google */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

/* Variables CSS - Paleta de Colores Mejorada */
:root {
  --color-primary: #1a4d2e;
  --color-primary-light: #2d6a4f;
  --color-primary-dark: #0f2e1c;
  --color-accent: #f4a261;
  --color-accent-hover: #e76f51;
  --color-accent-light: #ffd4a3;
  --color-cream: #faf8f3;
  --color-cream-dark: #f1ede4;
  --color-text: #2d2d2d;
  --color-text-light: #5a5a5a;
  --color-white: #ffffff;

  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 3rem;
  --spacing-xl: 4rem;
  --spacing-2xl: 6rem;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  line-height: 1.6;
  background-color: var(--color-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Hero Section - Mejorado */
.hero {
  position: relative;
  min-height: 700px;
  background: linear-gradient(
    135deg,
    var(--color-primary-dark) 0%,
    var(--color-primary) 50%,
    var(--color-primary-light) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(244, 162, 97, 0.15) 0%, transparent 50%);
  z-index: 1;
}

.hero-decoration {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 100px;
  background: var(--color-white);
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: var(--color-white);
  padding: var(--spacing-md);
  max-width: 900px;
}

.hero-badge {
  display: inline-block;
  background-color: rgba(244, 162, 97, 0.2);
  color: var(--color-accent-light);
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-md);
  border: 1px solid rgba(244, 162, 97, 0.3);
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 5rem;
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: var(--spacing-lg);
  opacity: 0.95;
  letter-spacing: 0.5px;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: none;
}

.cta-primary {
  background-color: var(--color-accent);
  color: var(--color-white);
  box-shadow: 0 4px 16px rgba(244, 162, 97, 0.4);
}

.cta-primary:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(244, 162, 97, 0.5);
}

.cta-secondary {
  background-color: transparent;
  color: var(--color-white);
  border: 2px solid var(--color-white);
}

.cta-secondary:hover {
  background-color: var(--color-white);
  color: var(--color-primary);
  transform: translateY(-2px);
}

/* Sections */
.section {
  padding: var(--spacing-2xl) 0;
  background-color: var(--color-white);
}

.section-alt {
  background-color: var(--color-cream);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.section-label {
  display: inline-block;
  color: var(--color-accent);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: var(--spacing-xs);
  line-height: 1.2;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.info-card {
  background-color: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.info-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent-light);
}

.info-card-featured {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-white);
}

.info-card-featured .card-title,
.info-card-featured .card-text {
  color: var(--color-white);
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

/* Bento Grid Gallery */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.bento-item {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.4s ease;
}

.bento-item:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
  z-index: 10;
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
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.image-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.placeholder-text {
  color: var(--color-white);
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

/* Activities Grid */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.activity-card {
  background-color: var(--color-cream);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.activity-card::before {
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

.activity-card:hover::before {
  transform: scaleX(1);
}

.activity-card:hover {
  background-color: var(--color-white);
  border-color: var(--color-accent-light);
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.activity-icon {
  font-size: 3.5rem;
  margin-bottom: var(--spacing-sm);
  display: block;
}

.activity-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
}

.activity-description {
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: var(--spacing-2xl) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 70% 50%, rgba(244, 162, 97, 0.2) 0%, transparent 50%);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-white);
  margin-bottom: var(--spacing-sm);
}

.cta-text {
  font-size: 1.25rem;
  color: var(--color-white);
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
}

.cta-large {
  background-color: var(--color-accent);
  color: var(--color-white);
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.cta-large:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

/* Footer */
.footer {
  background-color: var(--color-primary-dark);
  color: var(--color-white);
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.footer-section {
  text-align: left;
}

.footer-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
  color: var(--color-accent-light);
}

.footer-description,
.footer-link {
  font-size: 0.95rem;
  opacity: 0.8;
  line-height: 1.6;
}

.footer-social {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.social-icon {
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.2);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--spacing-md);
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .bento-large,
  .bento-wide {
    grid-column: span 2;
  }

  .bento-tall {
    grid-row: span 1;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 600px;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .section-title {
    font-size: 2.25rem;
  }

  .cta-title {
    font-size: 2.25rem;
  }

  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 250px;
  }

  .bento-large,
  .bento-tall,
  .bento-wide {
    grid-column: span 1;
    grid-row: span 1;
  }

  .content-grid,
  .activities-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    text-align: center;
  }

  .footer-section {
    text-align: center;
  }

  .footer-social {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 500px;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .cta-button {
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }

  .section {
    padding: var(--spacing-xl) 0;
  }

  .section-title {
    font-size: 1.875rem;
  }
}
</style>
