import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'
import type { Producto } from '@/lib/supabase'
import DeleteProductBtn from './DeleteProductBtn'
import NotificarPromoBtn from './NotificarPromoBtn'

export default async function AdminProductos() {
  const supabase = await createServerSupabaseClient()
  const { data: productos } = await supabase.from('productos').select('*').order('created_at', { ascending: false })

  const estadoColor = { disponible: 'text-green-400', agotado: 'text-red-400', bajo_pedido: 'text-yellow-400' }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Catálogo</div>
          <h1 className="font-serif text-3xl font-light text-pearl">Productos</h1>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-gold">+ Agregar producto</Link>
      </div>

      {productos && productos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {(productos as Producto[]).map(p => (
            <div key={p.id} className="bg-ink border border-stone/10 p-5 flex items-center gap-4 hover:border-stone/25 transition-all">
              {/* Imagen miniatura */}
              <div className="w-16 h-16 bg-carbon flex-shrink-0 overflow-hidden relative">
                {p.imagenes?.[0] ? (
                  <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone text-xs">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-base font-semibold text-pearl truncate">{p.nombre}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[9px] tracking-wide uppercase text-gold">{p.linea}</span>
                  <span className={`font-mono text-[9px] tracking-wide uppercase ${estadoColor[p.estado]}`}>{p.estado}</span>
                  <span className="font-mono text-[9px] text-ash">${p.precio_min.toLocaleString()}–${p.precio_max.toLocaleString()}</span>
                  {p.en_promocion && (
                    <span className="font-mono text-[9px] tracking-wide uppercase text-gold border border-gold/40 px-1.5 py-0.5">
                      {p.promo_etiqueta || 'Promo'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.en_promocion && <NotificarPromoBtn id={p.id} />}
                <Link href={`/admin/productos/${p.id}`}
                  className="font-mono text-[9px] tracking-[2px] uppercase text-stone hover:text-pearl border border-stone/20 hover:border-stone/50 px-3 py-2 transition-all">
                  Editar
                </Link>
                <DeleteProductBtn id={p.id} nombre={p.nombre} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-ink border border-stone/10">
          <p className="font-serif text-2xl italic text-ash mb-4">Sin productos todavía.</p>
          <Link href="/admin/productos/nuevo" className="btn-gold">Agregar el primero</Link>
        </div>
      )}
    </div>
  )
}
