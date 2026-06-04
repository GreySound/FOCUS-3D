// ── Sesión del panel admin ─────────────────────────────────
// Token de sesión firmado (HMAC-SHA256) y con expiración.
// A diferencia de un hash estático del password, este token:
//   - caduca (no sirve para siempre si se filtra)
//   - incluye un nonce aleatorio (no es determinista)
//   - se valida en tiempo constante (evita timing attacks)
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'admin_auth'

const SESSION_DAYS = 7
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 // en segundos

// Secreto para firmar. Idealmente definir SESSION_SECRET; si no existe,
// se deriva del ADMIN_PASSWORD para mantener compatibilidad.
function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

// Formato del token: <expiraEnMs>.<nonce>.<firmaHMAC>
export function createSessionToken(): string {
  if (!getSecret()) {
    throw new Error('Falta SESSION_SECRET o ADMIN_PASSWORD para firmar la sesión')
  }
  const expira = Date.now() + SESSION_MAX_AGE * 1000
  const nonce = randomBytes(16).toString('hex')
  const payload = `${expira}.${nonce}`
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !getSecret()) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [expiraStr, nonce, firma] = parts
  const esperada = sign(`${expiraStr}.${nonce}`)

  const a = Buffer.from(firma)
  const b = Buffer.from(esperada)
  if (a.length !== b.length) return false
  if (!timingSafeEqual(a, b)) return false

  const expira = Number(expiraStr)
  if (!Number.isFinite(expira) || expira < Date.now()) return false

  return true
}

// Helper para usar en server components y server actions.
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)
}
