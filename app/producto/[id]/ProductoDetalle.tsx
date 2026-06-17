'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'
import type { Producto } from '@/lib/supabase'

const ESTADO_LABEL = { disponible: 'Disponible', agotado: 'Agotado', bajo_pedido: 'Bajo pedido' }
const ESTADO_COLOR = { disponible: 'text-gold', agotado: 'text-red-400', bajo_pedido: 'text-stone' }

export default function ProductoDetalle({ producto: p, relacionados }: { producto: Producto; relacionados: Producto[] }) {
  const [imgActiva, setImgActiva] = useState(0)

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-carbon px-6 md:px-16 py-4 border-b border-stone/10">
        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[2px] uppercase text-ash">
          <Link href="/" className="hover:text-pearl transition-colors">Inicio</Link>
          <span>›</span>
          <Link href="/catalogo" className="hover:text-pearl transition-colors">Catálogo</Link>
          <span>›</span>
          <span className="text-stone">{p.nombre}</span>
        </div>
      </div>

      {/* Producto principal */}
      <section className="bg-carbon px-6 md:px-16 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

          {/* Galería */}
          <div className="flex flex-col gap-4">
            {/* Imagen principal */}
            <div className="aspect-square bg-ink relative overflow-hidden">
              {p.imagenes?.[imgActiva] ? (
                <Image
                  src={p.imagenes[imgActiva]}
                  alt={p.nombre}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 120 90" className="w-32 opacity-15" fill="none">
                    <polygon points="60,10 110,80 10,80" stroke="#b89a5a" strokeWidth="1" />
                    <circle cx="60" cy="57" r="8" stroke="#b89a5a" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {p.imagenes && p.imagenes.length > 1 && (
              <div className="flex gap-3">
                {p.imagenes.map((url, i) => (
                  <button key={url} onClick={() => setImgActiva(i)}
                    className={`w-20 h-20 relative overflow-hidden border-2 transition-all flex-shrink-0
                      ${i === imgActiva ? 'border-gold' : 'border-stone/20 hover:border-stone/50'}`}>
                    <Image src={url} alt={`${p.nombre} ${i + 1}`} fill className="object-cover object-center" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="font-mono text-[10px] tracking-[3px] uppercase text-gold mb-2">{p.linea}</div>
              <h1 className="font-serif text-5xl font-light leading-tight mb-3">{p.nombre}</h1>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl text-pearl">
                  ${p.precio_min.toLocaleString()} – ${p.precio_max.toLocaleString()} <span className="text-sm text-ash">MXN</span>
                </span>
                <span className={`font-mono text-[10px] tracking-wide uppercase ${ESTADO_COLOR[p.estado]}`}>
                  {ESTADO_LABEL[p.estado]}
                </span>
              </div>
            </div>

            {p.descripcion && (
              <p className="text-marble font-light leading-relaxed text-lg border-l-2 border-gold/30 pl-4">
                {p.descripcion}
              </p>
            )}

            {/* Detalles */}
            <div className="flex flex-col gap-2 bg-ink p-5 border border-stone/10">
              {[
                ['Línea', p.linea],
                ['Acabado', 'Mármol / Piedra / Custom'],
                ['Disponibilidad', ESTADO_LABEL[p.estado]],
                ['Edición', `Tiraje limitado — ${p.stock} unidades`],
                ['Envío', 'Todo México · 3–7 días hábiles'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-stone/10 last:border-0">
                  <span className="font-mono text-[9px] tracking-[2px] uppercase text-ash">{label}</span>
                  <span className="font-serif text-sm text-marble">{value}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              {p.estado !== 'agotado' ? (
                <>
                  <a href={siteConfig.social.mercadoLibre.url} target="_blank" rel="noopener noreferrer"
                    className="w-full text-center bg-[#ffe600] text-[#333] font-mono text-[11px] tracking-[3px] uppercase py-4 hover:bg-yellow-300 transition-colors font-medium">
                    Comprar en Mercado Libre
                  </a>
                  <a href={siteConfig.social.instagram.url} target="_blank" rel="noopener noreferrer"
                    className="w-full text-center bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-mono text-[11px] tracking-[3px] uppercase py-4 hover:opacity-90 transition-opacity">
                    Pedir por Instagram
                  </a>
                  <Link href={`/contacto?producto=${p.id}&nombre=${encodeURIComponent(p.nombre)}`}
                    className="w-full text-center border border-stone/30 text-pearl font-mono text-[11px] tracking-[3px] uppercase py-4 hover:border-pearl transition-colors">
                    Solicitar cotización
                  </Link>
                </>
              ) : (
                <Link href={`/contacto?producto=${p.id}&nombre=${encodeURIComponent(p.nombre)}&motivo=espera`}
                  className="w-full text-center bg-stone/10 text-ash font-mono text-[11px] tracking-[3px] uppercase py-4 hover:text-pearl hover:bg-stone/20 transition-colors">
                  Pieza agotada — anótate en la lista de espera
                </Link>
              )}
            </div>

            {/* Garantía */}
            <div className="flex flex-col gap-2">
              {['Pieza artesanal, firmada y numerada', 'Acabado postprocesado a mano', 'Envío protegido en embalaje especial'].map(txt => (
                <div key={txt} className="flex items-center gap-2 font-mono text-[9px] tracking-wide uppercase text-ash">
                  <span className="text-gold">✓</span> {txt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <section className="bg-ink px-6 md:px-16 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-2">Misma línea</div>
            <h2 className="font-serif text-3xl font-light mb-10">También te puede interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 bg-stone/10">
              {relacionados.map(rel => (
                <Link key={rel.id} href={`/producto/${rel.id}`}
                  className="bg-ink hover:bg-carbon transition-colors group block">
                  <div className="aspect-square relative overflow-hidden">
                    {rel.imagenes?.[0] ? (
                      <Image src={rel.imagenes[0]} alt={rel.nombre} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                    ) : (
                      <div className="w-full h-full bg-carbon flex items-center justify-center">
                        <span className="text-stone text-4xl opacity-20">◈</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-stone/10">
                    <div className="font-mono text-[9px] tracking-wide uppercase text-gold mb-1">{rel.linea}</div>
                    <div className="font-serif text-base font-semibold">{rel.nombre}</div>
                    <div className="font-mono text-sm text-stone mt-1">${rel.precio_min.toLocaleString()} MXN</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
