/**
 * Constantes del proyecto
 * Valores literales y programáticos reutilizables en toda la aplicación
 */

// Importar todas las imágenes usando import.meta.glob (forma segura para archivos con espacios)
const imageModules = import.meta.glob('@/assets/images/*.{jpg,jpeg,png}', {
  eager: true,
  as: 'url',
})

// Función helper para obtener la URL de una imagen por nombre
const getImageUrl = (filename) => {
  // Buscar la imagen que coincida con el nombre del archivo
  // Comparar el nombre del archivo al final de la ruta
  const match = Object.keys(imageModules).find((path) => {
    const pathFilename = decodeURIComponent(path.split('/').pop())
    return pathFilename === filename
  })
  return match ? imageModules[match] : null
}

// Rutas de imágenes de alojamiento
const albergueImages = [
  getImageUrl('Albergue grande des.jpg'),
  getImageUrl('Albergue  desPequeño.jpg'),
  getImageUrl('albergue grande.jpg'),
  getImageUrl('Albergue grande camas.jpeg'),
  getImageUrl('Albergue grande camas 2.0.jpeg'),
  getImageUrl('ALBERGUE-PEQUENO-NATUR.jpg'),
  getImageUrl('Albergue pequeño camas.jpeg'),
  getImageUrl('Albergues.jpeg'),
].filter(Boolean) // Eliminar valores null si alguna imagen no se encuentra

const chozosImages = [
  getImageUrl('Chozos des.jpg'),
  getImageUrl('chozo.jpg'),
  getImageUrl('chozos 3.jpg'),
  getImageUrl('Chozos lejos.jpeg'),
  getImageUrl('Chozos lejos 2.0.jpeg'),
  getImageUrl('Chozos media distancia.jpeg'),
].filter(Boolean) // Eliminar valores null si alguna imagen no se encuentra

// Fechas del evento
export const EVENT_YEAR = '2026'

export const EVENT_DATES = {
  start: '2026-08-21',
  end: '2026-08-23',
}

export const EVENT_DATES_LABEL = '21, 22 y 23 de Agosto'
export const EVENT_DATES_LABEL_SHORT = '21 al 23 de Agosto'

/** Hora máxima del último día para salida estimada (alineada con el cierre del evento a las 20:00). */
export const EVENT_DEPARTURE_MAX_TIME = '20:00'

/**
 * Parsea 'YYYY-MM-DD' como fecha local (evita desfases UTC en getDay() / getDate()).
 * @param {string} dateString
 * @returns {Date}
 */
export function parseEventDateLocal(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Último día (inclusive) para inscribirse: un mes calendario antes del inicio del evento. */
export function getRegistrationLastValidDate() {
  const start = parseEventDateLocal(EVENT_DATES.start)
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  d.setMonth(d.getMonth() - 1)
  return d
}

/** Último día (inclusive) para proponer actividades: 7 días antes del inicio del evento. */
export function getActivityRegistrationLastValidDate() {
  const start = parseEventDateLocal(EVENT_DATES.start)
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  d.setDate(d.getDate() - 7)
  return d
}

/** true si ya no se aceptan inscripciones de asistentes (día siguiente al último día válido). */
export function isRegistrationDeadlinePassed() {
  const today = startOfLocalDay(new Date())
  const last = startOfLocalDay(getRegistrationLastValidDate())
  return today > last
}

/** true si ya no se aceptan propuestas de actividades. */
export function isActivityRegistrationDeadlinePassed() {
  const today = startOfLocalDay(new Date())
  const last = startOfLocalDay(getActivityRegistrationLastValidDate())
  return today > last
}

/** Máximo de filas en `activities` por `organizer_email` (debe coincidir con la BD). */
export const MAX_ACTIVITIES_PER_ORGANIZER = 2

/** Etiqueta legible en español para una fecha local. */
export function formatDeadlineLabelEs(date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Texto común sobre electricidad en alojamientos (modal, formulario, etc.) */
export const ACCOMMODATION_OUTLETS_NOTE =
  'En todos los alojamientos hay enchufes, aunque se recomienda traer regletas o alargador.'

/**
 * Agrupa opciones con el mismo `groupKey` consecutivo (p. ej. Chozo compartido / individual).
 * @returns {Array<{ type: 'single', option: object } | { type: 'group', groupKey: string, title: string, options: object[] }>}
 */
export function groupAccommodationOptions(options) {
  if (!options?.length) return []
  const result = []
  let i = 0
  while (i < options.length) {
    const opt = options[i]
    if (opt.groupKey) {
      const gk = opt.groupKey
      const title = opt.groupTitle || 'Chozo.'
      const groupOptions = []
      while (i < options.length && options[i].groupKey === gk) {
        groupOptions.push(options[i])
        i++
      }
      result.push({ type: 'group', groupKey: gk, title, options: groupOptions })
    } else {
      result.push({ type: 'single', option: opt })
      i++
    }
  }
  return result
}

// Opciones de alojamiento
export const ACCOMMODATION_OPTIONS = [
  {
    value: 'albergue',
    label: 'Albergue compartido (130€ por persona)',
    images: albergueImages,
    description:
      'Alojamiento en el albergue compartido. Se comparten las habitaciones y los baños.',
  },
  {
    value: 'chozos',
    label: 'Compartido (2 personas, 150€ por persona)',
    fullLabel: 'Chozo — Compartido (2 personas, 150€ por persona)',
    groupKey: 'chozo',
    groupTitle: 'Chozo.',
    images: chozosImages,
    description: 'Alojamiento en chozo compartido con otra persona.',
  },
  {
    value: 'chozo-individual',
    label: 'Individual (si quieres intimidad, el Chozo para ti solo son 300€)',
    fullLabel: 'Chozo — Individual (300€)',
    groupKey: 'chozo',
    groupTitle: 'Chozo.',
    images: chozosImages,
    description: 'Si quieres intimidad, alojamiento individual en un chozo solo para ti.',
  },
  {
    value: 'especial',
    label: 'Antes necesito comentarlo con vosotros',
    description:
      'Si tienes algún caso particular, nos pondremos en contacto contigo para ayudarte.',
  },
]

// Opciones de dieta
export const DIET_OPTIONS = [
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'sin-gluten', label: 'Sin gluten' },
  { value: 'sin-lactosa', label: 'Sin lactosa' },
  { value: 'alergias', label: 'Tengo alergias (detállalo en comentarios)' },
]

// Tipos de actividades
export const ACTIVITY_TYPES = [
  { value: 'rol-vivo', label: 'Rol en Vivo' },
  { value: 'rol-mesa', label: 'Rol de Mesa' },
  { value: 'juego-mesa', label: 'Juego de Mesa' },
  { value: 'torneo', label: 'Torneo' },
  { value: 'taller', label: 'Taller' },
  { value: 'demo', label: 'Demo' },
  { value: 'otra', label: 'Otra' },
]

// Franjas horarias preferidas
export const TIME_SLOTS = [
  { value: 'viernes-tarde', label: 'Viernes tarde (17:00-20:00)' },
  { value: 'viernes-noche', label: 'Viernes noche (20:00-24:00)' },
  { value: 'sabado-manana', label: 'Sábado mañana (09:00-14:00)' },
  { value: 'sabado-tarde', label: 'Sábado tarde (14:00-20:00)' },
  { value: 'sabado-noche', label: 'Sábado noche (20:00-24:00)' },
  { value: 'domingo-manana', label: 'Domingo mañana (09:00-14:00)' },
  { value: 'domingo-tarde', label: 'Domingo tarde (14:00-20:00)' },
]

// Necesidades de espacio
export const SPACE_NEEDS = [
  { value: 'sala-interior', label: 'Sala interior' },
  { value: 'sala-exterior', label: 'Sala exterior' },
  { value: 'espacio-abierto', label: 'Espacio abierto' },
  { value: 'aula', label: 'Aula' },
  { value: 'comedor', label: 'Comedor' },
  { value: 'sin-requisitos', label: 'Sin requisitos específicos' },
]

// Menú del evento
export const EVENT_MENU = [
  {
    day: 'Viernes',
    date: '2026-08-21',
    meals: [
      {
        type: 'Merienda',
        time: '17:00-19:00',
        dishes: ['Pide tu fruta en el Rincón del mercader'],
      },
      {
        type: 'Cena',
        time: '21:30-22:15',
        dishes: ['Crema de verduras', 'Pizza variada con ensalada', 'Pan, Yogurt, Fruta y Agua'],
      },
    ],
  },
  {
    day: 'Sábado',
    date: '2026-08-22',
    meals: [
      {
        type: 'Desayuno',
        time: '09:00-09:45',
        dishes: [
          'Leche, Zumos, Nesquik, Café',
          'Biscotes con tomate y AOVE, Magdalenas ,Croissant, Cereales, Galletas',
          'Huevo, Embutido, Fruta, Yogurt',
        ],
      },
      {
        type: 'Comida',
        time: '14:00-14:45',
        dishes: ['Macarrones boloñesa', 'Pollo asado con patatas', 'Pan, Yogurt, Fruta y Agua'],
      },
      {
        type: 'Merienda',
        time: '17:00-19:00',
        dishes: ['Pide tu fruta en el Rincón del mercader'],
      },
      {
        type: 'Cena',
        time: '21:30-22:15',
        dishes: ['Gazpacho', 'Hamburguesa completa con patatas', 'Pan, Yogurt, Fruta y Agua'],
      },
    ],
  },
  {
    day: 'Domingo',
    date: '2026-08-23',
    meals: [
      {
        type: 'Desayuno',
        time: '09:00-09:45',
        dishes: [
          'Leche, Zumos, Nesquik, Café',
          'Biscotes con tomate y AOVE, Magdalenas ,Croissant, Cereales, Galletas',
          'Huevo, Embutido, Fruta, Yogurt',
        ],
      },
      {
        type: 'Comida',
        time: '14:00-14:45',
        dishes: ['Paella mixta', 'Ensalada variada', 'Pan, Yogurt, Fruta y Agua'],
      },
    ],
  },
]

// Patrones de validación
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[0-9+\s()-]{9,15}$/,
}

// Etiquetas de campos para mensajes de error
export const FIELD_LABELS = {
  firstName: 'Nombre',
  lastName: 'Apellidos',
  nickname: 'Mote/Alias',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  birthDate: 'Fecha de nacimiento',
  arrivalDate: 'Fecha de llegada',
  departureDate: 'Fecha de salida',
  accommodation: 'Alojamiento',
  emergencyContactName: 'Contacto de emergencia (nombre)',
  emergencyContactPhone: 'Contacto de emergencia (teléfono)',
  terms: 'Aceptación de términos',
}

// Actividades del evento
export const ACTIVITIES = [
  {
    id: 1,
    title: 'Actividades',
    text: 'Listado de actividades disponibles',
    icon: '🎯',
    description: 'Iremos añadiendo actividades a medida que se vayan concretando.',
  },
  {
    id: 2,
    title: 'Alojamiento',
    text: 'Opciones de alojamiento.',
    icon: '🏕️',
    description:
      'Estas son las opciones de alojamiento disponibles, que podrás seleccionar para pernoctar durante el retiro.',
    accommodations: ACCOMMODATION_OPTIONS.filter((option) => option.value !== 'especial'),
  },
  {
    id: 3,
    title: 'Comida',
    text: 'Menú de comidas durante el evento.',
    icon: '🍖',
    description:
      'Recuerda comentarnos en tu inscripción si tienes alguna alergia o restricción alimentaria, ocualquier otra necesidad que tengas.',
    menu: EVENT_MENU,
  },
  {
    id: 4,
    title: 'Juegos',
    text: 'Listado de juegos de mesa disponibles',
    icon: '🎲',
    description: 'Puedes ver los juegos de mesa disponibles, pinchando en el botón',
    link: 'https://user.myboardgamecollection.com/?user_name=Castillaydragon&catalog_sort_category=game_name&catalog_sort_direction=ASC&cover_sort_category=game_rating&cover_sort_direction=DESC&include_expansions=false&display_qr=true&games_per_page=two&font_size=55&accent_color=a0aaa3&image_display=zoom',
    linkText: 'Ver catálogo de juegos de mesa',
  },
]

export const CONTACT_INFO = {
  email: 'castillaydragon@gmail.com',
  phone: '+34600123456',
  telegram: 'https://t.me/castillaydragon',
  instagram: 'https://www.instagram.com/castillaydragon/',
  facebook: 'https://www.facebook.com/castillaydragon/',
  bluesky: 'https://bsky.app/profile/asociacioncyd.bsky.social',
}

// Patrocinadores y colaboradores
export const SPONSORS_AND_COLLABORATORS = [
  {
    id: 1,
    name: 'Maldito Games',
    logo: 'https://www.malditogames.com/wp-content/uploads/2017/09/cropped-malditologoblanco.png',
    url: 'https://www.malditogames.com/',
  },
  {
    id: 2,
    name: 'Cajón de las Muchascosas',
    logo: 'https://www.cajondelasmuchascosas.com/wp-content/uploads/2024/05/logo-CdlMC-color-transparente200.png',
    url: 'https://www.cajondelasmuchascosas.com/',
  },
  {
    id: 3,
    name: 'Distrito Zero',
    logo: 'https://distritozero.es/img/distrito-zero-logo-1609318083.jpg',
    url: 'https://distritozero.es/',
  },
  // {
  //   id: 2,
  //   name: '2 Tomatoes Games',
  //   logo: 'https://2tomatoesgames.com/img/cms/2-tomatoes-games-logo-15423026522-jpg.png',
  //   url: 'https://2tomatoesgames.com/es/',
  // },
  // {
  //   id: 3,
  //   name: 'HT Publishers',
  //   logo: 'https://cf.geekdo-images.com/46whN5qtqVnsHYztNP_CMg__imagepage/img/8AB-d_ajbAeegoNaefDJOIBpkRw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6367713.png',
  //   url: 'https://htpublishers.es/',
  // },
  // {
  //   id: 4,
  //   name: 'suseya ediciones',
  //   logo: 'https://suseyaediciones.com/wp-content/uploads/2014/01/suseya-mas-oscuro-arreglado.jpg',
  //   url: 'https://suseyaediciones.com/',
  // },
  // {
  //   id: 5,
  //   name: 'Tranjis Games',
  //   logo: 'https://donmeeple.com/wp-content/uploads/2019/11/tranjis-games-editorial-juegos-mesa.jpg',
  //   url: 'https://tranjisgames.com/',
  // },
  // {
  //   id: 6,
  //   name: 'Haba',
  //   logo: 'https://cf.geekdo-images.com/B4J83FsN8OXJd3vfj0UxjA__imagepagezoom/img/rLKzBWI0PsrYA6C6wHBdTklh5pI=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8366956.jpg',
  //   url: '',
  // },
  // {
  //   id: 7,
  //   name: 'Devir',
  //   logo: 'https://dragonesylosetas.com/wp-content/uploads/2021/12/logo-devir-caja-azul-300x118.png',
  //   url: 'https://devir.es/',
  // },
  // {
  //   id: 8,
  //   name: 'Zacatrus',
  //   logo: 'https://static.zacatrus.com/version1764822447/frontend/zaca/z2025/es_ES/images/logo.svg',
  //   url: 'https://zacatrus.es/',
  // },
]

export const TELEGRAM_TOOLTIP = `Para mantenerte informado antes y durante el evento, hemos creado un canal oficial de difusión en Telegram donde compartiremos anuncios importantes, avisos de partidas, horarios de actividades y cambios de agenda en tiempo real.

Solo la organización publica mensajes y las personas suscritas reciben las notificaciones.
- No genera conversaciones ni mensajes innecesarios.
- Las personas suscritas no pueden ver a otras personas usuarias del canal.
- Tu privacidad está garantizada: no se muestra tu número de teléfono ni tus datos personales.

Te recomendamos unirte al canal antes del evento para no perderte ninguna información importante durante el Retiro Lúdico 2026.
`

export const TELEGRAM_INFO = {
  title: 'Canal de difusión en Telegram',
  description: `Para mantenerte informado antes y durante el Retiro Lúdico 2026, hemos creado un canal oficial de difusión en Telegram.

A través de este canal compartiremos:

• Noticias y novedades previas al evento
• Anuncios importantes de última hora
• Avisos de partidas y actividades
• Horarios de comienzo de cada actividad
• Cambios de agenda o información relevante durante el retiro

El objetivo es que tengas toda la información importante en tiempo real y en un solo lugar, de forma cómoda y accesible desde tu móvil.

¿Qué es un canal de difusión de Telegram?

Un canal de difusión en Telegram es una herramienta pensada para enviar información de manera unidireccional:

• Solo la organización publica mensajes
• Los suscriptores reciben las notificaciones, pero no pueden escribir en el canal
• No genera conversaciones ni mensajes innecesarios
• Puedes silenciarlo o abandonar el canal en cualquier momento

Además, tu privacidad está garantizada:

• Los suscriptores no pueden ver a otros usuarios del canal
• No se muestra tu número de teléfono ni tus datos personales
• Solo la organización ve el número total de personas suscritas

Esto garantiza que los avisos sean claros, ordenados y fáciles de consultar cuando los necesites.

Te recomendamos unirte al canal antes del evento para no perderte ninguna información importante durante el Retiro Lúdico 2026.`,
}
