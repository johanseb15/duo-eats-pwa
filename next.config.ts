
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://apis.google.com;
  child-src 'self' https://google.com https://www.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://placehold.co https://firebasestorage.googleapis.com;
  font-src 'self' data:;
  connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com wss://firestore.googleapis.com https://maps.googleapis.com;
  frame-src 'self' https://duo-eats.firebaseapp.com;
`;

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
   async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
           {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only packages from client-side bundle
      config.externals.push(
        '@opentelemetry/exporter-jaeger',
        '@opentelemetry/exporter-zipkin',
        '@genkit-ai/firebase'
      );
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
