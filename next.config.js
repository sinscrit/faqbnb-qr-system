const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Get version info at build time
// Version format: 0.X where X = number of commits since v0fea415 (base version)
const { execSync } = require('child_process');
const BASE_COMMIT = '0fea415';
let appVersion = '0.0';
let gitCommitHash = 'unknown';
let gitCommitDate = 'unknown';
try {
  gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim();
  gitCommitDate = execSync('git log -1 --format=%ci').toString().trim().split(' ')[0];
  // Count commits since base version
  const commitCount = execSync(`git rev-list --count ${BASE_COMMIT}..HEAD`).toString().trim();
  appVersion = `0.${commitCount}`;
} catch (e) {
  console.warn('Could not get git info:', e.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Inject version info at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_GIT_COMMIT: gitCommitHash,
    NEXT_PUBLIC_BUILD_DATE: gitCommitDate,
  },
  // Remove static export for development
  // output: 'export',
  images: {
    unoptimized: true
  },
  // Disable ESLint during builds for Railway deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds for Railway deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable server-side features
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "127.0.0.1:3000",
        // Allow Railway domains dynamically
        ...(process.env.RAILWAY_PUBLIC_DOMAIN ? [process.env.RAILWAY_PUBLIC_DOMAIN] : []),
        // Note: Railway domains will be handled by the RAILWAY_PUBLIC_DOMAIN env var
      ]
    }
  },
  // Configure webpack to handle PDFKit properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark PDFKit as external for server-side rendering
      config.externals = [...(config.externals || []), 'pdfkit'];
    }
    
    // Handle PDFKit's font files and dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },

  // Configure page routes
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/print/qr-codes/:propertyId',
        destination: '/print/qr-codes/[propertyId]',
        has: [
          {
            type: 'query',
            key: 'data',
          },
        ],
      },
    ];
  }
  // Font preloading headers temporarily disabled to prevent Google Fonts 404 errors causing flickering overlay
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Link',
  //           value: '<https://fonts.googleapis.com>; rel=preconnect; crossorigin',
  //         },
  //         {
  //           key: 'Link',
  //           value: '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
  //         },
  //       ],
  //     },
  //   ];
  // },
}

module.exports = withBundleAnalyzer(nextConfig)
