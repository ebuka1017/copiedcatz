import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow all external images - required for user-uploaded content and AI-generated images
    unoptimized: false,
    remotePatterns: [
      // Supabase storage - specific project
      {
        protocol: 'https',
        hostname: 'zljkcihttlwnvriycokw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Supabase storage - wildcard for any project
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Bria API endpoints
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
      // Bria temp files on S3
      {
        protocol: 'https',
        hostname: 'bria-temp-files.s3.amazonaws.com',
        pathname: '/**',
      },
      // Generic AWS S3 buckets
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      // Bria CDN/other endpoints
      {
        protocol: 'https',
        hostname: '**.bria-api.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
