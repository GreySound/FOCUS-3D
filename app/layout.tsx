import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Focus 3D — Arte Escultórico', template: '%s | Focus 3D' },
  description: 'Piezas escultóricas únicas de impresión 3D con acabados de galería. Mármol, piedra, obsidiana. Tiraje limitado.',
  keywords: ['arte 3d', 'decoración', 'escultura', 'impresión 3d', 'mármol', 'minimalista'],
  openGraph: {
    title: 'Focus 3D — Arte Escultórico',
    description: 'Arte impreso que domina el espacio.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#111110',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-carbon text-pearl antialiased">{children}</body>
    </html>
  )
}
