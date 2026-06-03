'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/productos', label: 'Productos', icon: '◉' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '◎' },
  { href: '/admin/mensajes', label: 'Mensajes', icon: '◌' },
]

export default function AdminSidebar() {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-ink border-r border-stone/10 flex-col">
        <div className="p-7 border-b border-stone/10">
          <div className="font-serif text-xl font-bold text-pearl">
            Focus <span className="text-gold italic font-light">3D</span>
          </div>
          <div className="font-mono text-[9px] tracking-[3px] uppercase text-ash mt-1">Panel admin</div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {links.map(({ href, label, icon }) => {
            const active = href === '/admin' ? path === '/admin' : path.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3 font-mono text-[10px] tracking-[2px] uppercase transition-all
                  ${active ? 'bg-gold/10 text-gold border-l-2 border-gold' : 'text-ash hover:text-pearl hover:bg-white/5'}`}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-stone/10 flex flex-col gap-3">
          <Link href="/" className="font-mono text-[9px] tracking-[2px] uppercase text-ash hover:text-pearl transition-colors">
            ← Ver tienda
          </Link>
          <button
            onClick={handleLogout}
            className="font-mono text-[9px] tracking-[2px] uppercase text-red-400/60 hover:text-red-400 transition-colors text-left"
          >
            ⏻ Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-ink border-b border-stone/10 z-50 flex items-center justify-between px-4 h-14">
        <div className="font-serif font-bold text-pearl">
          Focus <span className="text-gold italic font-light">3D</span>{' '}
          <span className="text-ash font-mono text-[9px] tracking-widest uppercase">Admin</span>
        </div>
        <div className="flex gap-4 items-center">
          {links.map(({ href, icon }) => (
            <Link key={href} href={href} className={`text-lg ${path.startsWith(href) ? 'text-gold' : 'text-ash'}`}>
              {icon}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-red-400/60 hover:text-red-400 text-sm">⏻</button>
        </div>
      </div>
      <div className="md:hidden h-14" />
    </>
  )
}
