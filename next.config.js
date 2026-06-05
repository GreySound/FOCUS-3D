/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite que el servidor de desarrollo acepte peticiones desde otros equipos
  // de tu red local (p. ej. tu celular en el mismo Wi-Fi: http://192.168.x.x:3000).
  // Sin esto, Next.js 16 bloquea las Server Actions de origen distinto a localhost
  // y formularios como el del cupón o la cotización fallan. Solo aplica en desarrollo.
  // Si tu IP local no coincide con estos patrones, añádela aquí (ej. '192.168.39.149').
  allowedDevOrigins: ['192.168.39.149', '192.168.*.*', '10.*.*.*', '172.16.*.*'],
  images: {
    // Sirve imágenes en formatos modernos y ligeros (mejor compresión).
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
