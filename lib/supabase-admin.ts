// ── Cliente con SERVICE ROLE (solo servidor) ───────────────
// Ignora las políticas RLS. Se usa para que el panel admin lea/escriba
// datos sensibles (pedidos, mensajes) y suba imágenes, SIN tener que
// abrir esas tablas a la clave anónima pública.
//
// ⚠️ NUNCA importar este archivo desde un componente 'use client'.
//    Solo en server components, server actions y route handlers.
import { createClient } from '@supabase/supabase-js'

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el cliente admin'
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
