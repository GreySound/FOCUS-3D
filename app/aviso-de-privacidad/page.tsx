import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { siteConfig } from '@/lib/site-config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  robots: { index: false, follow: true },
}

export default function AvisoPrivacidad() {
  return (
    <>
      <Navbar />
      <div className="pt-[72px]">
        <section className="bg-carbon px-6 md:px-16 py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <div className="section-tag mb-5">Legal</div>
            <h1 className="section-title mb-10">Aviso de<br /><em className="text-stone">privacidad.</em></h1>

            <div className="flex flex-col gap-8 text-marble font-light leading-relaxed">
              <p className="text-ash text-sm">
                En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión
                de los Particulares (LFPDPPP).
              </p>

              <Bloque titulo="Responsable">
                {siteConfig.name} es responsable del tratamiento de tus datos personales.
                Para cualquier asunto relacionado, escríbenos a{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className="text-gold underline">{siteConfig.contact.email}</a>.
              </Bloque>

              <Bloque titulo="Datos que recabamos">
                Nombre, número de WhatsApp y, opcionalmente, correo electrónico. Los obtenemos
                únicamente cuando tú decides suscribirte a nuestras promociones.
              </Bloque>

              <Bloque titulo="Finalidad">
                Usamos tus datos para enviarte tu cupón de bienvenida y para informarte sobre
                nuevos productos, lanzamientos y promociones a través de WhatsApp. No los usamos
                para ningún otro fin ni los compartimos con terceros.
              </Bloque>

              <Bloque titulo="Tus derechos (ARCO)">
                Puedes Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos en cualquier
                momento. Para darte de baja, basta con responder <strong className="text-pearl">BAJA</strong> a
                cualquiera de nuestros mensajes de WhatsApp, o escribirnos a{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className="text-gold underline">{siteConfig.contact.email}</a>.
              </Bloque>

              <Bloque titulo="Conservación">
                Conservamos tus datos mientras permanezcas suscrito. Si solicitas la baja, los
                eliminamos de nuestras listas de difusión.
              </Bloque>

              <p className="text-ash text-xs mt-4">
                Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-gold/40 pl-5">
      <h2 className="font-serif text-xl text-pearl mb-2">{titulo}</h2>
      <p>{children}</p>
    </div>
  )
}
