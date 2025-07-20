/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for development
  // output: 'export',
  images: {
    unoptimized: true
  },
  // Enable server-side features
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig
