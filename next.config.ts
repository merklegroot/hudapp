import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    // Enable server components logging
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
