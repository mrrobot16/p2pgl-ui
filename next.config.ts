import type { NextConfig } from "next";

// Bun only (CLAUDE.md, Tooling): `next dev` and `next build` read this file
// first, so a start that didn't come through Bun (`npm run build`, `npx next
// dev`) stops here. Bun names itself in npm_config_user_agent; the same
// check guards installs in scripts/require-bun.mjs.
if (!(process.env.npm_config_user_agent ?? "").startsWith("bun/")) {
  throw new Error("This project uses Bun only: run `bun run dev` or `bun run build` (npm, npx, yarn and pnpm are refused).");
}

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
