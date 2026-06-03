import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacto' }

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <div className="pt-[72px]">
        <section className="bg-carbon px-6 md:px-16 py-24 md:py-32">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">

            <div>
              <div className="section-tag mb-5">Contacto</div>
              <h1 className="section-title mb-10">Hablemos de<br /><em className="text-stone">tu espacio.</em></h1>
              <div className="flex flex-col gap-7">
                {[
                  { label: 'Instagram', value: '@focus3d.art', href: 'https://www.instagram.com' },
                  { label: 'Mercado Libre', value: 'Focus 3D — Tienda Oficial', href: 'https://www.mercadolibre.com.mx' },
                  { label: 'WhatsApp', value: '+52 1 (XX) XXXX-XXXX', href: 'https://wa.me/521XXXXXXXXXX' },
                  { label: 'Tiempo de respuesta', value: 'Menos de 2 horas en horario hábil', href: null },
                  { label: 'Envíos', value: 'Todo México · 3–7 días hábiles', href: null },
                ].map(({ label, value, href }) => (
                  <div key={label} className="border-l-2 border-gold pl-5">
                    <div className="font-mono text-[9px] tracking-[3px] uppercase text-gold mb-1">{label}</div>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-marble hover:text-gold transition-colors font-light">{value}</a>
                    ) : (
                      <span className="text-marble font-light">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <ContactForm />
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
