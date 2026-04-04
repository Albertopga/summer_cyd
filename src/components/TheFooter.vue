<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
          <h4 class="footer-title">Información</h4>
          <nav aria-label="Enlaces de información">
            <ul class="footer-links">
              <li>
                <RouterLink to="/" class="footer-link">Inicio</RouterLink>
              </li>
              <li>
                <RouterLink to="/faqs" class="footer-link">Preguntas Frecuentes</RouterLink>
              </li>
              <li>
                <RouterLink to="/normas" class="footer-link">Normas del Evento</RouterLink>
              </li>
              <li>
                <RouterLink to="/politica-privacidad" class="footer-link"
                  >Política de Privacidad</RouterLink
                >
              </li>
            </ul>
          </nav>
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
        <RouterLink
          to="/admin"
          class="footer-admin-link"
          aria-label="Acceso a la administración del sitio"
        >
          Administración
        </RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm, 0.5rem);
  margin-top: var(--spacing-md, 1rem);
  padding-top: var(--spacing-md, 1rem);
  border-top: 1px solid var(--color-cream-dark, #e8e0d5);
}

.footer-admin-link {
  font-size: 0.75rem;
  color: var(--color-text-light, #6b6b6b);
  text-decoration: none;
  font-weight: 500;
}

.footer-admin-link:hover {
  color: var(--color-primary, #2d5a4a);
  text-decoration: underline;
}

.footer-admin-link:focus-visible {
  outline: 3px solid var(--color-primary, #2d5a4a);
  outline-offset: 2px;
  border-radius: var(--radius-sm, 4px);
}
</style>
