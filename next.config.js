/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n,
  // Configure to allow images from various sources
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
}

module.exports = nextConfig
