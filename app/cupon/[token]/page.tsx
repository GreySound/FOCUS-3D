import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { siteConfig, whatsappLink } from '@/lib/site-config'
import CuponClient from './CuponClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Página pública del cupón: el suscriptor llega aquí desde el email/SMS
// que recibió tras suscribirse. Lo lee desde la base con el token (no se
// expone ningún dato sensible, solo nombre + cupón + estado).

export const dynamic = 'force-dynamic' // siempre datos frescos (el estado "usado" cambia)

type Params = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params
  return {
    title: `Tu cupón ${token}`,
    description: `Cupón de bienvenida del 10% en ${siteConfig.name}.`,
    robots: { index: false, follow: false }, // las páginas de cupón no se indexan
  }
}

export default async function CuponPage({ params }: Params) {
  const { token } = await params
  if (!token) notFound()

  const supabase = createAdminSupabaseClient()
  const { data: sub } = await supabase
    .from('suscriptores')
    .select('nombre, cupon, cupon_usado, cupon_usado_at, created_at, token')
    .eq('token', token)
    .maybeSingle()

  if (!sub) notFound()

  const mensajeWhats =
    `¡Hola ${siteConfig.name}! 👋 Vengo de mi cupón de bienvenida ` +
    `(${sub.cupon}). Quiero saber más sobre las piezas.`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-carbon pt-[72px]">
        <section className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <div className="font-mono text-[10px] tracking-[4px] uppercase text-gold mb-3">
              Bienvenida a {siteConfig.name}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-pearl leading-tight">
              Hola <em className="text-gold">{sub.nombre}</em>,
              <br />
              tu cupón está listo.
            </h1>
          </div>

          <CuponClient
            cupon={sub.cupon}
            usado={sub.cupon_usado}
            usadoAt={sub.cupon_usado_at}
            whatsappUrl={whatsappLink(mensajeWhats)}
          />

          <div className="mt-12 text-center">
            <p className="text-ash font-light text-sm mb-4">
              Úsalo en tu primera pieza. Explora el catálogo:
            </p>
            <Link href="/catalogo" className="btn-gold">Ver catálogo</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
