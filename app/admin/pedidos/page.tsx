import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Pedido } from '@/lib/supabase'
import PedidoEstadoBtn from './PedidoEstadoBtn'

const ESTADOS = ['nuevo', 'en_proceso', 'listo', 'enviado', 'entregado']
const ESTADO_COLOR: Record<string, string> = {
  nuevo: 'text-blue-400 border-blue-400/30',
  en_proceso: 'text-yellow-400 border-yellow-400/30',
  listo: 'text-gold border-gold/30',
  enviado: 'text-purple-400 border-purple-400/30',
  entregado: 'text-green-400 border-green-400/30',
}

export default async function AdminPedidos() {
  const supabase = await createServerSupabaseClient()
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*, productos(nombre))')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Gestión</div>
        <h1 className="font-serif text-3xl font-light text-pearl">Pedidos</h1>
      </div>

      {pedidos && pedidos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {(pedidos as Pedido[]).map(p => (
            <div key={p.id} className="bg-ink border border-stone/10 p-5 hover:border-stone/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-serif text-lg font-semibold text-pearl">{p.nombre_cliente}</div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="font-mono text-[9px] text-ash">{p.email}</span>
                    {p.telefono && <span className="font-mono text-[9px] text-ash">{p.telefono}</span>}
                    <span className="font-mono text-[9px] uppercase text-stone">{p.canal}</span>
                    <span className="font-mono text-[9px] text-ash">{new Date(p.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  {p.pedido_items && p.pedido_items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.pedido_items.map(item => (
                        <span key={item.id} className="font-mono text-[9px] bg-carbon px-2 py-1 text-stone">
                          {item.cantidad}× {(item as any).productos?.nombre ?? 'Producto'} — ${item.precio_unitario.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.notas && <p className="text-ash text-sm font-light mt-2 italic">"{p.notas}"</p>}
                </div>
                <div className="flex flex-col items-end gap-3">
                  {p.total && <span className="font-mono text-sm text-pearl">${p.total.toLocaleString()} MXN</span>}
                  <span className={`font-mono text-[9px] tracking-wide uppercase border px-3 py-1 ${ESTADO_COLOR[p.estado]}`}>{p.estado}</span>
                  <PedidoEstadoBtn id={p.id} estadoActual={p.estado} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-ink border border-stone/10">
          <p className="font-serif text-2xl italic text-ash">Sin pedidos todavía.</p>
        </div>
      )}
    </div>
  )
}
