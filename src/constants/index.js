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
    label: 'Chozo compartido (2 personas) (150€ por persona)',
    images: chozosImages,
    description: 'Alojamiento en chozo compartido con otra persona.',
  },
  {
    value: 'chozo-individual',
    label: 'Chozo individual (300€)',
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
        dishes: ['Gazpacho', 'Hamburgesa completa con patatas', 'Pan, Yogurt, Fruta y Agua'],
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
    name: '2 Tomatoes Games',
    logo: 'https://2tomatoesgames.com/img/cms/2-tomatoes-games-logo-15423026522-jpg.png',
    url: 'https://2tomatoesgames.com/es/',
  },
  {
    id: 3,
    name: 'HT Publishers',
    logo: 'https://cf.geekdo-images.com/46whN5qtqVnsHYztNP_CMg__imagepage/img/8AB-d_ajbAeegoNaefDJOIBpkRw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6367713.png',
    url: 'https://htpublishers.es/',
  },
  {
    id: 4,
    name: 'suseya ediciones',
    logo: 'https://suseyaediciones.com/wp-content/uploads/2014/01/suseya-mas-oscuro-arreglado.jpg',
    url: 'https://suseyaediciones.com/',
  },
  {
    id: 5,
    name: 'Tranjis Games',
    logo: 'https://donmeeple.com/wp-content/uploads/2019/11/tranjis-games-editorial-juegos-mesa.jpg',
    url: 'https://tranjisgames.com/',
  },
  {
    id: 6,
    name: 'Haba',
    logo: 'https://cf.geekdo-images.com/B4J83FsN8OXJd3vfj0UxjA__imagepagezoom/img/rLKzBWI0PsrYA6C6wHBdTklh5pI=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8366956.jpg',
    url: '',
  },
  {
    id: 7,
    name: 'Devir',
    logo: 'https://dragonesylosetas.com/wp-content/uploads/2021/12/logo-devir-caja-azul-300x118.png',
    url: 'https://devir.es/',
  },
  {
    id: 8,
    name: 'Zacatrus',
    logo: 'https://static.zacatrus.com/version1764822447/frontend/zaca/z2025/es_ES/images/logo.svg',
    url: 'https://zacatrus.es/',
  },
]

export const TELEGRAM_TOOLTIP = `Para mantenerte informado antes y durante el evento, hemos creado un canal oficial de difusión en Telegram
donde compartiremos anuncios importantes, avisos de partidas, horarios de actividades y cambios de agenda en tiempo real.

Solo la organización publica mensajes y las personas suscritas reciben las notificaciones.
- No genera conversaciones ni mensajes innecesarios.
- Las personas suscritas no pueden ver a otras personas usuarias del canal.

Te recomendamos unirte al canal antes del evento para no perderte ninguna información importante durante el Retiro Lúdico 2026.
`
