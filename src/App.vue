<script setup>
import { RouterView } from 'vue-router'
import TheFooter from './components/TheFooter.vue'
</script>

<template>
  <header>
    <!-- <nav>
      <RouterLink to="/home1">Home1</RouterLink>
    </nav> -->
  </header>

  <RouterView />
  <TheFooter />
</template>
