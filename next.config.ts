import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during builds (Vercel won’t block deployment)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
