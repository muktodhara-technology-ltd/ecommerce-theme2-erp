import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/reviva", destination: "/revitalization", permanent: true }];
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
