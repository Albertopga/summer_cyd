<script setup lang="ts">
import { EVENT_YEAR, CONTACT_INFO } from '@/constants'
import { Icon } from '@iconify/vue'
</script>

<template>
  <footer role="contentinfo" class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="footer-title">C&D: Retiro Lúdico</h4>
          <p class="footer-description">Una aventura inolvidable en Naturcampa</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-title">Contacto</h4>
          <p class="footer-link">{{ CONTACT_INFO.email }}</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-title">Síguenos</h4>
          <div class="footer-social">
            <a
              :href="CONTACT_INFO.telegram"
              class="social-icon"
              aria-label="Visitar nuestro canal de Telegram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="mdi:telegram" />
            </a>
            <a
              :href="CONTACT_INFO.instagram"
              class="social-icon"
              aria-label="Visitar nuestro perfil de Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="mdi:instagram" />
            </a>
            <a
              :href="CONTACT_INFO.facebook"
              class="social-icon"
              aria-label="Visitar nuestra página de Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon="mdi:facebook" />
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-text">© {{ EVENT_YEAR }} C&D: Retiro Lúdico.</p>
      </div>
    </div>
  </footer>
</template>
