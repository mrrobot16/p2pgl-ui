import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { startedByBun } from "@scripts/require-bun.mjs";

const repositoryRoot = join(import.meta.dir, "..");

describe("startedByBun", () => {
  test("accepts Bun's user agent", () => {
    expect(startedByBun("bun/1.3.14 npm/? node/v24.3.0 darwin arm64")).toBe(true);
  });

  test("refuses npm, yarn, pnpm and a missing agent", () => {
    expect(startedByBun("npm/11.16.0 node/v24.18.0 darwin arm64 workspaces/false")).toBe(false);
    expect(startedByBun("yarn/1.22.22 npm/? node/v24.18.0 darwin arm64")).toBe(false);
    expect(startedByBun("pnpm/10.0.0 npm/? node/v24.18.0 darwin arm64")).toBe(false);
    expect(startedByBun("")).toBe(false);
  });
});

describe("the repository is Bun's", () => {
  test("bun.lock is the only lockfile", () => {
    expect(existsSync(join(repositoryRoot, "bun.lock"))).toBe(true);
    for (const foreignLockfile of ["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml"]) {
      expect(existsSync(join(repositoryRoot, foreignLockfile)), `${foreignLockfile} must not exist`).toBe(false);
    }
  });

  test("installs refuse anything but Bun, and Vercel uses Bun", () => {
    const packageJson = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8")) as { scripts: Record<string, string>; packageManager: string };
    expect(packageJson.scripts.preinstall).toBe("node scripts/require-bun.mjs");
    expect(packageJson.packageManager).toStartWith("bun@");
    const vercel = JSON.parse(readFileSync(join(repositoryRoot, "vercel.json"), "utf8")) as { installCommand: string; buildCommand: string };
    expect(vercel.installCommand).toBe("bun install");
    expect(vercel.buildCommand).toBe("bun run build");
  });
});
