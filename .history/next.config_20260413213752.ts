import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Gzip compression for responses
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nchvuilqifremlohuvva.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    // Use AVIF first for better compression, fallback to WebP
    formats: ['image/avif', 'image/webp'],
    // Mobile-first breakpoints — prevents downloading desktop-sized images on phones
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    // Thumbnail/avatar sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Minimize layout shift — always include width/height in srcsets
    minimumCacheTTL: 86400,
  },

  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  experimental: {
    // Optimize heavy package imports — tree-shake to only used icons/components
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'react-markdown',
    ],
    // Client-side router cache — reduce redundant fetches on navigation
    staleTimes: {
      dynamic: 30, // Cache dynamic pages for 30s on client
      static: 180, // Cache static pages for 3min on client
    },
  },

  // Custom headers for caching static assets
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/team/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
