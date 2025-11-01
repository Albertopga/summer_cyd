<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <!-- <nav>
      <RouterLink to="/home1">Home1</RouterLink>
    </nav> -->
  </header>

  <RouterView />
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
</template>
