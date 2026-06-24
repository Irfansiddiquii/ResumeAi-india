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
  async headers() {
    // Baseline security headers applied to every route.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
