import Link from 'next/link'
import { siteConfig, whatsappLink } from '@/lib/site-config'

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-stone/10 px-6 md:px-16 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <img src="/branding/logo-mark.svg" alt="" aria-hidden="true" className="w-8 h-8" />
            <div className="font-serif text-2xl italic text-pearl">{siteConfig.name}</div>
          </div>
          <p className="text-ash text-sm font-light leading-relaxed max-w-[240px]">
            Esculturas decorativas inspiradas en arte clásico. Impresión 3D con acabado manual. Hecho en {siteConfig.country}.
          </p>
        </div>
        {[
          { title: 'Navegar', links: [['Inicio', '/'], ['Catálogo', '/catalogo'], ['Contacto', '/contacto']] },
          { title: 'Tiendas', links: [['Mercado Libre', siteConfig.social.mercadoLibre.url], ['Instagram', siteConfig.social.instagram.url], ['WhatsApp', whatsappLink()]] },
          { title: 'Líneas', links: [['Catálogo completo', '/catalogo'], ['Piezas Custom', '/catalogo?linea=Custom']] },
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
        <span className="font-mono text-[10px] tracking-wide text-ash">© {new Date().getFullYear()} {siteConfig.name} — {siteConfig.tagline}</span>
        <span className="font-mono text-[10px] tracking-wide text-ash">Hecho con precisión · {siteConfig.country}</span>
      </div>
    </footer>
  )
}
