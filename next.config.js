/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export in production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  basePath: process.env.NODE_ENV === 'production' ? '/explore' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/explore' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

