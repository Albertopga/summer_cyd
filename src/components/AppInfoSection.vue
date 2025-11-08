<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="El Evento" title="Una Experiencia Única" />
      <div class="content-grid">
        <AppCard
          title="¿Quién organiza este retiro?"
          text="La Asociación Castilla y Dragón, una organización sin ánimo de lucro que se dedica a la promoción y difusión de la cultura y la tradición de Castilla y León."
          :icon="LogoAso"
          icon-alt="Logo de la Asociación Castilla y dragón"
          variant="info"
        />
        <AppCard
          title="Fecha y Lugar"
          text="24, 25 y 26 de Julio de 2026, en Naturcampa, en la localidad de Matapozuelos, Valladolid"
          icon="🗺️"
          variant="featured"
        />
        <AppCard
          title="¿Para quién está pensado?"
          text="Pueden asistir todas las personas interesadas en disfrutar de un ambiente lúdico, compartir su afición por los juegos y formar parte de la comunidad que Castilla y Dragón ha construido durante más de una década. No hay límite de edad: solo se requiere entusiasmo y ganas de pasarlo bien. ¡Te esperamos en el Retiro Lúdico más destacado del año"
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
import LogoAso from '@/assets/icons/logoAso.ico'
</script>

<style scoped>
/* Todos los estilos responsive están ahora centralizados en main.css */
/* Este componente usa automáticamente el sistema mobile-first global */
</style>
