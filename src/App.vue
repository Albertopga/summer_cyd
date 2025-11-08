<script setup>
import { RouterLink, RouterView } from 'vue-router'
import TheFooter from './components/TheFooter.vue'
</script>

<template>
  <div>
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

    <header role="banner">
      <nav role="navigation" aria-label="Menú principal" class="sr-only">
        <ul>
          <li>
            <RouterLink to="/">Inicio</RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <main id="main-content" role="main">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>
