# Plan de adaptación a las reglas de `.cursorrules`

Este documento identifica los cambios necesarios para que el proyecto cumpla las directrices descritas en `.cursorrules`, especialmente las relativas a estructura semántica, accesibilidad y convenciones de testing.

## 1. Estructura de página y landmarks

- ✅ Añadido un enlace de salto (`.skip-link`) como primer elemento en `App.vue`.
- ✅ Incluido un `<header role="banner">` con `<nav role="navigation" aria-label="Menú principal">` oculto con `.sr-only`.
- ✅ Envolvemos el contenido principal en `<main id="main-content" role="main">`.
- ✅ `TheFooter` ya expone el landmark `role="contentinfo"` y marca iconos decorativos con `aria-hidden`.

## 2. Elementos interactivos y navegación por teclado

- ⏳ Pendiente: sustituir `div` clicables en `AppBentoGrid` y `AppCard` por elementos semánticos (`button`/`a`) y añadir soporte teclado/ARIA donde corresponda.
- ✅ Botones de `AppHeader` y `HomeView` ahora definen `type="button"`.

## 3. Modal accesible (`AppModal.vue`)

- ✅ El modal declara `role="dialog"`, `aria-modal`, gestiona foco entrante/saliente y permite cerrar con `Esc`.
- ✅ Botón de cierre con `aria-label` y _focus trapping_ implementado.

## 4. Estilos de foco y utilidades globales

- ✅ Añadidas utilidades `.sr-only`, `.skip-link` y estilos globales `*:focus-visible` en `src/assets/main.css`.
- ⏳ Pendiente: revisar contrastes y estados interactivos restantes según guía WCAG.

## 5. Iconografía y contenido decorativo

- Marcar iconos decorativos (`span.social-icon`) con `aria-hidden="true"` o reemplazarlos por botones/enlaces con texto accesible si representan acciones reales.
- Revisar todas las imágenes para confirmar que tienen `alt` descriptivo o vacío (`alt=""`) cuando proceda.

## 6. Organización de pruebas

- Reubicar el test existente fuera del directorio `__tests__` conforme a la preferencia indicada (por ejemplo, colocar `AppHeader.test.js` junto al componente que valida).
- Al escribir nuevas pruebas con Vitest, emplear `test` en vez de `it` y evitar modificar los elementos a testear sin aprobación previa.

## 7. Verificación final

- Comprobar la navegación por teclado (Tab, Shift+Tab, Enter, Space, Escape).
- Validar el comportamiento con zoom al 200 %.
- Pasar herramientas automáticas (Lighthouse, axe, WAVE) y pruebas con lector de pantalla (NVDA, VoiceOver, etc.).

Aplicando estas mejoras, el proyecto se alineará con las obligaciones definidas en `.cursorrules` y las buenas prácticas de accesibilidad solicitadas.
