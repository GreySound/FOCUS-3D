'use client'
import { useState } from 'react'
import Link from 'next/link'
import { suscribir } from '@/lib/newsletter-actions'

export default function NewsletterSignup({ onDone }: { onDone?: () => void }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', acepta: false, sitio: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ token?: string; whatsappUrl?: string }>({})
  const [abierto, setAbierto] = useState(false)

  const handleTel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, telefono: e.target.value.replace(/[^\d\s+()-]/g, '') }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const res = await suscribir(form)
    if (!res.ok) {
      setError(res.error ?? 'Algo salió mal.')
      setStatus('error')
      return
    }
    setResult({ token: res.token, whatsappUrl: res.whatsappUrl })
    setStatus('ok')
    onDone?.()
  }

  if (status === 'ok') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="w-14 h-14 border border-gold rounded-full flex items-center justify-center text-gold text-2xl mx-auto">🎁</div>
        <h3 className="font-serif text-2xl text-pearl">¡Casi listo!</h3>
        <p className="text-stone font-light text-sm leading-relaxed">
          Toca el botón para enviarnos un WhatsApp y <strong className="text-pearl">recibir tu cupón del 10%</strong>.
          Tu código de registro es:
        </p>
        <div className="font-mono text-gold text-lg tracking-[3px] border border-gold/30 py-2">{result.token}</div>
        {abierto ? (
          <div className="flex flex-col gap-2">
            <div className="w-full text-center bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 font-mono text-[11px] tracking-[2px] uppercase py-4 cursor-default">
              ✓ WhatsApp abierto
            </div>
            <p className="text-ash font-light text-[11px]">
              ¿No se abrió?{' '}
              <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline">
                Reintentar
              </a>
            </p>
          </div>
        ) : (
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(true)}
            className="w-full text-center bg-[#25D366] text-[#0b3d24] font-mono text-[11px] tracking-[3px] uppercase py-4 hover:opacity-90 transition-opacity font-medium"
          >
            Recibir mi cupón por WhatsApp →
          </a>
        )}
        <p className="text-ash font-light text-[11px]">Te responderemos con tu cupón en menos de 2 horas.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        required
        value={form.nombre}
        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
        placeholder="Tu nombre"
        className="input-field"
      />
      <input
        required
        type="tel"
        inputMode="numeric"
        value={form.telefono}
        onChange={handleTel}
        placeholder="WhatsApp (10 dígitos)"
        maxLength={14}
        className="input-field"
      />
      <input
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="Correo (opcional)"
        className="input-field"
      />
      {/* Honeypot: oculto para humanos, los bots lo llenan */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.sitio}
        onChange={e => setForm(f => ({ ...f, sitio: e.target.value }))}
        className="hidden"
        aria-hidden="true"
      />
      <label className="flex items-start gap-2 text-ash font-light text-[11px] leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={form.acepta}
          onChange={e => setForm(f => ({ ...f, acepta: e.target.checked }))}
          className="mt-0.5 accent-gold"
        />
        <span>
          Acepto recibir promociones y novedades por WhatsApp, y el{' '}
          <Link href="/aviso-de-privacidad" target="_blank" className="text-gold underline">aviso de privacidad</Link>.
        </span>
      </label>
      {error && <p className="text-red-400 font-mono text-[10px]">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-gold w-full text-center mt-1 disabled:opacity-50"
      >
        {status === 'sending' ? 'Generando…' : 'Quiero mi 10%'}
      </button>
    </form>
  )
}
