'use server'

// ── Alta de suscriptores (cupón de bienvenida) ─────────────
// El alta es pública (cualquiera se suscribe), pero pasa por el servidor:
// validamos los datos, generamos el cupón único y guardamos con service role
// (así la tabla 'suscriptores' nunca se expone a la clave anónima).
import { createAdminSupabaseClient } from './supabase-admin'
import { siteConfig, whatsappLink } from './site-config'

// Alfabeto sin caracteres ambiguos (0/O, 1/I...).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function randCode(len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return s
}

// Normaliza un teléfono mexicano a un formato ÚNICO: lada 52 + 10 dígitos.
// Así "6671923604", "16671923604" y "526671923604" cuentan como el MISMO número
// y nadie puede pedir varios cupones cambiando el formato.
function normalizarTelefono(raw: string): string | null {
  let d = (raw ?? '').replace(/\D/g, '')
  if (d.startsWith('52')) d = d.slice(2)   // quita lada de país si viene
  if (d.startsWith('1') && d.length === 11) d = d.slice(1) // quita el "1" intermedio
  if (d.length !== 10) return null         // un móvil mexicano son 10 dígitos
  return `52${d}`
}

type Result = { ok: boolean; error?: string; whatsappUrl?: string; token?: string }

export async function suscribir(input: {
  nombre: string
  telefono: string
  email?: string
  acepta: boolean
  sitio?: string // honeypot anti-spam (debe llegar vacío)
}): Promise<Result> {
  // Trampa anti-bots: si el campo oculto viene lleno, fingimos éxito y no guardamos.
  if (input.sitio) return { ok: true }

  const nombre = (input.nombre ?? '').trim()
  if (nombre.length < 2) return { ok: false, error: 'Ingresa tu nombre.' }
  if (!input.acepta) return { ok: false, error: 'Necesitas aceptar recibir promociones para obtener el cupón.' }

  const telefono = normalizarTelefono(input.telefono)
  if (!telefono) {
    return { ok: false, error: 'Ingresa un número de WhatsApp válido (10 dígitos).' }
  }
  const email = (input.email ?? '').trim() || null

  const supabase = createAdminSupabaseClient()

  // Anti-duplicado: si el teléfono (ya normalizado) existe, reutilizamos su token
  // y cupón. La misma persona NUNCA obtiene un segundo cupón.
  const { data: existing } = await supabase
    .from('suscriptores')
    .select('token')
    .eq('telefono', telefono)
    .maybeSingle()

  let token = existing?.token as string | undefined

  if (!token) {
    token = `F3D-${randCode(4)}`
    const cupon = `BIENVENIDA-${randCode(5)}`
    const { error } = await supabase.from('suscriptores').insert([{
      nombre, telefono, email, canal: 'whatsapp', token, cupon, acepta_promos: true,
    }])
    if (error) {
      // Si dos envíos casi simultáneos chocan con el índice único del teléfono,
      // recuperamos el token ya existente en vez de fallar.
      const { data: again } = await supabase
        .from('suscriptores')
        .select('token')
        .eq('telefono', telefono)
        .maybeSingle()
      if (again?.token) {
        token = again.token as string
      } else {
        return { ok: false, error: 'No se pudo completar el registro. Intenta de nuevo.' }
      }
    }
  }

  // El cliente abre WhatsApp con este mensaje hacia el negocio. Cuando lo envía,
  // confirmas que su número es real y le respondes con su cupón.
  const mensaje = `¡Hola ${siteConfig.name}! 🎁 Quiero activar mi cupón de bienvenida del 10%. Mi código de registro es ${token}.`

  return { ok: true, token, whatsappUrl: whatsappLink(mensaje) }
}
