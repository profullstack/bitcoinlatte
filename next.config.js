const withPWA = require("next-pwa");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qtirhfpjggnkybxugxkv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Disable image optimization cache
    unoptimized: process.env.DISABLE_CACHE === 'true',
  },
  // Disable static page generation cache
  experimental: {
    isrMemoryCacheSize: 0, // Disable ISR cache
  },
};

module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
