'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MarcarLeidoBtn({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const marcar = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('mensajes').update({ leido: true }).eq('id', id)
    router.refresh()
  }

  return (
    <button onClick={marcar} disabled={loading}
      className="font-mono text-[9px] tracking-[2px] uppercase text-ash border border-stone/20 hover:border-stone/50 hover:text-pearl px-3 py-2 transition-all disabled:opacity-50 flex-shrink-0">
      {loading ? '...' : '✓ Marcar leído'}
    </button>
  )
}
