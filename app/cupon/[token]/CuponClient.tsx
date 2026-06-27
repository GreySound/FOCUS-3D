'use client'
import { useState } from 'react'

// Tarjeta visual del cupón. Único bit interactivo:
//   - botón "Copiar código" (con feedback breve)
//   - botón "Escribirnos por WhatsApp" (link wa.me, NO necesita API)
//
// Si el cupón ya fue marcado como usado por el admin, mostramos el estado
// y desactivamos el flujo (pero seguimos mostrando el código por trazabilidad).
export default function CuponClient({
  cupon,
  usado,
  usadoAt,
  whatsappUrl,
}: {
  cupon: string
  usado: boolean
  usadoAt: string | null
  whatsappUrl: string
}) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cupon)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sin permisos de portapapeles: el código está visible igual */
    }
  }

  return (
    <div className="bg-ink border border-gold/30 p-8 md:p-10 relative overflow-hidden">
      {usado && (
        <div className="absolute top-4 right-4 font-mono text-[9px] tracking-[2px] uppercase text-ash border border-stone/30 px-3 py-1">
          ✓ Canjeado
        </div>
      )}

      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[4px] uppercase text-ash mb-3">
          Tu cupón
        </div>
        <div className="font-mono text-2xl md:text-3xl tracking-[4px] text-gold font-semibold py-4 border-y border-gold/20 mb-6 select-all break-all">
          {cupon}
        </div>

        {!usado ? (
          <>
            <button
              onClick={copiar}
              className="font-mono text-[11px] tracking-[3px] uppercase border border-gold/40 text-gold px-6 py-3 hover:bg-gold/10 transition-colors mb-3"
            >
              {copiado ? '✓ Copiado' : 'Copiar código'}
            </button>
            <p className="text-ash font-light text-xs mb-6 mt-2">
              Aplica un 10% en tu primera pieza. Solo se puede usar una vez.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto bg-[#25D366] text-[#0b3d24] font-mono text-[11px] tracking-[3px] uppercase py-4 px-8 hover:opacity-90 transition-opacity font-medium"
            >
              Escribir por WhatsApp →
            </a>
          </>
        ) : (
          <p className="text-ash font-light text-sm">
            Este cupón ya fue canjeado
            {usadoAt && (
              <> el <span className="text-pearl">{new Date(usadoAt).toLocaleDateString('es-MX')}</span></>
            )}
            . ¡Gracias por tu compra!
          </p>
        )}
      </div>
    </div>
  )
}
