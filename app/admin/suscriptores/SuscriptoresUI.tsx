'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { marcarSuscriptorVerificado, eliminarSuscriptor, marcarCuponUsado } from '@/lib/admin-actions'

// Botón para copiar todos los teléfonos (para crear la Lista de Difusión en WhatsApp).
export function CopiarTelefonos({ telefonos }: { telefonos: string[] }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(telefonos.join('\n'))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sin permisos de portapapeles */
    }
  }

  if (telefonos.length === 0) return null

  return (
    <button
      onClick={copiar}
      className="font-mono text-[9px] tracking-[2px] uppercase border border-gold/40 text-gold px-4 py-2 hover:bg-gold/10 transition-colors"
    >
      {copiado ? '✓ Copiados' : `Copiar ${telefonos.length} teléfonos`}
    </button>
  )
}

// Botón para marcar el cupón de un suscriptor como usado / sin usar.
export function CuponUsadoBtn({ id, usado }: { id: string; usado: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    await marcarCuponUsado(id, !usado)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`font-mono text-[8px] tracking-wide uppercase border px-2.5 py-1 transition-colors disabled:opacity-50
        ${usado ? 'border-stone/30 text-stone hover:bg-stone/10' : 'border-gold/30 text-gold hover:bg-gold/10'}`}
    >
      {usado ? '✓ Cupón usado' : 'Marcar cupón usado'}
    </button>
  )
}

// Acciones por suscriptor: marcar verificado / eliminar.
export function SuscriptorAcciones({ id, verificado }: { id: string; verificado: boolean }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    await marcarSuscriptorVerificado(id, !verificado)
    router.refresh()
    setLoading(false)
  }

  const borrar = async () => {
    setLoading(true)
    await eliminarSuscriptor(id)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`font-mono text-[8px] tracking-wide uppercase border px-2.5 py-1 transition-colors disabled:opacity-50
          ${verificado ? 'border-green-400/30 text-green-400 hover:bg-green-400/10' : 'border-gold/30 text-gold hover:bg-gold/10'}`}
      >
        {verificado ? '✓ Verificado' : 'Marcar verificado'}
      </button>
      {confirm ? (
        <span className="flex items-center gap-1">
          <button onClick={borrar} disabled={loading} className="font-mono text-[8px] uppercase text-red-400 hover:underline">Sí, borrar</button>
          <button onClick={() => setConfirm(false)} className="font-mono text-[8px] uppercase text-ash hover:text-pearl">No</button>
        </span>
      ) : (
        <button onClick={() => setConfirm(true)} className="font-mono text-[8px] uppercase text-ash/60 hover:text-red-400 transition-colors">Eliminar</button>
      )}
    </div>
  )
}
