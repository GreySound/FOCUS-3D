import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-carbon text-pearl flex flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[10px] tracking-[4px] uppercase text-gold mb-4">Error 404</div>
      <h1 className="font-serif text-6xl md:text-7xl font-light leading-none mb-6">
        Página<br /><em className="text-stone">no encontrada.</em>
      </h1>
      <p className="text-ash font-light max-w-sm mb-10">
        La pieza que buscas no existe o fue movida. Vuelve al inicio o explora el catálogo.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/" className="btn-gold">Volver al inicio</Link>
        <Link href="/catalogo" className="btn-ghost">Ver catálogo</Link>
      </div>
    </main>
  )
}
