import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductoDetalle from './ProductoDetalle'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Producto } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: p } = await supabase.from('productos').select('*').eq('id', id).single()
  if (!p) return { title: 'Producto no encontrado' }
  return {
    title: p.nombre,
    description: p.descripcion ?? `${p.nombre} — Focus 3D. Arte escultórico de autor.`,
    openGraph: {
      title: `${p.nombre} — Focus 3D`,
      description: p.descripcion ?? '',
      images: p.imagenes?.[0] ? [{ url: p.imagenes[0] }] : [],
    },
  }
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: producto } = await supabase.from('productos').select('*').eq('id', id).single()
  if (!producto) notFound()

  const { data: relacionados } = await supabase
    .from('productos')
    .select('*')
    .eq('linea', producto.linea)
    .neq('id', id)
    .limit(3)

  return (
    <>
      <Navbar />
      <div className="pt-[72px]">
        <ProductoDetalle producto={producto as Producto} relacionados={(relacionados ?? []) as Producto[]} />
      </div>
      <Footer />
    </>
  )
}
