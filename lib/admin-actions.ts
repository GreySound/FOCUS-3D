'use server'

// ── Server Actions del panel admin ─────────────────────────
// Todas las mutaciones del admin pasan por aquí: se verifica la sesión
// de admin en el servidor y se usan los privilegios de service role,
// en lugar de exponer escrituras con la clave anónima en el navegador.
import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from './supabase-admin'
import { isAdminAuthenticated } from './auth'

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

  const payload = {
    nombre,
    descripcion: (input.descripcion ?? '').trim() || null,
    linea: input.linea,
    precio_min,
    precio_max,
    stock,
    estado: input.estado,
    imagenes,
  }

  const supabase = createAdminSupabaseClient()
  const { error } = id
    ? await supabase.from('productos').update(payload).eq('id', id)
    : await supabase.from('productos').insert([payload])

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/productos')
  revalidatePath('/catalogo')
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
