/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for development
  // output: 'export',
  images: {
    unoptimized: true
  },
  // Enable server-side features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"]
    }
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
