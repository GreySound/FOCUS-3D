import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-stone/10 px-6 md:px-16 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-2xl italic text-pearl mb-3">Focus 3D</div>
          <p className="text-ash text-sm font-light leading-relaxed max-w-[240px]">
            Arte escultórico de autor. Impresión 3D con acabados de galería. Hecho en México.
          </p>
        </div>
        {[
          { title: 'Navegar', links: [['Inicio', '/'], ['Catálogo', '/catalogo'], ['Contacto', '/contacto']] },
          { title: 'Tiendas', links: [['Mercado Libre', 'https://www.mercadolibre.com.mx'], ['Instagram', 'https://www.instagram.com'], ['WhatsApp', 'https://wa.me/521XXXXXXXXXX']] },
          { title: 'Líneas', links: [['Essentials', '/catalogo?linea=Essentials'], ['Statement', '/catalogo?linea=Statement'], ['Signature', '/catalogo?linea=Signature'], ['Custom / B2B', '/catalogo?linea=Custom']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 className="font-mono text-[10px] tracking-[3px] uppercase text-gold mb-4">{title}</h4>
            <ul className="flex flex-col gap-3">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-ash text-sm hover:text-pearl transition-colors font-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone/10 pt-6 flex flex-col md:flex-row justify-between gap-2">
        <span className="font-mono text-[10px] tracking-wide text-ash">© 2025 Focus 3D — Arte Escultórico</span>
        <span className="font-mono text-[10px] tracking-wide text-ash">Hecho con precisión · México</span>
      </div>
    </footer>
  )
}
