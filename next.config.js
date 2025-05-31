/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure to allow images from various sources
  images: {
    domains: ['firebasestorage.googleapis.com', 'placehold.co'],
  },
}

module.exports = nextConfig
