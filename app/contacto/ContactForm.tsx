'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Props = {
  productoId?: string
  productoNombre?: string
  motivo?: string
}

// Arma el mensaje prellenado según el producto y el motivo (cotización o lista de espera).
function mensajeInicial(nombre?: string, motivo?: string): string {
  if (!nombre) return ''
  if (motivo === 'espera') {
    return `Hola, la pieza «${nombre}» aparece como agotada. Me gustaría que me avisen cuando vuelva a estar disponible / entrar a la lista de espera.`
  }
  return `Hola, me interesa la pieza «${nombre}». ¿Me pueden compartir una cotización con disponibilidad, acabados y tiempo de entrega?`
}

export default function ContactForm({ productoId, productoNombre, motivo }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [producto, setProducto] = useState(
    productoId && productoNombre ? { id: productoId, nombre: productoNombre } : null
  )
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    interes: productoNombre
      ? motivo === 'espera'
        ? 'Lista de espera'
        : 'Cotización de pieza'
      : '',
    mensaje: mensajeInicial(productoNombre, motivo),
  })
  const [telError, setTelError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar teléfono si fue llenado
    if (form.telefono) {
      const digits = form.telefono.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 13) {
        setTelError('Ingresa un número válido (10 dígitos, o con lada +52)')
        return
      }
    }

    setStatus('sending')
    const supabase = createClient()
    // Si la cotización viene de una ficha de producto, guardamos la referencia
    // para que el admin sepa de inmediato de qué pieza se trata.
    const payload = { ...form, producto_ref: producto?.id ?? null }
    const { error } = await supabase.from('mensajes').insert([payload])
    setStatus(error ? 'error' : 'ok')
  }

  const handleTel = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permite números, +, espacios, guiones y paréntesis
    const val = e.target.value.replace(/[^\d\s+()-]/g, '')
    setForm(f => ({ ...f, telefono: val }))
    setTelError('')
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  if (status === 'ok') return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 border border-gold rounded-full flex items-center justify-center text-gold text-2xl">✓</div>
      <h3 className="font-serif text-2xl">Mensaje recibido</h3>
      <p className="text-stone font-light">Te contactamos en menos de 2 horas.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {producto && (
        <div className="flex items-start justify-between gap-3 bg-ink border border-gold/30 p-4">
          <div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-gold mb-1">
              {motivo === 'espera' ? 'Lista de espera' : 'Cotización de'}
            </div>
            <div className="font-serif text-lg text-pearl leading-tight">{producto.nombre}</div>
            <Link href={`/producto/${producto.id}`}
              className="inline-block mt-1 font-mono text-[9px] tracking-wide uppercase text-stone hover:text-pearl transition-colors">
              Ver pieza ›
            </Link>
          </div>
          <button type="button" onClick={() => setProducto(null)}
            title="Quitar referencia del producto"
            className="font-mono text-[11px] text-ash hover:text-pearl transition-colors leading-none">
            ✕
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[2px] uppercase text-ash">Nombre *</label>
          <input required value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" className="input-field" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[2px] uppercase text-ash">
            Teléfono <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.telefono}
            onChange={handleTel}
            placeholder="6671234567"
            maxLength={14}
            className={`input-field ${telError ? 'border-red-400' : ''}`}
          />
          {telError && <p className="text-red-400 font-mono text-[9px]">{telError}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] tracking-[2px] uppercase text-ash">Correo *</label>
        <input required type="email" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" className="input-field" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] tracking-[2px] uppercase text-ash">¿Qué te interesa?</label>
        <select value={form.interes} onChange={set('interes')} className="input-field">
          <option value="">Selecciona una opción</option>
          {(form.interes === 'Cotización de pieza' || form.interes === 'Lista de espera') && (
            <option value={form.interes}>{form.interes}</option>
          )}
          <option>Pieza del catálogo</option>
          <option>Proyecto personalizado (custom)</option>
          <option>Logo 3D para negocio</option>
          <option>Solo tengo una pregunta</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] tracking-[2px] uppercase text-ash">Cuéntame más</label>
        <textarea value={form.mensaje} onChange={set('mensaje')} rows={4}
          placeholder="¿Para qué espacio es? ¿Tienes alguna referencia de estilo?" className="input-field resize-y" />
      </div>
      {status === 'error' && <p className="text-red-400 text-sm font-mono text-[11px]">Error al enviar. Intenta de nuevo.</p>}
      <button type="submit" disabled={status === 'sending'}
        className="btn-gold w-full text-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}
