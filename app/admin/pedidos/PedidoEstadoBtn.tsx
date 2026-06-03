'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const SIGUIENTE: Record<string, string> = {
  nuevo: 'en_proceso', en_proceso: 'listo', listo: 'enviado', enviado: 'entregado', entregado: 'entregado'
}

export default function PedidoEstadoBtn({ id, estadoActual }: { id: string; estadoActual: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  if (estadoActual === 'entregado') return null

  const avanzar = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('pedidos').update({ estado: SIGUIENTE[estadoActual] }).eq('id', id)
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={avanzar} disabled={loading}
      className="font-mono text-[9px] tracking-[2px] uppercase text-gold border border-gold/30 hover:bg-gold/10 px-3 py-1.5 transition-all disabled:opacity-50">
      {loading ? '...' : `→ ${SIGUIENTE[estadoActual]}`}
    </button>
  )
}
