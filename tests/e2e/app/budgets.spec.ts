import { expect, test, type Locator, type Page } from "@playwright/test";

import { createCompanyOnNode, seedCompanies, type TestCompany } from "@tests/e2e/companies";
import { runningGlNode } from "@tests/e2e/settings";

// The performance budgets (the performance skill, section 6), per screen:
// - at most one request to gl-node when the screen opens (no waterfalls);
// - its content shows within LOAD_BUDGET_MILLISECONDS;
// - LCP (the largest content painted) within LCP_BUDGET_MILLISECONDS;
// - CLS (how much the layout jumps while loading) within CLS_BUDGET.
// The time limits are loose on purpose: a busy machine must not fail them,
// a screen that got several times slower must. Every new screen is added
// to SCREENS; from step 4 the data screens open on a large test ledger.

const LOAD_BUDGET_MILLISECONDS = 2000;
const LCP_BUDGET_MILLISECONDS = 1500;
const CLS_BUDGET = 0.05;

type Screen = {
  name: string;
  path: string;
  signedIn: boolean;
  /** Visible once the screen shows its content. */
  ready: (page: Page) => Locator;
  maximumGlNodeRequests: number;
};

const SCREENS: Screen[] = [
  { name: "sign-in", path: "/sign-in", signedIn: false, ready: (page) => page.getByRole("heading", { name: "Welcome back" }), maximumGlNodeRequests: 0 },
  {
    name: "create a company",
    path: "/create-company",
    signedIn: false,
    ready: (page) => page.getByRole("heading", { name: "Create your company" }),
    maximumGlNodeRequests: 0
  },
  {
    name: "the signed-in shell",
    path: "/",
    signedIn: true,
    ready: (page) => page.getByRole("button", { name: "Choose theme" }),
    maximumGlNodeRequests: 1
  }
];

type PaintMeasures = { largestContentfulPaint: number; cumulativeLayoutShift: number };

/** Collects LCP and CLS from the first moment of every page. */
async function observePaint(page: Page) {
  await page.addInitScript(() => {
    const measures = { largestContentfulPaint: 0, cumulativeLayoutShift: 0 };
    (window as unknown as { budgetMeasures: typeof measures }).budgetMeasures = measures;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) measures.largestContentfulPaint = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) measures.cumulativeLayoutShift += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

let company: TestCompany;

test.beforeAll(async () => {
  company = await createCompanyOnNode({ role: "READ" });
});

for (const screen of SCREENS) {
  test(`${screen.name} stays within its budgets`, async ({ page }, testInfo) => {
    if (screen.signedIn) await seedCompanies(page, [company]);
    await observePaint(page);

    const node = runningGlNode();
    const glNodeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith(node.url) && request.method() !== "OPTIONS") glNodeRequests.push(request.url());
    });

    const started = Date.now();
    await page.goto(screen.path);
    await expect(screen.ready(page)).toBeVisible();
    const loadMilliseconds = Date.now() - started;
    await page.waitForLoadState("networkidle");

    const measures = await page.evaluate(() => (window as unknown as { budgetMeasures: PaintMeasures }).budgetMeasures);
    testInfo.annotations.push({
      type: "budget",
      description: `load ${loadMilliseconds} ms, LCP ${Math.round(measures.largestContentfulPaint)} ms, CLS ${measures.cumulativeLayoutShift.toFixed(3)}, ${glNodeRequests.length} gl-node request(s)`
    });

    expect(glNodeRequests.length, `requests to gl-node: ${glNodeRequests.join(", ")}`).toBeLessThanOrEqual(screen.maximumGlNodeRequests);
    expect(loadMilliseconds, "time until the content shows").toBeLessThanOrEqual(LOAD_BUDGET_MILLISECONDS);
    expect(measures.largestContentfulPaint, "largest contentful paint").toBeLessThanOrEqual(LCP_BUDGET_MILLISECONDS);
    expect(measures.cumulativeLayoutShift, "cumulative layout shift").toBeLessThanOrEqual(CLS_BUDGET);
  });
}
