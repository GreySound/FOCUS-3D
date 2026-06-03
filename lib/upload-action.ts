'use server'

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'focus3d_salt').digest('hex')
}

export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')
  const expected = hashPassword(process.env.ADMIN_PASSWORD ?? '')

  if (!auth || auth.value !== expected) {
    return { error: 'No autorizado' }
  }

  const file = formData.get('file') as File
  if (!file || file.size === 0) {
    return { error: 'No se recibió archivo' }
  }

  // Nombre 100% seguro — solo números y extensión conocida
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = mimeToExt[file.type] ?? 'jpg'
  const path = `p${Date.now()}.${ext}`

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('productos')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
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

