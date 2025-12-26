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
    description: 'Iremos añadiendo menús a medida que se vayan concretando.',
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
