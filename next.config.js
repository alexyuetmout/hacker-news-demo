/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['postgres'],
  },
  images: {
    domains: ['github.com'],
  },
}

module.exports = nextConfig 