'use server'

// ── Alta de suscriptores (cupón de bienvenida) ─────────────
// El alta es pública (cualquiera se suscribe), pero pasa por el servidor:
// validamos los datos, generamos el cupón único y guardamos con service role
// (así la tabla 'suscriptores' nunca se expone a la clave anónima).
//
// Canales soportados (el suscriptor elige):
//   - Email (Resend)  → manda HTML con botón "Ver mi cupón"
//   - SMS   (Twilio)  → manda texto corto con link a la página del cupón
//   - Ambos: si llena los dos campos, recibe ambos canales
//
// Siempre devolvemos también un link público /cupon/[token] como fallback,
// para que pueda copiar/compartir su cupón aunque algún envío falle.
import { createAdminSupabaseClient } from './supabase-admin'
import { isEmailConfigured, sendCuponBienvenidaEmail } from './email'
import { isSmsConfigured, sendCuponBienvenidaSms } from './sms'

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

// Validación liviana de email (no pretende ser RFC-completo: filtra typos obvios).
function emailValido(raw: string): boolean {
  const s = raw.trim()
  if (s.length < 5 || s.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
}

type Result = {
  ok: boolean
  error?: string
  // El cupón en sí (cupon) y su token NO se devuelven al cliente:
  // viven únicamente en el correo / SMS que se envía. Esto evita exponer
  // el código en pantallas públicas y mantiene los mensajes como la única
  // "fuente de verdad" del cupón.
  enviadoPorEmail?: boolean        // el email salió correctamente
  enviadoPorSms?: boolean          // el SMS salió correctamente
}

export async function suscribir(input: {
  nombre: string
  telefono?: string
  email?: string
  acepta: boolean
  sitio?: string // honeypot anti-spam (debe llegar vacío)
}): Promise<Result> {
  // Trampa anti-bots: si el campo oculto viene lleno, fingimos éxito y no guardamos.
  if (input.sitio) return { ok: true }

  const nombre = (input.nombre ?? '').trim()
  if (nombre.length < 2) return { ok: false, error: 'Ingresa tu nombre.' }
  if (!input.acepta) {
    return { ok: false, error: 'Necesitas aceptar recibir promociones para obtener el cupón.' }
  }

  // Email y teléfono ahora son opcionales por separado, pero requerimos AL MENOS UNO.
  const emailRaw = (input.email ?? '').trim()
  const email = emailRaw ? emailRaw.toLowerCase() : null
  if (email && !emailValido(email)) {
    return { ok: false, error: 'El correo no parece válido. Revísalo o déjalo en blanco.' }
  }

  const telefonoRaw = (input.telefono ?? '').trim()
  const telefono = telefonoRaw ? normalizarTelefono(telefonoRaw) : null
  if (telefonoRaw && !telefono) {
    return { ok: false, error: 'Ingresa un número de WhatsApp/celular válido (10 dígitos).' }
  }

  if (!email && !telefono) {
    return {
      ok: false,
      error: 'Déjanos al menos un correo o un número de celular para enviarte tu cupón.',
    }
  }

  const supabase = createAdminSupabaseClient()

  // Anti-duplicado: si el teléfono O el email (ya normalizados) existen, reutilizamos
  // su token y cupón. La misma persona NUNCA obtiene un segundo cupón.
  let existing: { token: string; cupon: string } | null = null

  if (telefono) {
    const { data, error } = await supabase
      .from('suscriptores')
      .select('token, cupon')
      .eq('telefono', telefono)
      .maybeSingle()
    if (error) {
      console.error('[suscribir] select por telefono falló:', error)
      return { ok: false, error: `Error buscando por teléfono: ${error.message}` }
    }
    if (data) existing = data as { token: string; cupon: string }
  }
  if (!existing && email) {
    const { data, error } = await supabase
      .from('suscriptores')
      .select('token, cupon')
      .eq('email', email)
      .maybeSingle()
    if (error) {
      console.error('[suscribir] select por email falló:', error)
      return { ok: false, error: `Error buscando por correo: ${error.message}` }
    }
    if (data) existing = data as { token: string; cupon: string }
  }

  let token = existing?.token
  let cupon = existing?.cupon

  if (!token) {
    token = `F3D-${randCode(4)}`
    cupon = `BIENVENIDA-${randCode(5)}`
    // Canal preferido: si solo dio uno, ese; si dio ambos, "ambos".
    const canal = email && telefono ? 'ambos' : email ? 'email' : 'sms'

    const { error } = await supabase.from('suscriptores').insert([{
      nombre, telefono, email, canal, token, cupon, acepta_promos: true,
    }])
    if (error) {
      console.error('[suscribir] INSERT falló:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        payload: { nombre, telefono, email, canal, token, cupon },
      })
      // Conflicto raro de carrera con el índice único: recuperamos lo que ya existe.
      const recovery = await recuperarExistente(supabase, { telefono, email })
      if (recovery) {
        token = recovery.token
        cupon = recovery.cupon
      } else {
        // Exponemos el detalle del error para diagnosticar (ej. constraint, RLS, etc.).
        return {
          ok: false,
          error: `No se pudo registrar (${error.code || 'err'}): ${error.message}`,
        }
      }
    }
  }

  const cuponEnviar = cupon!
  const tokenSub = token!

  // ── Envíos ────────────────────────────────────────────────
  // Mandamos por TODOS los canales que el suscriptor nos dio Y que estén
  // configurados en el servidor. El cupón vive únicamente en estos mensajes:
  // si todos fallan, el caller debe avisar al cliente que reintente.
  let enviadoPorEmail = false
  let enviadoPorSms = false

  if (email && isEmailConfigured()) {
    const r = await sendCuponBienvenidaEmail({ to: email, nombre, cupon: cuponEnviar })
    if (r.ok) {
      enviadoPorEmail = true
      try {
        await supabase
          .from('suscriptores')
          .update({
            cupon_enviado_email_at: new Date().toISOString(),
            cupon_enviado_at: new Date().toISOString(),
          })
          .eq('token', tokenSub)
      } catch { /* columnas opcionales */ }
    }
  }

  if (telefono && isSmsConfigured()) {
    const r = await sendCuponBienvenidaSms({ to: telefono, nombre, cupon: cuponEnviar })
    if (r.ok) {
      enviadoPorSms = true
      try {
        await supabase
          .from('suscriptores')
          .update({
            cupon_enviado_sms_at: new Date().toISOString(),
            cupon_enviado_at: new Date().toISOString(),
          })
          .eq('token', tokenSub)
      } catch { /* columnas opcionales */ }
    }
  }

  return {
    ok: true,
    enviadoPorEmail,
    enviadoPorSms,
  }
}

// Helper: tras colisión de índice único, devuelve el suscriptor existente.
async function recuperarExistente(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  args: { telefono: string | null; email: string | null }
): Promise<{ token: string; cupon: string } | null> {
  if (args.telefono) {
    const { data } = await supabase
      .from('suscriptores')
      .select('token, cupon')
      .eq('telefono', args.telefono)
      .maybeSingle()
    if (data) return data as { token: string; cupon: string }
  }
  if (args.email) {
    const { data } = await supabase
      .from('suscriptores')
      .select('token, cupon')
      .eq('email', args.email)
      .maybeSingle()
    if (data) return data as { token: string; cupon: string }
  }
  return null
}
