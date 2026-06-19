// ── Tipos compartidos ──────────────────────────────────────
export type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  linea: 'Essentials' | 'Statement' | 'Signature' | 'Custom' | 'B2B'
  precio_min: number
  precio_max: number
  stock: number
  estado: 'disponible' | 'agotado' | 'bajo_pedido'
  imagenes: string[]
  en_promocion: boolean
  precio_promo: number | null
  promo_etiqueta: string | null
  created_at: string
  updated_at: string
}

export type Pedido = {
  id: string
  nombre_cliente: string
  email: string
  telefono: string | null
  canal: 'instagram' | 'mercadolibre' | 'whatsapp' | 'web'
  estado: 'nuevo' | 'en_proceso' | 'listo' | 'enviado' | 'entregado'
  total: number | null
  notas: string | null
  created_at: string
  pedido_items?: PedidoItem[]
}

export type PedidoItem = {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  acabado: string | null
  productos?: Producto
}

export type Mensaje = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  interes: string | null
  mensaje: string | null
  producto_ref: string | null
  leido: boolean
  created_at: string
}

export type Suscriptor = {
  id: string
  nombre: string
  telefono: string
  email: string | null
  canal: string
  token: string
  cupon: string
  estado: 'pendiente' | 'verificado'
  acepta_promos: boolean
  cupon_enviado_at: string | null
  cupon_usado: boolean
  cupon_usado_at: string | null
  created_at: string
}

// ── Cliente para el NAVEGADOR (componentes 'use client') ───
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
