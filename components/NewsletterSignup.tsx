'use client'
import { useState } from 'react'
import Link from 'next/link'
import { suscribir } from '@/lib/newsletter-actions'

// Formulario de alta al newsletter (cupón de bienvenida).
// El suscriptor decide cómo recibirlo: email, SMS o ambos. Pedimos al menos uno.
//
// IMPORTANTE: el código del cupón NUNCA se muestra en la pantalla de confirmación.
// Vive únicamente en el correo o SMS que recibe la persona — esa es la fuente
// única de verdad y refuerza que revise su bandeja.
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
    enviadoPorEmail?: boolean
    enviadoPorSms?: boolean
    // Dónde se intentó enviar (para mensajes específicos).
    intentoEmail: boolean
    intentoSms: boolean
  }>({ intentoEmail: false, intentoSms: false })

  // Permite dígitos, espacios y los caracteres de formato comunes en MX.
  const handleTel = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, telefono: e.target.value.replace(/[^\d\s+()-]/g, '') }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError('')

    const intentoEmail = !!form.email.trim()
    const intentoSms = !!form.telefono.trim()

    const res = await suscribir(form)
    if (!res.ok) {
      setError(res.error ?? 'Algo salió mal.')
      setStatus('error')
      return
    }

    // Si la persona dio uno o más canales pero NINGUNO logró enviar,
    // tratamos esto como error: el cupón solo existe en el correo/SMS,
    // así que sin envío no hay forma de que lo reciba.
    const enviado = !!res.enviadoPorEmail || !!res.enviadoPorSms
    const seIntento = intentoEmail || intentoSms
    if (seIntento && !enviado) {
      setError(
        'No pudimos enviarte el cupón en este momento. Intenta de nuevo en unos minutos o escríbenos por WhatsApp.'
      )
      setStatus('error')
      return
    }

    setResult({
      enviadoPorEmail: res.enviadoPorEmail,
      enviadoPorSms: res.enviadoPorSms,
      intentoEmail,
      intentoSms,
    })
    setStatus('ok')
    onDone?.()
  }

  if (status === 'ok') {
    // Construimos el mensaje según los canales que se enviaron con éxito.
    const partes: string[] = []
    if (result.enviadoPorEmail) partes.push('a tu correo')
    if (result.enviadoPorSms) partes.push('a tu celular por SMS')
    const destino = partes.length === 2 ? partes.join(' y ') : partes[0] || ''

    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="w-14 h-14 border border-gold rounded-full flex items-center justify-center text-gold text-2xl mx-auto">
          ✉
        </div>
        <h3 className="font-serif text-2xl text-pearl">¡Listo!</h3>
        <p className="text-stone font-light text-sm leading-relaxed">
          Acabamos de enviarte tu <strong className="text-pearl">cupón del 10%</strong>
          {destino && <> {destino}</>}.
          <br />
          Revisa tu bandeja en los próximos minutos.
        </p>
        {result.enviadoPorEmail && (
          <p className="text-ash font-light text-[11px]">
            Si no lo ves, revisa la carpeta de <em>Promociones</em> o <em>Spam</em>.
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
        required
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="Correo electrónico"
        className="input-field"
      />
      <p className="text-ash font-light text-[10px] -mt-1">
        Te enviaremos tu cupón del 10% directo a tu correo.
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
        {status === 'sending' ? 'Enviando…' : 'Quiero mi 10%'}
      </button>
    </form>
  )
}
