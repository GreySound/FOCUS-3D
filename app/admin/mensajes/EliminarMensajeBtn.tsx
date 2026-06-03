'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EliminarMensajeBtn({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('mensajes').delete().eq('id', id)
    router.refresh()
  }

  if (confirming) return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[9px] text-red-400 mr-1">¿Eliminar?</span>
      <button onClick={handleDelete} disabled={loading}
        className="font-mono text-[9px] uppercase text-red-400 border border-red-400/40 hover:bg-red-400/10 px-2.5 py-2 transition-all disabled:opacity-50">
        {loading ? '...' : 'Sí'}
      </button>
      <button onClick={() => setConfirming(false)}
        className="font-mono text-[9px] uppercase text-ash border border-stone/20 hover:border-stone/40 px-2.5 py-2 transition-all">
        No
      </button>
    </div>
  )

  return (
    <button onClick={() => setConfirming(true)}
      className="font-mono text-[9px] tracking-[2px] uppercase text-red-400/50 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-3 py-2 transition-all">
      Eliminar
    </button>
  )
}
