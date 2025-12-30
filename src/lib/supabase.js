/**
 * Cliente de Supabase
 * Configuración y cliente para interactuar con la base de datos
 */

import { createClient } from '@supabase/supabase-js'

// Obtener las variables de entorno y limpiar espacios y comillas
const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY

// Limpiar espacios y comillas simples/dobles que puedan estar al inicio o final
// Usamos múltiples pasos para asegurar que se limpien correctamente
const cleanValue = (value) => {
  if (!value) return ''
  return value
    .trim()
    .replace(/^['"]+/, '')
    .replace(/['"]+$/, '')
    .trim()
}

const supabaseUrl = cleanValue(supabaseUrlRaw)
const supabaseAnonKey = cleanValue(supabaseAnonKeyRaw)

// Debug: Log de variables (también en producción para debugging)
console.log('🔍 Variables de entorno Supabase:', {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NO DEFINIDA',
  supabaseAnonKey: supabaseAnonKey ? 'DEFINIDA' : 'NO DEFINIDA',
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0,
  urlRaw: supabaseUrlRaw ? `${supabaseUrlRaw.substring(0, 30)}...` : 'NO DEFINIDA',
  hasUrl: !!supabaseUrlRaw,
  hasKey: !!supabaseAnonKeyRaw,
  allViteVars: Object.keys(import.meta.env).filter((key) => key.startsWith('VITE_')),
})

// Validar que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  const isProduction = import.meta.env.PROD
  const errorMessage = isProduction
    ? 'Error de configuración: Las variables de entorno de Supabase no están configuradas en Vercel. Ve a Settings → Environment Variables y añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    : 'Faltan las variables de entorno de Supabase. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'

  console.error('❌ Error de configuración de Supabase:', {
    supabaseUrl: supabaseUrl || 'NO DEFINIDA',
    supabaseAnonKey: supabaseAnonKey ? 'DEFINIDA' : 'NO DEFINIDA',
    environment: isProduction ? 'PRODUCCIÓN' : 'DESARROLLO',
    allEnvVars: Object.keys(import.meta.env).filter((key) => key.startsWith('VITE_')),
  })

  throw new Error(errorMessage)
}

// Validar formato de URL (después de limpiar comillas)
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ URL de Supabase inválida:', {
    url: supabaseUrl,
    urlRaw: supabaseUrlRaw,
    urlLength: supabaseUrl.length,
    firstChars: supabaseUrl.substring(0, 20),
    cleaned: supabaseUrl,
  })
  throw new Error(
    `URL de Supabase inválida: "${supabaseUrl}". Debe comenzar con http:// o https://. Valor original: "${supabaseUrlRaw}"`,
  )
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
