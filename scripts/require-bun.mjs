// This project is installed, run and built with Bun only (CLAUDE.md,
// Tooling). Bun, npm, yarn and pnpm each name themselves to the scripts
// they start in npm_config_user_agent ("bun/1.3.14 npm/? node/…" under
// Bun); anything but Bun is refused here.
//
// Plain JavaScript with only Node built-ins, so it runs under Node too: `npm
// install` runs it with Node, and must be told to use Bun.

import { pathToFileURL } from "node:url";

export const BUN_ONLY_MESSAGE = [
  "This project uses Bun only.",
  "  Install:  bun install",
  "  Develop:  bun run dev",
  "  Build:    bun run build",
  "  Test:     bun run test, bun run test:e2e",
  "(npm, npx, yarn and pnpm are refused.)"
].join("\n");

/** Whether the command that started this process came through Bun. */
export function startedByBun(userAgent = process.env.npm_config_user_agent ?? "") {
  return userAgent.startsWith("bun/");
}

// Run directly (the preinstall script): stop the install unless it is Bun's.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!startedByBun()) {
    console.error(`\n${BUN_ONLY_MESSAGE}\n`);
    process.exit(1);
  }
}
