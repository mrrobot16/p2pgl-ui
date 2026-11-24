import type { NextConfig } from "next";

// A static export: no server routes, no middleware. Every page runs in the
// browser and calls gl-node directly (docs/plan.md, Architecture).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false
};

export default nextConfig;
