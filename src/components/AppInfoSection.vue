<template>
  <section class="section">
    <div class="container">
      <AppSectionHeader label="El Evento" title="Una Experiencia Única" />
      <div class="content-grid">
        <AppCard
          title="¿Quién organiza este retiro?"
          text="La asociación cultural <strong>Castilla y Dragón</strong>, una organización sin ánimo de lucro que se dedica a la promoción y difusión del ocio alternativo."
          :icon="LogoAso"
          icon-alt="Logo de la asociación cultural Castilla y Dragón"
          variant="info"
        />
        <AppCard
          ref="mapCardRef"
          title="Fecha y Lugar"
          variant="featured"
          icon="🗺️"
          modal-title="Mapa de ubicación"
        >
          <template #text>
            <strong>{{ EVENT_DATES_LABEL }} de {{ EVENT_YEAR }}</strong
            >. Desde la apertura de puertas el viernes a las 17:00, hasta las 20:00 del domingo que
            cierra el evento. <br /><strong>¿Dónde?</strong> en <strong>Naturcampa</strong>, en la
            localidad de <strong>Matapozuelos, Valladolid</strong>.
            <button
              type="button"
              class="text-link"
              @click="openMapModal"
              aria-label="Ver mapa de ubicación de Naturcampa"
            >
              Ver mapa de ubicación de Naturcampa
            </button>
          </template>
          <template #modal>
            <NaturcampaView />
          </template>
        </AppCard>
        <AppCard
          title="¿Para quién está pensado?"
          text="Pueden asistir todas las personas interesadas en disfrutar de un ambiente lúdico, compartir su afición por los juegos y formar parte de la comunidad que la asociación cultural <strong>Castilla y Dragón</strong> ha construido durante más de una década. No hay límite de edad: solo se requiere entusiasmo y ganas de pasarlo bien. ¡Te esperamos en el Retiro Lúdico más destacado del año!"
          icon="👥"
          variant="info"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import AppSectionHeader from './AppSectionHeader.vue'
import AppCard from './AppCard.vue'
import NaturcampaView from '@/views/NaturcampaView.vue'
import LogoAso from '@/assets/icons/logoAso.ico'
import { EVENT_DATES_LABEL, EVENT_YEAR } from '@/constants'

const mapCardRef = ref(null)

const openMapModal = () => {
  if (mapCardRef.value) {
    mapCardRef.value.openModal()
  }
}
</script>

<style scoped>
.text-link {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  transition: opacity 0.2s ease;
}

.text-link:hover {
  opacity: 0.8;
}

.text-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
