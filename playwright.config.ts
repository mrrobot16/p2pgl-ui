import { defineConfig, devices } from "@playwright/test";
import { APP_ORIGIN, APP_PORT } from "@tests/e2e/settings";

// End-to-end tests run the static export against a real gl-node, which the
// global setup starts (tests/e2e/gl-node-harness.ts). `bun run build` must
// have produced `out/` first; the web server below only serves it.
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "tests/e2e/global-setup.ts",
  use: {
    baseURL: APP_ORIGIN,
    trace: "retain-on-failure"
  },
  webServer: {
    command: "bun tests/e2e/static-server.ts",
    url: APP_ORIGIN,
    env: { PORT: String(APP_PORT) },
    reuseExistingServer: false,
    timeout: 30_000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
