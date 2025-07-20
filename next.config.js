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
}

module.exports = nextConfig
