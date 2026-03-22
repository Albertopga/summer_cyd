<template>
  <section class="section faq-policy">
    <div class="container">
      <AppSectionHeader
        label="Información del Evento"
        title="Preguntas Frecuentes (FAQs)"
        :use-h1="true"
      />

      <div class="faq-content">
        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Cuál es la política de cancelación de la reserva?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Si cancelas antes del 1 de agosto de {{ EVENT_YEAR }}, se retiene un 10&nbsp;% por
                gastos administrativos.
              </p>
              <p>
                Si cancelas después del 1 de agosto de {{ EVENT_YEAR }}, se retiene un 65&nbsp;% en
                aplicación de las políticas de cancelación de reservas de Campa Gestión y Ocio S.L.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Cuáles son las fechas?</h2>
            </summary>
            <div class="faq-panel">
              <p>Del {{ EVENT_DATES_LABEL_SHORT }} de {{ EVENT_YEAR }}.</p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Cuáles son las modalidades de asistencia?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                En este evento sólo disponemos de una: alojamiento y pensión completa, aunque hay
                opciones de precios y alojamientos. Lo encontraréis todo en la sección Alojamiento y
                Precios. No hay más tipos de modalidad de asistencia.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Cuáles son las normas del Evento?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Las normas son de obligado cumplimiento para todos los participantes. Incumplir las
                normas puede conllevar incluso la expulsión inmediata del "Retiro Lúdico C&D". Aunque
                también recomendamos leer las Condiciones Generales de las jornadas que acepta toda
                persona que asista como alojado y participante. Puedes encontrarlas en el apartado:
                <RouterLink to="/normas" class="faq-link">Normas del evento</RouterLink>.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Debo registrarme en la web?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Sí, la inscripción se realiza en el
                <RouterLink to="/registration" class="faq-link">formulario de inscripción</RouterLink>.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Dónde se realizan?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                En Naturcampa. Podréis encontrar más información
                <RouterLink to="/" class="faq-link">pinchando aquí</RouterLink>.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Es importante llevar la identificación en el cuello?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Todos los participantes tienen la obligación de llevar en todo momento la
                identificación de forma visible en el cuello, para evitar problemas de
                identificación, y una posible sanción por parte de la Organización.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Hasta cuándo puedo inscribirme o proponer actividades?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                La inscripción de participantes permanece abierta hasta el
                {{ registrationDeadlineLabel }} (inclusive). Para proponer actividades puedes usar el
                <RouterLink to="/actividades" class="faq-link">formulario de actividades</RouterLink>
                hasta el {{ activityDeadlineLabel }} (inclusive).
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Hay un canal de Telegram para estar informado?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Sí, hemos creado un canal oficial de difusión en Telegram para mantenerte informado
                antes y durante el Retiro Lúdico 2026.
              </p>
              <p><strong>A través de este canal compartiremos:</strong></p>
              <ul class="faq-list">
                <li>Noticias y novedades previas al evento</li>
                <li>Anuncios importantes de última hora</li>
                <li>Avisos de partidas y actividades</li>
                <li>Horarios de comienzo de cada actividad</li>
                <li>Cambios de agenda o información relevante durante el retiro</li>
              </ul>
              <p>
                El objetivo es que tengas toda la información importante en tiempo real y en un solo
                lugar, de forma cómoda y accesible desde tu móvil.
              </p>
              <p><strong>¿Qué es un canal de difusión de Telegram?</strong></p>
              <p>
                Un canal de difusión en Telegram es una herramienta pensada para enviar información
                de manera unidireccional:
              </p>
              <ul class="faq-list">
                <li>Solo la organización publica mensajes</li>
                <li>
                  Los suscriptores reciben las notificaciones, pero no pueden escribir en el canal
                </li>
                <li>No genera conversaciones ni mensajes innecesarios</li>
                <li>Puedes silenciarlo o abandonar el canal en cualquier momento</li>
              </ul>
              <p><strong>Además, tu privacidad está garantizada:</strong></p>
              <ul class="faq-list">
                <li>Los suscriptores no pueden ver a otros usuarios del canal</li>
                <li>No se muestra tu número de teléfono ni tus datos personales</li>
                <li>Solo la organización ve el número total de personas suscritas</li>
              </ul>
              <p>
                Esto garantiza que los avisos sean claros, ordenados y fáciles de consultar cuando
                los necesites.
              </p>
              <p>
                Te recomendamos unirte al canal antes del evento para no perderte ninguna
                información importante durante el Retiro Lúdico 2026. Puedes acceder al canal desde
                <a
                  :href="CONTACT_INFO.telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="faq-link"
                  >nuestro enlace de Telegram<span class="sr-only"> (se abre en nueva ventana)</span></a
                >.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿La entrada a las jornadas es gratuita?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                No, quien quiera venir a las jornadas, necesita estar apuntado y haber pagado su
                plaza.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Puedo colaborar de alguna manera con la Organización?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Por supuesto que sí. En función de las posibilidades, se puede optar por ser
                colaborador (personas individuales, clubes y asociaciones) organizando actividades, o
                patrocinador (en el caso de empresas). Toda la información necesaria al respecto se
                encuentra en el apartado
                <RouterLink to="/actividades" class="faq-link">Cómo colaborar</RouterLink>.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Puedo llevar a mi mascota al evento?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                La Asociación somos petfriendly, pero la respuesta es NO. En las instalaciones de
                Naturcampa está prohibido meter mascotas, ya que allí dentro viven animales
                rescatados (entre ellos perretes), y la dirección no permite la entrada a
                animalillos ajenos. Lo sentimos en el alma.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Qué es el "Retiro Lúdico C&D 2026"?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Es un retiro de ocio alternativo, de 3 días de duración. En el se llevan a cabo un
                gran número de actividades relacionadas con juegos de mesa, torneos, partidas de
                rol, rol en vivo, talleres, demos...
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">
                ¿Qué ocurre si tengo alguna duda que este FAQ no pueda contestar?
              </h2>
            </summary>
            <div class="faq-panel">
              <p>
                Se puede escribir un email desde el apartado Contacta de la Web:
                <a :href="`mailto:${CONTACT_INFO.email}`" class="faq-link">{{ CONTACT_INFO.email }}</a
                >.
              </p>
              <p>
                También puedes encontrarnos en la página oficial de Asociación Castilla y Dragón en
                <a
                  :href="CONTACT_INFO.facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="faq-link"
                  >Facebook<span class="sr-only"> (se abre en nueva ventana)</span></a
                >,
                <a
                  :href="CONTACT_INFO.instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="faq-link"
                  >Instagram<span class="sr-only"> (se abre en nueva ventana)</span></a
                >
                y
                <a
                  :href="CONTACT_INFO.bluesky"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="faq-link"
                  >Bluesky<span class="sr-only"> (se abre en nueva ventana)</span></a
                >.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">
                ¿Se puede salir del recinto y entrar posteriormente en estado ebrio?
              </h2>
            </summary>
            <div class="faq-panel">
              <p>No, no está permitido entrar en estado de embriaguez en la instalación.</p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Se puede salir y entrar del recinto?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                Por supuesto, no es nuestra intención secuestrar a nadie. No obstante el parking
                permanecerá cerrado desde las 24:00 a las 8:00, por seguridad. Si necesitáis salir o
                entrar, deberéis llamar al teléfono que os indicaremos al acceder a la instalación.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">¿Tiene servicio de toallas la instalación?</h2>
            </summary>
            <div class="faq-panel">
              <p>
                No, Naturcampa no cuenta con servicio de toallas. Sí de sábanas, que ya están
                incluidas en el precio del alojamiento.
              </p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">Si soy menor de 18 años, ¿puedo ir solo?</h2>
            </summary>
            <div class="faq-panel">
              <p>Sentimos decirte que no, tienes que venir acompañado de, al menos, un adulto.</p>
            </div>
          </details>
        </article>

        <article class="faq-section">
          <details class="faq-details">
            <summary class="faq-summary">
              <h2 class="faq-summary-title">
                Si tengo algún problema ¿puedo despertar a la Organización a las 4 de la madrugada?
              </h2>
            </summary>
            <div class="faq-panel">
              <p>
                Sí, os facilitaremos un teléfono que estará 24 horas de guardia durante las jornadas,
                y en el que podréis localizarnos si es necesario. La Organización ayudará en lo
                posible, pero no se hace responsable de lo que pueda suceder. Rogamos a los
                asistentes que sean coherentes y llamen al teléfono de organización única y
                exclusivamente si hay una emergencia, como el despertar de un primigenio.
              </p>
            </div>
          </details>
        </article>

        <nav class="faq-nav" aria-label="Navegación de las preguntas frecuentes">
          <div class="faq-nav-links">
            <RouterLink to="/normas" class="faq-nav-link">Normas del Evento</RouterLink>
            <RouterLink to="/politica-privacidad" class="faq-nav-link"
              >Política de Privacidad</RouterLink
            >
          </div>
          <RouterLink to="/registration" class="faq-link-back"
            >← Volver al formulario de inscripción</RouterLink
          >
        </nav>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import {
  CONTACT_INFO,
  EVENT_DATES_LABEL_SHORT,
  EVENT_YEAR,
  formatDeadlineLabelEs,
  getActivityRegistrationLastValidDate,
  getRegistrationLastValidDate,
} from '@/constants'

defineOptions({
  name: 'FAQView',
})

const registrationDeadlineLabel = computed(() =>
  formatDeadlineLabelEs(getRegistrationLastValidDate()),
)
const activityDeadlineLabel = computed(() =>
  formatDeadlineLabelEs(getActivityRegistrationLastValidDate()),
)
</script>

<style scoped>
.faq-policy {
  padding: var(--spacing-lg) 0;
}

.faq-content {
  max-width: 800px;
  margin: 0 auto;
}

.faq-section {
  margin-bottom: var(--spacing-md);
}

.faq-section:last-of-type {
  margin-bottom: 0;
}

.faq-details {
  border: 1px solid var(--color-cream-dark);
  border-radius: var(--radius-lg);
  background-color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.faq-summary {
  list-style: none;
  cursor: pointer;
  padding: var(--spacing-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  transition: background-color 0.2s ease;
}

.faq-summary::-webkit-details-marker {
  display: none;
}

.faq-summary:hover {
  background-color: var(--color-cream);
}

.faq-summary:focus-visible {
  outline: none;
}

.faq-details .faq-summary:focus-visible {
  box-shadow: inset 0 0 0 3px rgba(26, 77, 46, 0.35);
  border-radius: var(--radius-lg);
}

.faq-summary::after {
  content: '';
  flex-shrink: 0;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.45rem;
  border-right: 2px solid var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.faq-details[open] .faq-summary::after {
  transform: rotate(225deg);
  margin-top: 0.65rem;
}

.faq-summary-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
  line-height: 1.3;
  flex: 1;
  font-weight: 700;
}

.faq-panel {
  padding: 0 var(--spacing-md) var(--spacing-md);
  border-top: 1px solid var(--color-cream-dark);
}

.faq-panel p {
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.faq-panel p:last-child {
  margin-bottom: 0;
}

.faq-list {
  margin-left: var(--spacing-md);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  line-height: 1.8;
}

.faq-list li {
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
}

.faq-link {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.faq-link:hover {
  color: var(--color-primary-dark);
}

.faq-link:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.faq-nav {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
  text-align: center;
}

.faq-nav-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.faq-nav-link {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.faq-nav-link:hover {
  color: var(--color-primary-dark);
}

.faq-nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.faq-link-back {
  display: inline-block;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.faq-link-back:hover {
  color: var(--color-primary-dark);
}

.faq-link-back:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (min-width: 768px) {
  .faq-summary-title {
    font-size: 1.75rem;
  }
}
</style>
