import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/catalogo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Una URL por producto (lectura pública del catálogo).
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from('productos').select('id, updated_at')
    productRoutes = (data ?? []).map(p => ({
      url: `${base}/producto/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Si la consulta falla, al menos devolvemos las rutas estáticas.
  }

  return [...staticRoutes, ...productRoutes]
}
