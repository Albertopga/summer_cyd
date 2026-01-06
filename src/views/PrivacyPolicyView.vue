<template>
  <section class="section privacy-policy">
    <div class="container">
      <AppSectionHeader label="Información Legal" title="Política de Privacidad" />

      <div class="privacy-content">
        <p class="privacy-intro">
          En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de
          abril de 2016 (RGPD) y de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de
          Datos Personales y garantía de los derechos digitales (LOPDGDD), le informamos sobre el
          tratamiento de sus datos personales.
        </p>

        <article class="privacy-section">
          <h2>1. Responsable del tratamiento</h2>
          <p>
            <strong>Responsable:</strong> Asociación cultural Castilla y Dragón<br />
            <strong>CIF/NIF:</strong> G47720610<br />
            <strong>Correo electrónico:</strong>
            <a :href="`mailto:${CONTACT_INFO.email}`">{{ CONTACT_INFO.email }}</a
            ><br />
          </p>
        </article>

        <article class="privacy-section">
          <h2>2. Finalidades del tratamiento</h2>
          <p>
            Los datos personales que nos proporcione serán tratados para las siguientes finalidades:
          </p>
          <ul>
            <li>
              <strong>Gestión de la inscripción al evento:</strong> Procesamiento de su solicitud de
              inscripción, confirmación de plaza, gestión de pagos y comunicación relacionada con el
              evento.
            </li>
            <li>
              <strong>Gestión del alojamiento:</strong> Asignación y organización del alojamiento
              seleccionado según sus preferencias y necesidades especiales.
            </li>
            <li>
              <strong>Gestión de comidas:</strong> Organización de las comidas según sus
              restricciones alimentarias y preferencias dietéticas indicadas.
            </li>
            <li>
              <strong>Contacto de emergencia:</strong> Utilización exclusiva en caso de urgencia
              durante el desarrollo del evento.
            </li>
            <li>
              <strong>Cumplimiento de obligaciones legales:</strong> En caso de ser necesario para
              cumplir con obligaciones legales aplicables.
            </li>
          </ul>
        </article>

        <article class="privacy-section">
          <h2>3. Base jurídica del tratamiento</h2>
          <p>
            El tratamiento de sus datos personales se basa en el consentimiento que nos ha otorgado
            al aceptar esta política de privacidad y completar el
            <a href="/registration">formulario de inscripción</a> (art. 6.1.a) RGPD).
          </p>
          <p>
            En el caso de menores de edad, el consentimiento será otorgado por el tutor o
            responsable legal que acompañe al menor durante el evento.
          </p>
        </article>

        <article class="privacy-section">
          <h2>4. Datos que recabamos</h2>
          <p>Recabamos los siguientes datos personales:</p>
          <ul>
            <li>Datos de identificación: nombre, apellidos, fecha de nacimiento</li>
            <li>Datos de contacto: correo electrónico, teléfono</li>
            <li>Datos de inscripción: tipo de alojamiento, fecha de entrada y salida</li>
            <li>Datos de preferencias: restricciones alimentarias, necesidades especiales</li>
            <li>Datos de contacto de emergencia: nombre y teléfono del contacto de emergencia</li>
            <li>En caso de menores: datos del tutor o responsable acompañante (nombre completo)</li>
          </ul>
        </article>

        <article class="privacy-section">
          <h2>5. Conservación de los datos</h2>
          <p>
            Sus datos personales se conservarán durante el tiempo necesario para cumplir con las
            finalidades para las que fueron recabados y, en todo caso, durante los plazos
            establecidos por la legislación aplicable.
          </p>
          <p>
            En concreto, los datos se conservarán durante un período máximo de 3 años desde la
            finalización del evento, salvo que exista una obligación legal que requiera una
            conservación superior o que usted ejerza su derecho de supresión antes de dicho plazo.
          </p>
        </article>

        <article class="privacy-section">
          <h2>6. Destinatarios de los datos</h2>
          <p>
            Sus datos personales no serán comunicados a terceros, salvo en los siguientes casos:
          </p>
          <ul>
            <li>
              <strong>Naturcampa (alojamiento):</strong> Para la gestión de las comidas y
              restricciones alimentarias, se comunicará únicamente el nombre y apellidos de las
              personas que hayan indicado alergias o restricciones alimentarias. No se facilitarán
              otros datos personales.
            </li>
            <li>
              Cuando exista una obligación legal que así lo requiera (por ejemplo, autoridades
              sanitarias en caso de emergencia).
            </li>
            <li>
              En caso de urgencia médica, se podrán facilitar los datos de contacto de emergencia a
              los servicios sanitarios correspondientes.
            </li>
          </ul>
          <p>
            No realizamos transferencias internacionales de datos fuera del Espacio Económico
            Europeo.
          </p>
        </article>

        <article class="privacy-section">
          <h2>7. Derechos del interesado</h2>
          <p>Usted tiene derecho a ejercer los siguientes derechos sobre sus datos personales:</p>
          <ul>
            <li>
              <strong>Derecho de acceso:</strong> Obtener información sobre si estamos tratando sus
              datos personales y, en su caso, acceder a los mismos.
            </li>
            <li>
              <strong>Derecho de rectificación:</strong> Solicitar la corrección de datos inexactos
              o incompletos.
            </li>
            <li>
              <strong>Derecho de supresión:</strong> Solicitar la eliminación de sus datos cuando ya
              no sean necesarios para las finalidades para las que fueron recabados.
            </li>
            <li>
              <strong>Derecho de oposición:</strong> Oponerse al tratamiento de sus datos en
              determinadas circunstancias.
            </li>
            <li>
              <strong>Derecho de limitación del tratamiento:</strong> Solicitar la limitación del
              tratamiento en determinados supuestos.
            </li>
            <li>
              <strong>Derecho a la portabilidad:</strong> Recibir sus datos en un formato
              estructurado y de uso común.
            </li>
            <li>
              <strong>Derecho a retirar el consentimiento:</strong> Retirar el consentimiento
              otorgado en cualquier momento, sin que ello afecte a la licitud del tratamiento
              anterior.
            </li>
          </ul>
        </article>

        <article class="privacy-section">
          <h2>8. Cómo ejercer sus derechos</h2>
          <p>Para ejercer sus derechos, puede dirigirse a nosotros mediante:</p>
          <ul>
            <li>
              <strong>Correo electrónico:</strong>
              <a :href="`mailto:${CONTACT_INFO.email}`">{{ CONTACT_INFO.email }}</a>
            </li>
          </ul>
          <p>
            En su solicitud deberá indicar qué derecho desea ejercer y aportar una copia de su DNI o
            documento identificativo equivalente para acreditar su identidad.
          </p>
          <p>
            Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de
            Protección de Datos (AEPD) si considera que el tratamiento de sus datos personales
            vulnera la normativa vigente. Puede contactar con la AEPD en:
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>
            o en la sede física: C/ Jorge Juan, 6, 28001 Madrid.
          </p>
        </article>

        <article class="privacy-section">
          <h2>9. Almacenamiento y medidas de seguridad</h2>
          <p>
            Sus datos personales se almacenan en la plataforma Supabase, un servicio de base de
            datos en la nube que cumple con el Reglamento General de Protección de Datos (RGPD).
            Supabase es una plataforma que implementa medidas de seguridad avanzadas y cuenta con
            certificaciones como SOC 2 Tipo 2.
          </p>
          <p>
            <strong>Ubicación de los datos:</strong> Los datos se almacenan en servidores ubicados
            en la región seleccionada durante la configuración del proyecto, garantizando el
            cumplimiento del RGPD cuando se elige una región dentro de la Unión Europea o del
            Espacio Económico Europeo.
          </p>
          <p>Adoptamos las siguientes medidas técnicas y organizativas para proteger sus datos:</p>
          <ul>
            <li>
              <strong>Cifrado de datos:</strong> Todos los datos están cifrados en tránsito mediante
              TLS y en reposo mediante cifrado AES-256.
            </li>
            <li>
              <strong>Control de acceso:</strong> Solo son accesibles por las personas autorizadas
              para la gestión del evento, mediante controles de acceso estrictos y autenticación.
            </li>
            <li>
              <strong>Monitoreo y seguridad:</strong> Supabase implementa monitoreo continuo y
              herramientas de seguridad para proteger los datos almacenados.
            </li>
            <li>No compartimos los datos con terceros salvo lo indicado en el apartado 6.</li>
            <li>Los datos se eliminan cuando ya no son necesarios según los plazos indicados.</li>
          </ul>
          <p>
            Puede obtener más información sobre las medidas de seguridad de Supabase en su
            <a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer"
              >página de seguridad<span class="sr-only"> (se abre en nueva ventana)</span></a
            >
            y su
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
              >política de privacidad<span class="sr-only"> (se abre en nueva ventana)</span></a
            >.
          </p>
        </article>

        <article class="privacy-section">
          <h2>10. Modificaciones</h2>
          <p>
            Nos reservamos el derecho a modificar esta política de privacidad para adaptarla a
            novedades legislativas, jurisprudenciales o de interpretación de la Agencia Española de
            Protección de Datos. En tal caso, se le informará de dichas modificaciones con la
            antelación suficiente.
          </p>
          <p><strong>Última actualización:</strong> Enero 2025</p>
        </article>

        <nav class="privacy-nav" aria-label="Navegación de la política de privacidad">
          <a href="/registration" class="privacy-link-back"
            >← Volver al formulario de inscripción</a
          >
        </nav>
      </div>
    </div>
  </section>
</template>

<script setup>
import AppSectionHeader from '@/components/AppSectionHeader.vue'
import { CONTACT_INFO } from '@/constants'

defineOptions({
  name: 'PrivacyPolicyView',
})
</script>

<style scoped>
.privacy-policy {
  padding: var(--spacing-lg) 0;
}

.privacy-content {
  max-width: 800px;
  margin: 0 auto;
}

.privacy-intro {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.privacy-section {
  margin-bottom: var(--spacing-lg);
}

.privacy-section h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.privacy-section p {
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.privacy-section ul {
  margin-left: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  line-height: 1.8;
}

.privacy-section li {
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
}

.privacy-section a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.privacy-section a:hover {
  color: var(--color-primary-dark);
}

.privacy-section a:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.privacy-note {
  background-color: var(--color-cream-dark);
  padding: var(--spacing-sm);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin-top: var(--spacing-sm);
}

.privacy-nav {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-cream-dark);
  text-align: center;
}

.privacy-link-back {
  display: inline-block;
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.privacy-link-back:hover {
  color: var(--color-primary-dark);
}

.privacy-link-back:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (min-width: 768px) {
  .privacy-intro {
    font-size: 1.2rem;
  }

  .privacy-section h2 {
    font-size: 1.75rem;
  }
}
</style>
