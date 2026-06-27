'use client'
import { useState } from 'react'
import Link from 'next/link'
import { suscribir } from '@/lib/newsletter-actions'

// Formulario de alta al newsletter (cupón de bienvenida).
// El suscriptor decide cómo recibirlo: email, SMS o ambos. Pedimos al menos uno.
export default function NewsletterSignup({ onDone }: { onDone?: () => void }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    acepta: false,
    sitio: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    token?: string
    cupon?: string
    cuponUrl?: string
    enviadoPorEmail?: boolean
    enviadoPorSms?: boolean
  }>({})

  // Permite dígitos, espacios y los caracteres de formato comunes en MX.
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
    setResult({
      token: res.token,
      cupon: res.cupon,
      cuponUrl: res.cuponUrl,
      enviadoPorEmail: res.enviadoPorEmail,
      enviadoPorSms: res.enviadoPorSms,
    })
    setStatus('ok')
    onDone?.()
  }

  if (status === 'ok') {
    // Resumen de canales: lista lo que sí se mandó para que el cliente sepa dónde buscar.
    const canales: string[] = []
    if (result.enviadoPorEmail) canales.push('correo')
    if (result.enviadoPorSms) canales.push('SMS')
    const mensajeCanales =
      canales.length === 2
        ? 'Te enviamos tu cupón por correo y por SMS.'
        : canales.length === 1
        ? `Te enviamos tu cupón por ${canales[0]}.`
        : 'Tu cupón está listo aquí abajo — guárdalo en un lugar seguro.'

    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="w-14 h-14 border border-gold rounded-full flex items-center justify-center text-gold text-2xl mx-auto">🎁</div>
        <h3 className="font-serif text-2xl text-pearl">¡Listo!</h3>
        <p className="text-stone font-light text-sm leading-relaxed">
          {mensajeCanales} Úsalo en tu próxima compra.
        </p>

        {result.cupon && (
          <div className="font-mono text-gold text-lg tracking-[3px] border border-gold/30 py-3 select-all break-all">
            {result.cupon}
          </div>
        )}

        {result.cuponUrl && (
          <a
            href={result.cuponUrl}
            className="w-full text-center bg-gold text-carbon font-mono text-[11px] tracking-[3px] uppercase py-4 hover:opacity-90 transition-opacity font-medium"
          >
            Ver mi cupón →
          </a>
        )}

        {canales.length === 0 && (
          <p className="text-ash font-light text-[11px]">
            ¿No querías esperarnos? Guarda tu código arriba o usa el botón para ir a la página de tu cupón.
          </p>
        )}
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
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="Correo"
        className="input-field"
      />
      <input
        type="tel"
        inputMode="numeric"
        value={form.telefono}
        onChange={handleTel}
        placeholder="Celular (10 dígitos)"
        maxLength={14}
        className="input-field"
      />
      <p className="text-ash font-light text-[10px] -mt-1">
        Te enviamos el cupón por el canal que prefieras. Déjanos correo, celular o ambos.
      </p>

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
          Acepto recibir promociones y novedades, y el{' '}
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
