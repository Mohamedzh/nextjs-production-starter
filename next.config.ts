import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for optimized Docker builds (~150MB vs 1GB+)
  output: 'standalone',

  // Image optimization configuration
  images: {
    // Aggressive browser caching (1 year)
    minimumCacheTTL: 31536000,
    
    // Allow images from common CDNs and OAuth providers
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Production-grade security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent DNS prefetch for third-party domains
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Enforce HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Content Security Policy
          // PERMISSIVE configuration - suitable for OAuth and third-party services
          // Tighten these directives for production based on your needs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://github.com https://accounts.google.com https://discord.com",
              "frame-src 'self' https://github.com https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://github.com https://accounts.google.com",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redis-backed ISR cache handler (only in production)
  ...(process.env.NODE_ENV === 'production' &&
    process.env.REDIS_URL && {
      cacheHandler: require.resolve('./cache-handler.mjs'),
      cacheMaxMemorySize: 0, // Disable in-memory caching when using Redis
    }),
};

export default nextConfig;
