import { defineConfig, devices } from "@playwright/test";
import { APP_ORIGIN, APP_PORT, KIT_ORIGIN, KIT_PORT } from "@tests/e2e/settings";

// Two projects:
// - "app": the static export, as it ships, against a real gl-node that the
//   global setup starts (tests/e2e/gl-node-harness.ts). Run `bun run build`
//   first; the web server only serves `out/`.
// - "kit": the development-only UI kit page under `next dev`, for the shell
//   and components that no built screen shows yet (the rail's flyout, the
//   All apps sub menu, overlays).
export default defineConfig({
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "tests/e2e/global-setup.ts",
  use: {
    trace: "retain-on-failure"
  },
  webServer: [
    {
      command: "bun tests/e2e/static-server.ts",
      url: APP_ORIGIN,
      env: { PORT: String(APP_PORT) },
      reuseExistingServer: false,
      timeout: 30_000
    },
    {
      command: `bunx next dev --port ${KIT_PORT}`,
      url: `${KIT_ORIGIN}/dev/ui-kit`,
      reuseExistingServer: false,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: "app",
      testDir: "tests/e2e/app",
      use: { ...devices["Desktop Chrome"], baseURL: APP_ORIGIN }
    },
    {
      name: "kit",
      testDir: "tests/e2e/kit",
      use: { ...devices["Desktop Chrome"], baseURL: KIT_ORIGIN }
    }
  ]
});
