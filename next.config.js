/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Optimizaciones de producción
  compress: true,

  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_APP_NAME: 'Green Tycoon',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
