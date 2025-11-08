<template>
  <header class="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-badge">24, 25 y 26 de Julio</div>
      <h1 class="hero-title">
        Retiro lúdico <br />
        C&D 2026
      </h1>
      <p class="hero-subtitle">Desconecta la rutina. Conecta con la diversión.</p>
      <div class="hero-actions">
        <button class="cta-button cta-primary">Inscríbete Ahora</button>
        <button class="cta-button cta-secondary">Más Información</button>
      </div>
    </div>
    <div class="hero-decoration"></div>
  </header>
</template>

<script setup></script>

<style scoped>
/* Mobile-first styles (por defecto) */
.hero {
  position: relative;
  min-height: 450px;
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
  height: 60px;
  background: var(--color-white);
  clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 100%);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: var(--color-white);
  padding: var(--spacing-xs);
  max-width: 100%;
}

.hero-badge {
  display: inline-block;
  background-color: rgba(244, 162, 97, 0.2);
  color: var(--color-accent-light);
  padding: 0.3rem 1rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
  border: 1px solid rgba(244, 162, 97, 0.3);
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: var(--spacing-xs);
  text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: -1px;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 1rem;
  font-weight: 300;
  margin-bottom: var(--spacing-sm);
  opacity: 0.95;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.cta-button {
  width: 100%;
  max-width: 280px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
}

/* Media queries para pantallas más grandes usando sintaxis moderna */

/* Tablet */
@media (width >= 768px) {
  .hero {
    min-height: 500px;
    padding: var(--spacing-lg) 0;
  }

  .hero-content {
    padding: var(--spacing-sm);
    max-width: 100%;
  }

  .hero-badge {
    font-size: 0.75rem;
    padding: 0.4rem 1.2rem;
    margin-bottom: var(--spacing-sm);
  }

  .hero-title {
    font-size: 3rem;
    line-height: 1.2;
    margin-bottom: var(--spacing-sm);
  }

  .hero-subtitle {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
  }

  .hero-actions {
    flex-direction: row;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  .cta-button {
    width: auto;
    max-width: none;
    padding: 0.875rem 2rem;
    font-size: 1rem;
  }
}

/* Desktop */
@media (width >= 1024px) {
  .hero {
    min-height: 700px;
  }

  .hero-content {
    padding: var(--spacing-md);
    max-width: 900px;
  }

  .hero-badge {
    font-size: 0.875rem;
    padding: 0.5rem 1.5rem;
    margin-bottom: var(--spacing-md);
  }

  .hero-title {
    font-size: 5rem;
    line-height: 1.1;
    margin-bottom: var(--spacing-sm);
  }

  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-lg);
  }

  .hero-decoration {
    height: 100px;
  }
}
</style>
