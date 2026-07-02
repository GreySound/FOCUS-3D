import { createServerSupabaseClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import ClassicalBackdrop from '@/components/ClassicalBackdrop'
import NewsletterSignup from '@/components/NewsletterSignup'
import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'
import type { Producto } from '@/lib/supabase'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .eq('estado', 'disponible')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center px-6 md:px-16 relative overflow-hidden pt-[72px]">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(108deg, transparent, transparent 60px, rgba(255,255,255,0.8) 60px, rgba(255,255,255,0.8) 61px)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 70% 50%, rgba(184,154,90,0.06) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-2xl">
          <div className="section-tag mb-7">Esculturas decorativas · Impresión 3D</div>
          <h1 className="font-serif font-bold text-[clamp(4rem,10vw,9rem)] leading-[0.88] tracking-[-3px] mb-8">
            Arte<br /><em className="font-light text-gold">que domina</em><br />el espacio
          </h1>
          <p className="text-stone text-lg font-light leading-relaxed italic mb-12 max-w-md">
            Esculturas inspiradas en el arte clásico. Impresas capa por capa, 
            acabadas a mano. Tecnología y artesanía para espacios contemporáneos.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/catalogo" className="btn-gold">Ver catálogo</Link>
            <Link href="/contacto" className="btn-ghost">Pedir cotización</Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-6 md:left-16 flex items-center gap-3 font-mono text-[9px] tracking-[3px] uppercase text-ash">
          <span>Desplaza</span>
          <div className="w-px h-10 bg-ash animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-gold overflow-hidden py-3.5">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {Array(3).fill(['Arte Romano', 'Acabado Mármol', 'Mitología Griega', 'Escultura Moderna', 'Impresión 3D', 'Focus 3D']).flat().map((t, i) => (
            <span key={i} className="font-mono text-[10px] tracking-[3px] uppercase text-carbon px-10 after:content-['·'] after:ml-10">{t}</span>
          ))}
        </div>
      </div>

      {/* ── NOSOTROS ── */}
      <section id="nosotros" className="bg-ink px-6 md:px-16 py-24 md:py-32 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div>
          <div className="section-tag mb-5">Sobre nosotros</div>
          <h2 className="section-title mb-8">Tecnología y<br /><em className="text-stone">artesanía.</em></h2>
          <p className="text-marble font-light leading-relaxed mb-5">
            Focus 3D produce esculturas decorativas inspiradas en la historia, la mitología y el arte clásico. Usamos impresión 3D para reproducir piezas icónicas, y luego aplicamos un proceso de acabado manual que transforma cada impresión en una pieza con presencia visual.
          </p>
          <p className="text-marble font-light leading-relaxed">
            Cada pieza pasa por lijado, imprimatura, pintura y acabado antes de enviarse. El resultado: esculturas que parecen talladas en piedra o fundidas en bronce, sin el peso ni el costo de los materiales originales.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-0.5 bg-stone/20">
          {[['2', 'Impresoras activas'], ['100%', 'Acabado manual'], ['✓', 'Personalización de modelos disponible'], ['∞', 'Posibilidades custom']].map(([num, label]) => (
            <div key={label} className="bg-carbon p-8 text-center">
              <div className="font-serif text-5xl italic text-gold font-light mb-2">{num}</div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-ash">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATÁLOGO PREVIEW ── */}
      <section id="catalogo-preview" className="bg-carbon px-6 md:px-16 py-24 md:py-32">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="section-tag mb-4">Colección actual</div>
            <h2 className="section-title">Piezas<br /><em className="text-stone">disponibles.</em></h2>
          </div>
          <Link href="/catalogo" className="btn-ghost">Ver todo el catálogo</Link>
        </div>
        {error ? (
          <div className="text-center py-24 text-ash font-light italic font-serif text-xl">
            No pudimos cargar las piezas en este momento. Intenta recargar la página.
          </div>
        ) : productos && productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-stone/10">
            {(productos as Producto[]).map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-ash font-light italic font-serif text-xl">
            Próximamente — colección en preparación.
          </div>
        )}
      </section>

      {/* ── PROCESO ── */}
      <section id="proceso" className="bg-ink px-6 md:px-16 py-24 md:py-32">
        <div className="section-tag mb-5">Cómo lo hacemos</div>
        <h2 className="section-title mb-16">Del archivo<br /><em className="text-stone">a tu espacio.</em></h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          {[
            ['01', 'Selección del catálogo', 'Elegimos modelos 3D inspirados en arte clásico, mitología e historia. Cada pieza tiene un propósito visual.'],
            ['02', 'Impresión capa por capa', 'Boquilla de 0.4mm, paredes gruesas. De 24 a 72 horas por pieza según tamaño y complejidad.'],
            ['03', 'Acabado artesanal', 'Relleno, lijado, pintura y detallado. Cada pieza se trabaja a mano para eliminar imperfecciones.'],
            ['04', 'Acabado final', 'Pintura, patinado y sellado con acabados artísticos inspirados en la época clásica y mitológica.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="text-center relative">
              <div className="w-12 h-12 border border-gold rounded-full flex items-center justify-center mx-auto mb-6 bg-carbon relative z-10">
                <span className="font-mono text-[11px] text-gold">{num}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold mb-3">{title}</h3>
              <p className="text-stone text-sm font-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CANALES ── */}
      <section className="bg-paper text-carbon px-6 md:px-16 py-24 md:py-32">
        <div className="section-tag mb-5">¿Dónde comprar?</div>
        <h2 className="section-title mb-16">Dos formas<br /><em className="text-ash">de llegar a nosotros.</em></h2>
        <div className="grid md:grid-cols-2 gap-0.5 bg-marble">
          {[
            { icon: '🛒', tag: 'Tienda oficial', name: 'Mercado Libre', desc: 'Compra segura con protección al comprador. Pago en línea, envíos a todo México, reseñas verificadas.', cta: 'Visitar tienda', href: siteConfig.social.mercadoLibre.url },
            { icon: '📸', tag: 'Pedidos custom · DM abierto', name: 'Instagram', desc: 'Para piezas personalizadas y cotizaciones B2B. Respondemos en menos de 2 horas.', cta: 'Escribirnos', href: siteConfig.social.instagram.url },
          ].map(({ icon, tag, name, desc, cta, href }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer"
              className="bg-pearl p-12 flex flex-col gap-5 hover:bg-carbon hover:text-pearl transition-all duration-300 group no-underline">
              <div className="text-4xl">{icon}</div>
              <div>
                <div className="font-mono text-[9px] tracking-[3px] uppercase text-gold mb-1">{tag}</div>
                <div className="font-serif text-3xl font-bold">{name}</div>
              </div>
              <p className="text-sm font-light leading-relaxed text-ash group-hover:text-marble transition-colors">{desc}</p>
              <div className="border border-carbon group-hover:border-pearl mt-auto w-fit px-6 py-3 font-mono text-[10px] tracking-[2px] uppercase transition-colors">
                {cta} →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── CUPÓN DE BIENVENIDA ── */}
      <section className="relative bg-ink px-6 md:px-16 py-24 md:py-32 overflow-hidden">
        <ClassicalBackdrop />
        <div className="relative z-10 max-w-xl mx-auto text-center">
          <div className="section-tag mb-5">Cupón de bienvenida</div>
          <h2 className="section-title mb-5">10% en tu<br /><em className="text-gold">primera pieza.</em></h2>
          <p className="text-marble font-light leading-relaxed mb-10">
            Suscríbete y recibe tu cupón del 10% directo en tu correo o por SMS.
            Además serás el primero en enterarte de nuevos lanzamientos y promociones.
          </p>
          <div className="max-w-sm mx-auto text-left">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
