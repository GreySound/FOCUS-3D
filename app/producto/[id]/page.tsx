import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductoDetalle from './ProductoDetalle'
import { notFound } from 'next/navigation'
import { siteConfig } from '@/lib/site-config'
import type { Metadata } from 'next'
import type { Producto } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: p } = await supabase.from('productos').select('*').eq('id', id).single()
  if (!p) return { title: 'Producto no encontrado' }
  return {
    title: p.nombre,
    description: p.descripcion ?? `${p.nombre} — ${siteConfig.name}. Arte escultórico de autor.`,
    alternates: { canonical: `/producto/${id}` },
    openGraph: {
      title: `${p.nombre} — ${siteConfig.name}`,
      description: p.descripcion ?? '',
      type: 'website',
      url: `${siteConfig.url}/producto/${id}`,
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

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.descripcion ?? `${producto.nombre} — ${siteConfig.name}`,
    image: producto.imagenes ?? [],
    brand: { '@type': 'Brand', name: siteConfig.name },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'MXN',
      lowPrice: producto.precio_min,
      highPrice: producto.precio_max,
      availability:
        producto.estado === 'agotado'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: `${siteConfig.url}/producto/${producto.id}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />
      <div className="pt-[72px]">
        <ProductoDetalle producto={producto as Producto} relacionados={(relacionados ?? []) as Producto[]} />
      </div>
      <Footer />
    </>
  )
}
