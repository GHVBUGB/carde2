/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'xsgames.co',
      'cdn.remove.bg'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
