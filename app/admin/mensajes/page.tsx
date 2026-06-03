import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Mensaje } from '@/lib/supabase'
import MarcarLeidoBtn from './MarcarLeidoBtn'
import EliminarMensajeBtn from './EliminarMensajeBtn'

export default async function AdminMensajes() {
  const supabase = await createServerSupabaseClient()
  const { data: mensajes } = await supabase
    .from('mensajes')
    .select('*')
    .order('created_at', { ascending: false })

  const sinLeer = mensajes?.filter(m => !m.leido).length ?? 0
  const total = mensajes?.length ?? 0

  return (
    <div>
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Bandeja</div>
          <h1 className="font-serif text-3xl font-light text-pearl">
            Mensajes{' '}
            {sinLeer > 0 && <span className="text-gold italic text-2xl">({sinLeer} nuevos)</span>}
          </h1>
        </div>
        <div className="font-mono text-[9px] tracking-[2px] uppercase text-ash">
          {total} mensaje{total !== 1 ? 's' : ''} en total
        </div>
      </div>

      {mensajes && mensajes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {(mensajes as Mensaje[]).map(m => (
            <div key={m.id} className={`border p-5 transition-all ${m.leido ? 'bg-carbon border-stone/10' : 'bg-ink border-gold/20'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-serif text-base font-semibold text-pearl">{m.nombre}</span>
                    {!m.leido && (
                      <span className="font-mono text-[8px] tracking-widest uppercase bg-gold text-carbon px-2 py-0.5">Nuevo</span>
                    )}
                    <span className="font-mono text-[9px] text-ash">
                      {new Date(m.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <a href={`mailto:${m.email}`}
                      className="font-mono text-[9px] text-gold hover:underline">{m.email}</a>
                    {m.telefono && (
                      <a href={`https://wa.me/${m.telefono.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[9px] text-green-400 hover:underline">
                        📱 {m.telefono}
                      </a>
                    )}
                    {m.interes && (
                      <span className="font-mono text-[9px] text-stone bg-stone/10 px-2 py-0.5">{m.interes}</span>
                    )}
                  </div>
                  {m.mensaje && (
                    <p className="text-marble text-sm font-light leading-relaxed">{m.mensaje}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!m.leido && <MarcarLeidoBtn id={m.id} />}
                  <EliminarMensajeBtn id={m.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-ink border border-stone/10">
          <p className="font-serif text-2xl italic text-ash">Sin mensajes todavía.</p>
        </div>
      )}
    </div>
  )
}
