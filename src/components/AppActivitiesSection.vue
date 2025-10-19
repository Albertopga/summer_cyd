<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="Programa" title="Actividades" />
      <div class="activities-grid">
        <AppCard
          title="Camping"
          text="Noches bajo las estrellas en un entorno natural"
          icon="🏕️"
          variant="activities"
        />
        <AppCard
          title="Juegos"
          text="Diversión y competencias para todos"
          icon="🎮"
          variant="activities"
        />
        <AppCard
          title="Barbacoa"
          text="Comida deliciosa preparada al aire libre"
          icon="🍖"
          variant="activities"
        />
        <AppCard
          title="Fogata"
          text="Historias y canciones junto al fuego"
          icon="🔥"
          variant="activities"
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
/* Mobile-first styles (por defecto) */
.activities-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* Media queries para pantallas más grandes usando sintaxis moderna */

/* Tablet */
@media (width >= 768px) {
  .activities-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }
}

/* Desktop */
@media (width >= 1024px) {
  .activities-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
  }
}
</style>
