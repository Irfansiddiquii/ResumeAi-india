import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep these heavy / Node-only libs out of the bundle so they run correctly
  // in the Node.js runtime of API route handlers on Vercel.
  serverExternalPackages: ["pdf-parse", "mammoth", "@react-pdf/renderer"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: {
    // Lint is run as a separate step; don't block production builds on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
