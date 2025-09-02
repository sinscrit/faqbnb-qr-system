/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig
