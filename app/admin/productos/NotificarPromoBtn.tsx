'use client'
import { useState } from 'react'
import { notificarPromocionSuscriptores } from '@/lib/admin-actions'

// Botón para avisar a los suscriptores (que aceptan promos) por email + SMS.
// Pide confirmación antes de enviar porque el envío masivo tiene costo.
export default function NotificarPromoBtn({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'confirm' | 'sending' | 'done'>('idle')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState(false)

  const enviar = async () => {
    setState('sending')
    const r = await notificarPromocionSuscriptores(id)
    setOk(!!r.ok)
    if (r.ok && r.resumen) {
      const { enviadosEmail, enviadosSms, fallidosEmail, fallidosSms, total } = r.resumen
      const partes: string[] = []
      if (enviadosEmail) partes.push(`✉ ${enviadosEmail}`)
      if (enviadosSms) partes.push(`📲 ${enviadosSms}`)
      const fall = fallidosEmail + fallidosSms
      setMsg(`${partes.join(' · ')} de ${total}${fall ? ` · ${fall} fallaron` : ''}`)
    } else {
      setMsg(r.error || 'No se pudo enviar')
    }
    setState('done')
  }

  if (state === 'done') {
    return (
      <span
        className={`font-mono text-[9px] tracking-wide ${ok ? 'text-green-400' : 'text-red-400'} max-w-[200px] leading-tight`}
        title={msg}
      >
        {ok ? '✓ ' : '✕ '}
        {msg}
      </span>
    )
  }

  if (state === 'sending') {
    return (
      <span className="font-mono text-[9px] tracking-[2px] uppercase text-gold animate-pulse px-3 py-2">
        Enviando…
      </span>
    )
  }

  if (state === 'confirm') {
    return (
      <div className="flex items-center gap-1">
        <span className="font-mono text-[9px] text-gold mr-1">¿Avisar a suscriptores?</span>
        <button
          onClick={enviar}
          className="font-mono text-[9px] tracking-wide uppercase text-green-400 border border-green-400/40 hover:bg-green-400/10 px-2.5 py-2 transition-all"
        >
          Sí
        </button>
        <button
          onClick={() => setState('idle')}
          className="font-mono text-[9px] tracking-wide uppercase text-ash border border-stone/20 hover:border-stone/40 px-2.5 py-2 transition-all"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirm')}
      title="Avisar la promoción a tus suscriptores por correo y SMS"
      className="font-mono text-[9px] tracking-[2px] uppercase text-gold/70 hover:text-gold border border-gold/20 hover:border-gold/50 px-3 py-2 transition-all"
    >
      ↗ Avisar promo
    </button>
  )
}
