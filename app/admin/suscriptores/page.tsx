import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { Suscriptor } from '@/lib/supabase'
import { CopiarTelefonos, SuscriptorAcciones } from './SuscriptoresUI'

export default async function AdminSuscriptores() {
  const supabase = createAdminSupabaseClient()
  const { data: suscriptores } = await supabase
    .from('suscriptores')
    .select('*')
    .order('created_at', { ascending: false })

  const lista = (suscriptores ?? []) as Suscriptor[]
  const telefonos = lista.map(s => s.telefono)

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Marketing</div>
          <h1 className="font-serif text-3xl font-light text-pearl">Suscriptores</h1>
          <p className="text-ash font-light text-sm mt-1">{lista.length} registrados · usa "Copiar teléfonos" para tu lista de difusión.</p>
        </div>
        <CopiarTelefonos telefonos={telefonos} />
      </div>

      {lista.length > 0 ? (
        <div className="flex flex-col gap-3">
          {lista.map(s => (
            <div key={s.id} className="bg-ink border border-stone/10 p-5 hover:border-stone/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-serif text-lg font-semibold text-pearl">{s.nombre}</div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <a href={`https://wa.me/${s.telefono}`} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-[10px] text-gold hover:underline">{s.telefono}</a>
                    {s.email && <span className="font-mono text-[9px] text-ash">{s.email}</span>}
                    <span className="font-mono text-[9px] text-ash">{new Date(s.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-stone">Registro: {s.token}</span>
                    <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-gold">Cupón: {s.cupon}</span>
                  </div>
                </div>
                <SuscriptorAcciones id={s.id} verificado={s.estado === 'verificado'} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-ink border border-stone/10">
          <p className="font-serif text-2xl italic text-ash">Aún no hay suscriptores.</p>
        </div>
      )}
    </div>
  )
}
