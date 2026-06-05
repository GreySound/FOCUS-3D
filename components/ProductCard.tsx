import Image from 'next/image'
import Link from 'next/link'
import type { Producto } from '@/lib/supabase'

export default function ProductCard({ p }: { p: Producto }) {
  const estadoLabel = { disponible: 'Disponible', agotado: 'Agotado', bajo_pedido: 'Bajo pedido' }
  const estadoColor = { disponible: 'text-gold', agotado: 'text-red-400', bajo_pedido: 'text-stone' }

  return (
    <Link href={`/producto/${p.id}`} className="card-product group block">
      {/* Imagen */}
      <div className="aspect-square bg-carbon relative overflow-hidden">
        {p.en_promocion && (
          <span className="absolute top-3 left-3 z-10 bg-gold text-carbon font-mono text-[9px] tracking-[2px] uppercase px-2.5 py-1">
            {p.promo_etiqueta || 'Promoción'}
          </span>
        )}
        {p.imagenes?.[0] ? (
          <Image
            src={p.imagenes[0]}
            alt={p.nombre}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 120 90" className="w-24 opacity-20" fill="none">
              <polygon points="60,10 110,80 10,80" stroke="#b89a5a" strokeWidth="1" />
              <polygon points="60,30 90,75 30,75" stroke="#a09890" strokeWidth="0.5" />
              <circle cx="60" cy="57" r="6" stroke="#b89a5a" strokeWidth="1" />
            </svg>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-carbon/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-pearl border border-pearl/50 px-4 py-2">
            Ver detalle
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 border-t border-stone/10">
        <div className="font-mono text-[9px] tracking-[2px] uppercase text-gold mb-1">{p.linea}</div>
        <div className="font-serif text-lg font-semibold mb-1 leading-tight">{p.nombre}</div>
        {p.descripcion && (
          <p className="text-stone text-sm font-light leading-relaxed mb-3 line-clamp-2">{p.descripcion}</p>
        )}
        <div className="flex justify-between items-center">
          {p.en_promocion && p.precio_promo ? (
            <span className="font-mono text-sm">
              <span className="text-ash line-through mr-2">${p.precio_min.toLocaleString()}</span>
              <span className="text-gold">${p.precio_promo.toLocaleString()} MXN</span>
            </span>
          ) : (
            <span className="font-mono text-sm text-pearl">
              ${p.precio_min.toLocaleString()} – ${p.precio_max.toLocaleString()} MXN
            </span>
          )}
          <span className={`font-mono text-[9px] tracking-wide uppercase ${estadoColor[p.estado]}`}>
            {estadoLabel[p.estado]}
          </span>
        </div>
      </div>
    </Link>
  )
}
