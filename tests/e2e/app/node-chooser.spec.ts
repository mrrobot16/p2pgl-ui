import { expect, test, type Page } from "@playwright/test";

import { LEDGER_LOCAL_NODE, LEDGER_ROGUEONE_NODE, LEDGER_TWO_NODE } from "@/lib/environment/default-nodes";
import { ENVIRONMENT_SETTINGS } from "@/lib/environment/environment-settings";

// The node chooser on sign-in and create company (docs/parity/companies.md).
// The exported app is built with APP_ENV=development (.env), so it offers
// development's nodes. Nothing here contacts those nodes.

const OFFERED = ENVIRONMENT_SETTINGS.development.defaultNodes;

function nodeField(page: Page) {
  return page.getByLabel("Node URL");
}

async function openList(page: Page) {
  await page.getByRole("button", { name: "Toggle options list" }).click();
  return page.getByRole("listbox");
}

test("sign-in offers this environment's nodes, the first one chosen", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(nodeField(page)).toHaveValue(LEDGER_LOCAL_NODE.label);
  await expect(page.getByText(`${LEDGER_LOCAL_NODE.url}, or type another node's address.`)).toBeVisible();

  const list = await openList(page);
  const options = list.getByRole("option");
  await expect(options).toHaveCount(OFFERED.length);
  for (const [position, node] of OFFERED.entries()) {
    await expect(options.nth(position)).toContainText(node.label);
    await expect(options.nth(position)).toContainText(new URL(node.url).host);
  }
  await expect(list.getByRole("option", { name: new RegExp(`^${LEDGER_LOCAL_NODE.label}`) })).toHaveAttribute("aria-selected", "true");
});

test("choosing another node shows its name, with its address below", async ({ page }) => {
  await page.goto("/sign-in");
  const list = await openList(page);
  await list.getByRole("option", { name: new RegExp(`^${LEDGER_TWO_NODE.label}`) }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(nodeField(page)).toHaveValue(LEDGER_TWO_NODE.label);
  await expect(page.getByText(`${LEDGER_TWO_NODE.url}, or type another node's address.`)).toBeVisible();
});

test("typing replaces the chosen node with your own address", async ({ page }) => {
  await page.goto("/sign-in");
  // Clicking into the field selects the chosen node's name, so typing replaces it.
  await nodeField(page).click();
  await page.keyboard.type("https://ledger.example.com");
  await expect(nodeField(page)).toHaveValue("https://ledger.example.com");
  // No node matches what was typed, so the list gets out of the way.
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.getByText("Choose a node from the list, or type its address.")).toBeVisible();
});

test("typing narrows the list to the nodes that match", async ({ page }) => {
  await page.goto("/sign-in");
  await nodeField(page).click();
  await page.keyboard.type("rogue");
  const options = page.getByRole("listbox").getByRole("option");
  await expect(options).toHaveCount(1);
  await options.first().click();
  await expect(nodeField(page)).toHaveValue(LEDGER_ROGUEONE_NODE.label);
});

test("moving on to the next field closes the list", async ({ page }) => {
  await page.goto("/sign-in");
  await nodeField(page).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(nodeField(page)).toHaveValue(LEDGER_LOCAL_NODE.label);
});

test("a node in the link wins over the default", async ({ page }) => {
  await page.goto(`/sign-in?node=${encodeURIComponent(LEDGER_TWO_NODE.url)}&company=acme`);
  await expect(nodeField(page)).toHaveValue(LEDGER_TWO_NODE.label);
});

test("create company offers the same nodes", async ({ page }) => {
  await page.goto("/create-company");
  await expect(nodeField(page)).toHaveValue(LEDGER_LOCAL_NODE.label);
  const list = await openList(page);
  await expect(list.getByRole("option")).toHaveCount(OFFERED.length);
});
