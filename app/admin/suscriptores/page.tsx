import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import type { Suscriptor } from '@/lib/supabase'
import { CopiarContactos, SuscriptorAcciones, CuponUsadoBtn } from './SuscriptoresUI'

export default async function AdminSuscriptores() {
  const supabase = createAdminSupabaseClient()
  const { data: suscriptores } = await supabase
    .from('suscriptores')
    .select('*')
    .order('created_at', { ascending: false })

  const lista = (suscriptores ?? []) as Suscriptor[]
  // Separamos los dos contactos para que el admin pueda copiar uno u otro.
  const emails = lista.map(s => s.email).filter((e): e is string => !!e)
  const telefonos = lista.map(s => s.telefono).filter((t): t is string => !!t)

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[9px] tracking-[4px] uppercase text-gold mb-1">Marketing</div>
          <h1 className="font-serif text-3xl font-light text-pearl">Suscriptores</h1>
          <p className="text-ash font-light text-sm mt-1">
            {lista.length} registrados · {emails.length} con correo · {telefonos.length} con celular.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CopiarContactos label="correos" valores={emails} />
          <CopiarContactos label="teléfonos" valores={telefonos} />
        </div>
      </div>

      {lista.length > 0 ? (
        <div className="flex flex-col gap-3">
          {lista.map(s => (
            <div key={s.id} className="bg-ink border border-stone/10 p-5 hover:border-stone/20 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-serif text-lg font-semibold text-pearl">{s.nombre}</div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="font-mono text-[10px] text-gold hover:underline">
                        {s.email}
                      </a>
                    )}
                    {s.telefono && (
                      <a href={`https://wa.me/${s.telefono}`} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[10px] text-gold hover:underline">
                        {s.telefono}
                      </a>
                    )}
                    <span className="font-mono text-[9px] text-ash">
                      {new Date(s.created_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-stone">Token: {s.token}</span>
                    <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-gold">Cupón: {s.cupon}</span>
                    {s.cupon_usado ? (
                      <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-stone">
                        ✓ Usado{s.cupon_usado_at ? ` · ${new Date(s.cupon_usado_at).toLocaleDateString('es-MX')}` : ''}
                      </span>
                    ) : (
                      <>
                        {s.cupon_enviado_email_at && (
                          <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-green-400">
                            ✉ Email · {new Date(s.cupon_enviado_email_at).toLocaleDateString('es-MX')}
                          </span>
                        )}
                        {s.cupon_enviado_sms_at && (
                          <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-green-400">
                            📲 SMS · {new Date(s.cupon_enviado_sms_at).toLocaleDateString('es-MX')}
                          </span>
                        )}
                        {!s.cupon_enviado_email_at && !s.cupon_enviado_sms_at && (
                          <span className="font-mono text-[9px] bg-carbon px-2 py-1 text-ash">Cupón sin enviar</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SuscriptorAcciones id={s.id} verificado={s.estado === 'verificado'} />
                  <CuponUsadoBtn id={s.id} usado={s.cupon_usado} />
                </div>
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
