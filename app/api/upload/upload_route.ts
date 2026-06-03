export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + 'focus3d_salt').digest('hex')
}

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const adminCookie = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('admin_auth='))
    ?.split('=')[1]

  const expected = hashPassword(process.env.ADMIN_PASSWORD ?? '')

  if (!adminCookie || adminCookie !== expected) {
    return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No se recibió archivo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '_')
    const path = `${Date.now()}_${cleanName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('productos')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('productos')
      .getPublicUrl(data.path)

    return new NextResponse(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
