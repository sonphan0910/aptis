/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Only use rewrites for local development
  async rewrites() {
    // In production, don't use rewrites - call API directly
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'APTIS Admin & Teacher',
  },
}

module.exports = nextConfig