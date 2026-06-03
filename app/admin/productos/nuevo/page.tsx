import ProductForm from '@/components/admin/ProductForm'

export default function NuevoProducto() {
  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Catálogo</div>
        <h1 className="font-serif text-3xl font-light text-pearl">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  )
}
