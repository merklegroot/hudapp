import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // External packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
