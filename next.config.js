/** @type {import('next').NextConfig} */
const nextConfig = {
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
