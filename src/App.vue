<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import GlobalPageHeader from './components/GlobalPageHeader.vue'
import TheFooter from './components/TheFooter.vue'

const route = useRoute()
const showGlobalHeader = computed(() => route.name !== 'home')
</script>

<template>
  <div>
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

    <GlobalPageHeader v-if="showGlobalHeader" />

    <main id="main-content" role="main">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>
