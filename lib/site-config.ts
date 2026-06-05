// ── Configuración central del sitio ───────────────────────
// Cambia aquí los datos de contacto, redes y enlaces: se usan en TODA la web
// desde un único lugar (Navbar, Footer, contacto, fichas de producto, SEO...).
//
// Cada valor puede sobreescribirse en producción con una variable de entorno
// NEXT_PUBLIC_* (se accede de forma literal para que Next.js la inyecte también
// en los componentes del navegador). Si no defines la variable, se usa el
// valor por defecto de abajo — edítalo con tus datos reales.

export const siteConfig = {
  name: 'Focus 3D',
  tagline: 'Arte Escultórico',
  description:
    'Piezas escultóricas únicas de impresión 3D con acabados de galería. Mármol, piedra, obsidiana. Tiraje limitado.',

  // URL pública del sitio (sin barra final). Usada en metadata, sitemap y OG.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://focus3d.art',
  locale: 'es_MX',
  country: 'México',

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@focus3d.art',
    // Teléfono visible (formato libre).
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+52 1 (XX) XXXX-XXXX',
    // WhatsApp en formato internacional, SOLO dígitos (ej. 5216671234567).
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '521XXXXXXXXXX',
    responseTime: 'Menos de 2 horas en horario hábil',
    shipping: 'Todo México · 3–7 días hábiles',
  },

  social: {
    instagram: {
      handle: '@focus3d.art',
      url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/focus3d.art',
    },
    mercadoLibre: {
      label: 'Focus 3D — Tienda Oficial',
      url: process.env.NEXT_PUBLIC_MERCADOLIBRE_URL || 'https://www.mercadolibre.com.mx',
    },
  },
} as const

// Arma un enlace de WhatsApp con un mensaje opcional prellenado.
// Usa el dominio wa.me y deja solo dígitos en el número (evita el "not_found" de WhatsApp).
export function whatsappLink(message?: string): string {
  const num = siteConfig.contact.whatsappNumber.replace(/\D/g, '')
  const base = `https://wa.me/${num}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
