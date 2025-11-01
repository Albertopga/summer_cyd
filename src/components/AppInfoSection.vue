<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="El Evento" title="Una Experiencia Única" />
      <div class="content-grid">
        <AppCard
          title="¿Qué es C&D?"
          text="Un encuentro único donde la comunidad se reúne para compartir experiencias, crear recuerdos y disfrutar de la naturaleza en un ambiente de camaradería."
          icon="🐉"
          variant="info"
        />
        <AppCard
          title="Fecha y Lugar"
          text="24, 25 y 26 de Julio de 2026, en Naturcampa, en la localidad de Matapozuelos, Valladolid"
          icon="📍"
          variant="featured"
        />
        <AppCard
          title="Comunidad"
          text="Un encuentro único donde la comunidad se reúne para compartir experiencias, crear recuerdos y disfrutar de la naturaleza en un ambiente de camaradería."
          icon="👥"
          variant="info"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import AppSectionHeader from './AppSectionHeader.vue'
import AppCard from './AppCard.vue'
</script>

<style scoped>
/* Todos los estilos responsive están ahora centralizados en main.css */
/* Este componente usa automáticamente el sistema mobile-first global */
</style>
