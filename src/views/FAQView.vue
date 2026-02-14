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
          <h2>¿Qué es el "Retiro Lúdico C&D 2026"?</h2>
          <p>
            Es un retiro de ocio alternativo, de 3 días de duración. En el se llevan a cabo un gran
            número de actividades relacionadas con juegos de mesa, torneos, partidas de rol, rol en
            vivo, talleres, demos...
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Dónde se realizan?</h2>
          <p>
            En Naturcampa. Podréis encontrar más información
            <RouterLink to="/" class="faq-link">pinchando aquí</RouterLink>.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Cuáles son las fechas?</h2>
          <p>Del {{ EVENT_DATES_LABEL_SHORT }} de {{ EVENT_YEAR }}.</p>
        </article>

        <article class="faq-section">
          <h2>¿Cuáles son las modalidades de asistencia?</h2>
          <p>
            En este evento sólo disponemos de una: alojamiento y pensión completa, aunque hay
            opciones de precios y alojamientos. Lo encontraréis todo en la sección Alojamiento y
            Precios. No hay más tipos de modalidad de asistencia.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Debo registrarme en la web?</h2>
          <p>
            Sí, la inscripción se realiza en el
            <RouterLink to="/registration" class="faq-link">formulario de inscripción</RouterLink>.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿La entrada a las jornadas es gratuita?</h2>
          <p>
            No, quien quiera venir a las jornadas, necesita estar apuntado y haber pagado su plaza.
          </p>
        </article>

        <article class="faq-section">
          <h2>Si soy menor de 18 años, ¿puedo ir solo?</h2>
          <p>Sentimos decirte que no, tienes que venir acompañado de, al menos, un adulto.</p>
        </article>

        <article class="faq-section">
          <h2>¿Es importante llevar la identificación en el cuello?</h2>
          <p>
            Todos los participantes tienen la obligación de llevar en todo momento la identificación
            de forma visible en el cuello, para evitar problemas de identificación, y una posible
            sanción por parte de la Organización.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Cuáles son las normas del Evento?</h2>
          <p>
            Las normas son de obligado cumplimiento para todos los participantes. Incumplir las
            normas puede conllevar incluso la expulsión inmediata del "Retiro Lúdico C&D". Aunque
            también recomendamos leer las Condiciones Generales de las jornadas que acepta toda
            persona que asista como alojado y participante. Puedes encontrarlas en el apartado:
            Condiciones generales.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Se puede salir y entrar del recinto?</h2>
          <p>
            Por supuesto, no es nuestra intención secuestrar a nadie. No obstante el parking
            permanecerá cerrado desde las 24:00 a las 8:00, por seguridad. Si necesitáis salir o
            entrar, deberéis llamar al teléfono que os indicaremos al acceder a la instalación.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Se puede salir del recinto y entrar posteriormente en estado ebrio?</h2>
          <p>No, no está permitido entrar en estado de embriaguez en la instalación.</p>
        </article>

        <article class="faq-section">
          <h2>
            Si tengo algún problema ¿puedo despertar a la Organización a las 4 de la madrugada?
          </h2>
          <p>
            Sí, os facilitaremos un teléfono que estará 24 horas de guardia durante las jornadas, y
            en el que podréis localizarnos si es necesario. La Organización ayudará en lo posible,
            pero no se hace responsable de lo que pueda suceder. Rogamos a los asistentes que sean
            coherentes y llamen al teléfono de organización única y exclusivamente si hay una
            emergencia, como el despertar de un primigenio.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Puedo llevar a mi mascota al evento?</h2>
          <p>
            La Asociación somos petfriendly, pero la respuesta es NO. En las instalaciones de
            Naturcampa está prohibido meter mascotas, ya que allí dentro viven animales rescatados
            (entre ellos perretes), y la dirección no permite la entrada a animalillos ajenos. Lo
            sentimos en el alma.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Tiene servicio de toallas la instalación?</h2>
          <p>
            No, Naturcampa no cuenta con servicio de toallas. Sí de sábanas, que ya están incluidas
            en el precio del alojamiento.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Puedo colaborar de alguna manera con la Organización?</h2>
          <p>
            Por supuesto que sí. En función de las posibilidades, se puede optar por ser colaborador
            (personas individuales, clubes y asociaciones) organizando actividades, o patrocinador
            (en el caso de empresas). Toda la información necesaria al respecto se encuentra en el
            apartado "Cómo colaborar".
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Hay un canal de Telegram para estar informado?</h2>
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
            Un canal de difusión en Telegram es una herramienta pensada para enviar información de
            manera unidireccional:
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
            Esto garantiza que los avisos sean claros, ordenados y fáciles de consultar cuando los
            necesites.
          </p>
          <p>
            Te recomendamos unirte al canal antes del evento para no perderte ninguna información
            importante durante el Retiro Lúdico 2026. Puedes acceder al canal desde
            <a
              :href="CONTACT_INFO.telegram"
              target="_blank"
              rel="noopener noreferrer"
              class="faq-link"
              >nuestro enlace de Telegram<span class="sr-only"> (se abre en nueva ventana)</span></a
            >.
          </p>
        </article>

        <article class="faq-section">
          <h2>¿Qué ocurre si tengo alguna duda que este FAQ no pueda contestar?</h2>
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
            y Bluesky.
          </p>
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
import { RouterLink } from 'vue-router'
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import { CONTACT_INFO, EVENT_DATES_LABEL_SHORT, EVENT_YEAR } from '@/constants'

defineOptions({
  name: 'FAQView',
})
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
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-cream-dark);
}

.faq-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.faq-section h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-md);
  line-height: 1.3;
}

.faq-section p {
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.faq-section p:last-child {
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
  .faq-section h2 {
    font-size: 1.75rem;
  }
}
</style>
