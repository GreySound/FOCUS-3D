import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, ADMIN_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth'

// Intentos fallidos en memoria (se resetea al reiniciar el servidor)
// Para producción real usar Redis o Supabase, pero esto es suficiente para una tienda pequeña
const failedAttempts: Record<string, { count: number; blockedUntil: number }> = {}

const MAX_ATTEMPTS = 5
const BLOCK_MINUTES = 15

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ?? 
         req.headers.get('x-real-ip') ?? 
         'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const now = Date.now()

  // Verificar si está bloqueado
  const attempt = failedAttempts[ip]
  if (attempt && attempt.blockedUntil > now) {
    const minutesLeft = Math.ceil((attempt.blockedUntil - now) / 60000)
    return NextResponse.json(
      { error: `Demasiados intentos. Intenta en ${minutesLeft} minutos.` },
      { status: 429 }
    )
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    // Registrar intento fallido
    const current = failedAttempts[ip] ?? { count: 0, blockedUntil: 0 }
    current.count += 1

    if (current.count >= MAX_ATTEMPTS) {
      current.blockedUntil = now + BLOCK_MINUTES * 60 * 1000
      current.count = 0
      failedAttempts[ip] = current
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Bloqueado por ${BLOCK_MINUTES} minutos.` },
        { status: 429 }
      )
    }

    failedAttempts[ip] = current
    const remaining = MAX_ATTEMPTS - current.count
    return NextResponse.json(
      { error: `Contraseña incorrecta. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.` },
      { status: 401 }
    )
  }

  // Contraseña correcta — limpiar intentos
  delete failedAttempts[ip]

  // Token de sesión firmado y con expiración (no un hash estático del password)
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  return res
}

export async function DELETE() {
  // Cerrar sesión
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
  return res
}
