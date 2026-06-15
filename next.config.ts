import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Demo'da local görseller; canlıda Firebase Storage domaini buraya eklenecek
    remotePatterns: [],
  },
};

export default nextConfig;
