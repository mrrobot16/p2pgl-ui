import type { NextConfig } from "next";

// A static export: no server routes, no middleware. Every page runs in the
// browser and calls gl-node directly (docs/plan.md, Architecture).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  // The React Compiler memoizes components when the app is built, so big
  // screens (reports, the register) don't redraw what didn't change. It
  // costs some build time (docs/plan.md, Performance). A component that
  // misbehaves under it opts out with the "use no memo" directive.
  reactCompiler: true,
  devIndicators: false
};

export default nextConfig;
