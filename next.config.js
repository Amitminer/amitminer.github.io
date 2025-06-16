/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    unoptimized: true,
    remotePatterns: [],
  },

  // Development + production options
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
