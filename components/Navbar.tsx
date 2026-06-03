'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-16 h-[72px] flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-carbon/95 backdrop-blur-sm border-b border-stone/10' : ''}`}>
      <Link href="/" className="font-serif text-xl font-bold tracking-widest uppercase text-pearl">
        Focus <span className="text-gold italic font-light">3D</span>
      </Link>

      {/* Desktop */}
      <ul className="hidden md:flex items-center gap-9">
        {[['Nosotros', '/#nosotros'], ['Filosofía', '/#mvv'], ['Catálogo', '/catalogo'], ['Proceso', '/#proceso']].map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="font-mono text-[10px] tracking-[3px] uppercase text-stone hover:text-pearl transition-colors">
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/contacto" className="font-mono text-[10px] tracking-[2px] uppercase bg-gold text-carbon px-5 py-2.5 hover:bg-gold-lt transition-colors">
            Cotizar
          </Link>
        </li>
      </ul>

      {/* Mobile hamburger */}
      <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setOpen(!open)} aria-label="Menú">
        <span className={`w-6 h-px bg-pearl transition-transform duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`w-6 h-px bg-pearl transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-px bg-pearl transition-transform duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-[72px] left-0 right-0 bg-carbon border-b border-stone/15 px-6 py-8 flex flex-col gap-6 md:hidden">
          {[['Nosotros', '/#nosotros'], ['Filosofía', '/#mvv'], ['Catálogo', '/catalogo'], ['Proceso', '/#proceso'], ['Cotizar', '/contacto']].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}
              className="font-mono text-[11px] tracking-[3px] uppercase text-stone hover:text-pearl transition-colors">
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
