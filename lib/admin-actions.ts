'use server'

// ── Server Actions del panel admin ─────────────────────────
// Todas las mutaciones del admin pasan por aquí: se verifica la sesión
// de admin en el servidor y se usan los privilegios de service role,
// en lugar de exponer escrituras con la clave anónima en el navegador.
import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from './supabase-admin'
import { isAdminAuthenticated } from './auth'
import { isWhatsappConfigured, sendTemplateMessage } from './whatsapp'

const LINEAS = ['Essentials', 'Statement', 'Signature', 'Custom', 'B2B']
const ESTADOS_PRODUCTO = ['disponible', 'agotado', 'bajo_pedido']
const ESTADOS_PEDIDO = ['nuevo', 'en_proceso', 'listo', 'enviado', 'entregado']

type Result = { ok: boolean; error?: string }

async function ensureAdmin(): Promise<Result | null> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: 'No autorizado' }
  return null
}

// ── Productos ──────────────────────────────────────────────
export async function saveProducto(
  input: {
    nombre: string
    descripcion: string
    linea: string
    precio_min: number
    precio_max: number
    stock: number
    estado: string
    imagenes: string[]
    en_promocion?: boolean
    precio_promo?: number | null
    promo_etiqueta?: string
  },
  id?: string
): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied

  // Validación en el servidor — no se confía en lo que envía el cliente.
  const nombre = (input.nombre ?? '').trim()
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio' }
  if (!LINEAS.includes(input.linea)) return { ok: false, error: 'Línea inválida' }
  if (!ESTADOS_PRODUCTO.includes(input.estado)) return { ok: false, error: 'Estado inválido' }

  const precio_min = Number(input.precio_min)
  const precio_max = Number(input.precio_max)
  const stock = Number(input.stock)
  if (!Number.isFinite(precio_min) || precio_min < 0) return { ok: false, error: 'Precio mínimo inválido' }
  if (!Number.isFinite(precio_max) || precio_max < 0) return { ok: false, error: 'Precio máximo inválido' }
  if (precio_max < precio_min) return { ok: false, error: 'El precio máximo no puede ser menor al mínimo' }
  if (!Number.isFinite(stock) || stock < 0) return { ok: false, error: 'Stock inválido' }

  const imagenes = Array.isArray(input.imagenes)
    ? input.imagenes.filter(u => typeof u === 'string')
    : []

  // ── Promoción ──
  const en_promocion = !!input.en_promocion
  let precio_promo: number | null = null
  if (input.precio_promo != null && `${input.precio_promo}` !== '') {
    precio_promo = Number(input.precio_promo)
    if (!Number.isFinite(precio_promo) || precio_promo < 0) return { ok: false, error: 'Precio de promoción inválido' }
    if (precio_promo >= precio_min) return { ok: false, error: 'El precio de promoción debe ser menor al precio mínimo' }
  }
  const promo_etiqueta = (input.promo_etiqueta ?? '').trim().slice(0, 40) || null

  const payload = {
    nombre,
    descripcion: (input.descripcion ?? '').trim() || null,
    linea: input.linea,
    precio_min,
    precio_max,
    stock,
    estado: input.estado,
    imagenes,
    en_promocion,
    precio_promo: en_promocion ? precio_promo : null,
    promo_etiqueta: en_promocion ? promo_etiqueta : null,
  }

  const supabase = createAdminSupabaseClient()
  const { error } = id
    ? await supabase.from('productos').update(payload).eq('id', id)
    : await supabase.from('productos').insert([payload])

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteProducto(id: string): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
  return { ok: true }
}

// ── Difusión de promoción por WhatsApp ─────────────────────
// Envía una plantilla aprobada a los suscriptores que aceptan promociones.
// Es una acción DELIBERADA (botón en el admin), no automática: cada mensaje
// de marketing tiene costo y WhatsApp exige plantilla pre-aprobada + opt-in.
type NotificarResult = Result & {
  resumen?: { enviados: number; fallidos: number; total: number; errores: string[] }
}

export async function notificarPromocionSuscriptores(
  productId: string
): Promise<NotificarResult> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!productId) return { ok: false, error: 'ID requerido' }

  if (!isWhatsappConfigured()) {
    return {
      ok: false,
      error:
        'La API de WhatsApp aún no está configurada. Define WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en el servidor.',
    }
  }

  const supabase = createAdminSupabaseClient()

  const { data: producto, error: pErr } = await supabase
    .from('productos')
    .select('*')
    .eq('id', productId)
    .maybeSingle()
  if (pErr || !producto) return { ok: false, error: 'Producto no encontrado' }
  if (!producto.en_promocion) {
    return { ok: false, error: 'Este producto no está marcado como promoción.' }
  }
  // La plantilla incluye imagen de encabezado: el producto necesita al menos una foto.
  const headerImageUrl: string | undefined = producto.imagenes?.[0]
  if (!headerImageUrl) {
    return {
      ok: false,
      error: 'El producto no tiene imagen. Agrega al menos una foto para enviar la promo (la plantilla incluye imagen).',
    }
  }

  // Solo suscriptores con consentimiento de promociones (LFPDPPP / opt-in).
  const { data: subs, error: sErr } = await supabase
    .from('suscriptores')
    .select('telefono, acepta_promos')
    .eq('acepta_promos', true)
  if (sErr) return { ok: false, error: sErr.message }

  const destinatarios = (subs ?? []).filter((s) => s.acepta_promos && s.telefono)
  if (destinatarios.length === 0) {
    return { ok: false, error: 'No hay suscriptores que acepten promociones.' }
  }

  // Variables de la plantilla:
  //   header  → imagen del producto (headerImageUrl)
  //   {{1}}   → nombre del producto
  //   {{2}}   → oferta (etiqueta + precio promo)
  //   botón   → id del producto, que se anexa a la URL base de la plantilla
  //             (https://focus3d.art/producto/{{1}})
  const etiqueta = producto.promo_etiqueta || 'Promoción'
  const precio =
    producto.precio_promo != null
      ? `$${producto.precio_promo.toLocaleString('es-MX')}`
      : `desde $${producto.precio_min.toLocaleString('es-MX')}`

  let enviados = 0
  let fallidos = 0
  const errores: string[] = []

  // Envío secuencial: respeta los límites de velocidad de la Cloud API.
  for (const s of destinatarios) {
    const r = await sendTemplateMessage({
      to: s.telefono,
      headerImageUrl,
      bodyParams: [producto.nombre, `${etiqueta} · ${precio}`],
      buttonUrlParam: producto.id,
    })
    if (r.ok) {
      enviados++
    } else {
      fallidos++
      if (r.error && errores.length < 3) errores.push(r.error)
    }
  }

  // Registra cuándo se notificó (best-effort: si la columna no existe, se ignora).
  try {
    await supabase
      .from('productos')
      .update({ promo_notificada_at: new Date().toISOString() })
      .eq('id', productId)
  } catch {
    /* columna opcional; no es crítico */
  }

  return {
    ok: enviados > 0,
    error:
      enviados === 0
        ? `No se pudo enviar a ningún suscriptor. ${errores[0] ?? ''}`.trim()
        : undefined,
    resumen: { enviados, fallidos, total: destinatarios.length, errores },
  }
}

// ── Pedidos ────────────────────────────────────────────────
export async function updatePedidoEstado(id: string, estado: string): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }
  if (!ESTADOS_PEDIDO.includes(estado)) return { ok: false, error: 'Estado inválido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/pedidos')
  revalidatePath('/admin')
  return { ok: true }
}

// ── Mensajes ───────────────────────────────────────────────
export async function marcarMensajeLeido(id: string, leido = true): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('mensajes').update({ leido }).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/mensajes')
  revalidatePath('/admin')
  return { ok: true }
}

export async function eliminarMensaje(id: string): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('mensajes').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/mensajes')
  revalidatePath('/admin')
  return { ok: true }
}


// ── Suscriptores ───────────────────────────────────────────
export async function marcarSuscriptorVerificado(id: string, verificado = true): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase
    .from('suscriptores')
    .update({ estado: verificado ? 'verificado' : 'pendiente' })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/suscriptores')
  return { ok: true }
}

export async function eliminarSuscriptor(id: string): Promise<Result> {
  const denied = await ensureAdmin()
  if (denied) return denied
  if (!id) return { ok: false, error: 'ID requerido' }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('suscriptores').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/suscriptores')
  return { ok: true }
}
