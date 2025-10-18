<template>
  <div class="bento-grid">
    <div class="bento-item bento-large">
      <img src="@/assets/images/entorno.jpg" alt="Entorno" class="image-placeholder" />
    </div>
    <div class="bento-item bento-tall">
      <img src="@/assets/images/logo_C&D_2025.png" alt="Logo" class="image-placeholder" />
    </div>
    <div class="bento-item bento-tall">
      <img src="@/assets/images/vistas.jpeg" alt="Entorno" class="image-placeholder" />
    </div>
    <div class="bento-item bento-wide">
      <img src="@/assets/images/comedor.jpg" alt="Actividades" class="image-placeholder" />
    </div>
    <div class="bento-item">
      <img src="@/assets/images/lagos.jpg" alt="Actividades" class="image-placeholder" />
    </div>
    <div class="bento-item">
      <img src="@/assets/images/piscina.jpg" alt="Actividades" class="image-placeholder" />
    </div>
  </div>
</template>
<style scoped>
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
  grid-row: span 1;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-primary);
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
.placeholder-text {
  color: var(--color-white);
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
