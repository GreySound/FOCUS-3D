'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DeleteProductBtn({ id, nombre }: { id: string; nombre: string }) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('productos').delete().eq('id', id)
    router.refresh()
  }

  if (confirming) return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[9px] text-red-400 mr-1">¿Eliminar?</span>
      <button onClick={handleDelete} className="font-mono text-[9px] tracking-wide uppercase text-red-400 border border-red-400/40 hover:bg-red-400/10 px-2.5 py-2 transition-all">Sí</button>
      <button onClick={() => setConfirming(false)} className="font-mono text-[9px] tracking-wide uppercase text-ash border border-stone/20 hover:border-stone/40 px-2.5 py-2 transition-all">No</button>
    </div>
  )

  return (
    <button onClick={() => setConfirming(true)}
      className="font-mono text-[9px] tracking-[2px] uppercase text-red-400/60 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-3 py-2 transition-all">
      Eliminar
    </button>
  )
}
