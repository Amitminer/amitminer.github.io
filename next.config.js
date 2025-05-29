/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: false },
  optimizeFonts: true,
  reactStrictMode: true,
  swcMinify: true
};

module.exports = nextConfig;
