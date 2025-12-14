/**
 * Constantes del proyecto
 * Valores literales y programáticos reutilizables en toda la aplicación
 */

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
    label: 'Albergue compartido (130€)',
  },
  {
    value: 'chozos',
    label: 'Chozo compartido (2 personas) (150€)',
  },
  {
    value: 'chozo-individual',
    label: 'Chozo individual (300€)',
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
    text: 'Actividades disponibles.',
    icon: '🎯',
    description: 'Actividades disponibles.',
  },
  {
    id: 2,
    title: 'Alojamiento',
    text: 'Opciones de alojamiento.',
    icon: '🏕️',
    description: 'Opciones de alojamiento.',
  },
  {
    id: 3,
    title: 'Comida',
    text: 'Menú de comidas.',
    icon: '🍖',
    description: 'Menú de comidas.',
  },
  {
    id: 4,
    title: 'Juegos',
    text: 'Catálogo de juegos de mesa.',
    icon: '🎲',
    description: 'Catálogo de juegos de mesa.',
  },
]
