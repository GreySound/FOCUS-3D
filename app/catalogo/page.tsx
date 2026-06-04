import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import CatalogFilters from './CatalogFilters'
import type { Producto } from '@/lib/supabase'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Catálogo' }

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ linea?: string; estado?: string }>
}) {
  const { linea, estado } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase.from('productos').select('*').order('created_at', { ascending: false })
  if (linea) query = query.eq('linea', linea)
  if (estado) query = query.eq('estado', estado)

  const { data: productos, error } = await query

  return (
    <>
      <Navbar />
      <div className="pt-[72px]">
        <div className="bg-ink px-6 md:px-16 py-20">
          <div className="section-tag mb-5">Colección completa</div>
          <h1 className="section-title">Catálogo<br /><em className="text-stone">Focus 3D.</em></h1>
        </div>

        <section className="bg-carbon px-6 md:px-16 py-16">
          <CatalogFilters active={linea} />

          {error ? (
            <div className="text-center py-32">
              <p className="font-serif text-2xl italic text-ash">No pudimos cargar el catálogo en este momento. Intenta recargar la página.</p>
            </div>
          ) : productos && productos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-stone/10 mt-10">
              {(productos as Producto[]).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="font-serif text-2xl italic text-ash">Sin resultados para este filtro.</p>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  )
}
