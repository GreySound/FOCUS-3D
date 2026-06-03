import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: producto } = await supabase.from('productos').select('*').eq('id', id).single()
  if (!producto) notFound()

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Catálogo</div>
        <h1 className="font-serif text-3xl font-light text-pearl">Editar: {producto.nombre}</h1>
      </div>
      <ProductForm producto={producto} />
    </div>
  )
}
