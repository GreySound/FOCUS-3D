'use server'

import { createAdminSupabaseClient } from './supabase-admin'
import { isAdminAuthenticated } from './auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  if (!(await isAdminAuthenticated())) {
    return { error: 'No autorizado' }
  }

  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return { error: 'No se recibió archivo' }
  }
  if (file.size > MAX_SIZE) {
    return { error: 'La imagen supera el tamaño máximo (5 MB)' }
  }

  // Solo formatos de imagen permitidos
  const ext = MIME_TO_EXT[file.type]
  if (!ext) {
    return { error: 'Formato no permitido. Usa JPG, PNG o WEBP.' }
  }

  // Nombre 100% seguro — solo números y extensión conocida
  const path = `p${Date.now()}.${ext}`

  const supabase = createAdminSupabaseClient()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('productos')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error('Supabase error:', error)
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('productos')
    .getPublicUrl(data.path)

  return { url: publicUrl }
}
