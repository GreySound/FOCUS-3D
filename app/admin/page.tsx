import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const [{ count: totalProductos }, { count: totalPedidos }, { count: mensajesNuevos }, { count: pedidosNuevos }] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('pedidos').select('*', { count: 'exact', head: true }),
    supabase.from('mensajes').select('*', { count: 'exact', head: true }).eq('leido', false),
    supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'nuevo'),
  ])

  const stats = [
    { label: 'Productos activos', value: totalProductos ?? 0, href: '/admin/productos', icon: '◉' },
    { label: 'Pedidos totales', value: totalPedidos ?? 0, href: '/admin/pedidos', icon: '◎' },
    { label: 'Pedidos nuevos', value: pedidosNuevos ?? 0, href: '/admin/pedidos', icon: '◈', alert: true },
    { label: 'Mensajes sin leer', value: mensajesNuevos ?? 0, href: '/admin/mensajes', icon: '◌', alert: true },
  ]

  return (
    <div>
      <div className="mb-10">
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-2">Bienvenido</div>
        <h1 className="font-serif text-4xl font-light text-pearl">Panel Focus <em>3D</em></h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {stats.map(({ label, value, href, icon, alert }) => (
          <Link key={label} href={href}
            className="bg-ink border border-stone/10 p-6 hover:border-stone/30 transition-all group">
            <div className={`font-serif text-5xl italic font-light mb-2 transition-colors ${alert && value > 0 ? 'text-gold' : 'text-pearl'}`}>
              {value}
            </div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-ash group-hover:text-stone transition-colors">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { title: 'Agregar producto', desc: 'Sube una nueva pieza al catálogo', href: '/admin/productos/nuevo', cta: 'Agregar →' },
          { title: 'Ver mensajes', desc: 'Revisa cotizaciones y consultas', href: '/admin/mensajes', cta: 'Ver bandeja →' },
          { title: 'Ver tienda', desc: 'Cómo se ve la tienda pública', href: '/', cta: 'Abrir tienda →' },
        ].map(({ title, desc, href, cta }) => (
          <Link key={title} href={href}
            className="bg-ink border border-stone/10 p-7 hover:border-gold/40 transition-all group">
            <h3 className="font-serif text-xl font-semibold mb-2 text-pearl">{title}</h3>
            <p className="text-ash text-sm font-light mb-4">{desc}</p>
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-gold">{cta}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
