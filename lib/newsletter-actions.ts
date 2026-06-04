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

  const telefono = (input.telefono ?? '').replace(/\D/g, '')
  if (telefono.length < 10 || telefono.length > 13) {
    return { ok: false, error: 'Ingresa un número de WhatsApp válido (10 dígitos).' }
  }
  const email = (input.email ?? '').trim() || null

  const supabase = createAdminSupabaseClient()

  // Si el teléfono ya estaba registrado, reutilizamos su token (no duplicamos).
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
    if (error) return { ok: false, error: 'No se pudo completar el registro. Intenta de nuevo.' }
  }

  // El cliente abre WhatsApp con este mensaje hacia el negocio. Cuando lo envía,
  // confirmas que su número es real y le respondes con su cupón.
  const mensaje = `¡Hola ${siteConfig.name}! 🎁 Quiero activar mi cupón de bienvenida del 10%. Mi código de registro es ${token}.`

  return { ok: true, token, whatsappUrl: whatsappLink(mensaje) }
}
