'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ClassicalBackdrop from './ClassicalBackdrop'
import NewsletterSignup from './NewsletterSignup'

const STORAGE_KEY = 'f3d_newsletter_dismissed'
const DELAY_MS = 9000

export default function NewsletterPopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // No mostrar en panel admin ni login.
  const hiddenRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login')

  useEffect(() => {
    if (hiddenRoute) return
    if (localStorage.getItem(STORAGE_KEY)) return
    const t = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [hiddenRoute])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  if (hiddenRoute || !open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Velo suave */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={close} />

      <div className="relative w-full max-w-sm bg-ink border border-gold/20 p-7 overflow-hidden animate-[fadeUp_0.4s_ease-out]">
        <ClassicalBackdrop />
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 text-ash hover:text-pearl text-xl leading-none"
        >
          ×
        </button>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="text-center">
            <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-2">Bienvenida</div>
            <h3 className="font-serif text-3xl font-light text-pearl leading-tight">
              10% en tu<br /><em className="text-gold">primera pieza</em>
            </h3>
            <p className="text-ash font-light text-xs mt-3 leading-relaxed">
              Suscríbete y entérate primero de nuevos lanzamientos y promociones.
            </p>
          </div>
          <NewsletterSignup />
        </div>
      </div>
    </div>
  )
}
