import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.bria-api.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'engine.prod.bria-api.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.bria.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bria-temp-files.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
