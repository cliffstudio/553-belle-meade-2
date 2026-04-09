import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for Sanity vendor chunks issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Fix for React 19 useMemoCache issues
    config.resolve.symlinks = false;
    
    return config;
  },
  // External packages for server components
  serverExternalPackages: ['sanity'],
  // Experimental features for React 19 compatibility
  experimental: {
    reactCompiler: false,
  },
};

export default nextConfig;
