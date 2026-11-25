import { expect, test, type Page } from "@playwright/test";
import { createCompanyOnNode, readStoredCompanies, seedCompanies, uniqueLedgerName, type TestCompany } from "@tests/e2e/companies";
import { runningGlNode } from "@tests/e2e/settings";

// Companies and sign-in (docs/parity/companies.md), against the real node.

async function fillSignIn(page: Page, values: { nodeUrl: string; ledgerName: string; key: string }) {
  await page.getByLabel("Node URL").fill(values.nodeUrl);
  await page.getByLabel("Company").fill(values.ledgerName);
  await page.getByLabel("Key").fill(values.key);
  await page.getByRole("button", { name: "Sign in" }).click();
}

function companyPickerButton(page: Page) {
  return page.locator("header.top-header").getByRole("button", { name: /./ }).first();
}

test.describe("sign-in", () => {
  test("a page with no company goes to sign-in", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByText("Sign in to your books.")).toBeVisible();
  });

  test("a person's key signs in to the company", async ({ page }) => {
    const company = await createCompanyOnNode({ role: "READ" });
    await page.goto("/sign-in");
    await fillSignIn(page, company);
    await expect(page).toHaveURL(/\/$/);
    await expect(companyPickerButton(page)).toHaveText(company.ledgerName);
    await expect(page.getByRole("button", { name: "Account" })).toContainText(company.ledgerName);

    const stored = await readStoredCompanies(page);
    expect(stored?.companies.map((entry) => entry.ledgerName)).toEqual([company.ledgerName]);
  });

  test("a wrong key, or a company the node doesn't serve, is refused alike", async ({ page }) => {
    const company = await createCompanyOnNode();
    await page.goto("/sign-in");
    await fillSignIn(page, { ...company, key: "not-the-key-0123456789" });
    await expect(page.getByText("That key isn't accepted for this company.")).toBeVisible();

    await fillSignIn(page, { ...company, ledgerName: uniqueLedgerName("missing") });
    await expect(page.getByText("That key isn't accepted for this company.")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
    expect(await readStoredCompanies(page)).toBeNull();
  });

  test("a node that doesn't answer is named, with the CORS hint", async ({ page }) => {
    await page.goto("/sign-in");
    await fillSignIn(page, { nodeUrl: "http://127.0.0.1:9", ledgerName: "acme", key: "some-key" });
    await expect(page.getByText(/Can't reach http:\/\/127\.0\.0\.1:9\..*cors\.allowedOrigins includes http:\/\/localhost:3000/)).toBeVisible();
  });

  test("bad input is caught before anything is sent", async ({ page }) => {
    await page.goto("/sign-in");
    await fillSignIn(page, { nodeUrl: "ledger.example.com", ledgerName: "Acme Corp", key: "" });
    await expect(page.getByText("Enter a full address, starting with https:// or http://.")).toBeVisible();
    await expect(page.getByText("Use 1 to 40 lowercase letters, digits and hyphens.")).toBeVisible();
    await expect(page.getByText("Enter the key.")).toBeVisible();
  });

  test("the node and company can be filled in from the address, never the key", async ({ page }) => {
    await page.goto("/sign-in?node=https%3A%2F%2Fledger.example.com&company=acme");
    await expect(page.getByLabel("Node URL")).toHaveValue("https://ledger.example.com");
    await expect(page.getByLabel("Company")).toHaveValue("acme");
    await expect(page.getByLabel("Key")).toHaveValue("");
  });
});

test.describe("creating a company", () => {
  test("the operator key creates it, its creator gets their own key, and the operator key is kept nowhere", async ({ page }) => {
    const node = runningGlNode();
    const ledgerName = uniqueLedgerName("made");
    await page.goto("/create-company");
    await expect(page.getByRole("heading", { name: "Create your company" })).toBeVisible();
    await page.getByLabel("Node URL").fill(node.url);
    await page.getByLabel("Company name").fill(ledgerName);
    await page.getByLabel("Your name").fill("Ana Ruiz");
    await page.getByLabel("Operator key").fill(node.operatorKey);
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(companyPickerButton(page)).toHaveText(ledgerName);
    const stored = await readStoredCompanies(page);
    expect(stored?.companies[0].ledgerName).toBe(ledgerName);
    expect(stored?.companies[0].apiKey).not.toBe(node.operatorKey);
    const everything = await page.evaluate(() => JSON.stringify({ ...window.sessionStorage, ...window.localStorage }));
    expect(everything).not.toContain(node.operatorKey);
  });

  test("an existing name and a wrong operator key are refused", async ({ page }) => {
    const node = runningGlNode();
    const existing = await createCompanyOnNode();
    await page.goto("/create-company");
    await page.getByLabel("Node URL").fill(node.url);
    await page.getByLabel("Company name").fill(existing.ledgerName);
    await page.getByLabel("Your name").fill("Ana Ruiz");
    await page.getByLabel("Operator key").fill(node.operatorKey);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("A company with that name already exists on this node.")).toBeVisible();

    await page.getByLabel("Company name").fill(uniqueLedgerName("made"));
    await page.getByLabel("Operator key").fill("not-the-operator-key-0123456789");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText("That isn't this node's operator key.")).toBeVisible();
  });
});

test.describe("the company picker", () => {
  let first: TestCompany;
  let second: TestCompany;

  test.beforeAll(async () => {
    first = await createCompanyOnNode();
    second = await createCompanyOnNode();
  });

  test("lists this tab's companies and switches between them", async ({ page }) => {
    await seedCompanies(page, [first, second]);
    await page.goto("/");
    await expect(companyPickerButton(page)).toHaveText(first.ledgerName);

    await companyPickerButton(page).click();
    const menu = page.getByRole("menu", { name: "Companies" });
    await expect(menu.getByRole("menuitemradio")).toHaveText([first.ledgerName, second.ledgerName]);
    await expect(menu.getByRole("menuitemradio", { name: first.ledgerName })).toHaveAttribute("aria-checked", "true");

    // Switching reloads the page under the other company.
    await Promise.all([page.waitForEvent("load"), menu.getByRole("menuitemradio", { name: second.ledgerName }).click()]);
    await expect(companyPickerButton(page)).toHaveText(second.ledgerName);
    const stored = await readStoredCompanies(page);
    expect(stored?.activeIdentifier).toBe(`${second.nodeUrl}|${second.ledgerName}`);
  });

  test("adds a company with a key from inside the menu", async ({ page }) => {
    await seedCompanies(page, [first]);
    await page.goto("/");
    await companyPickerButton(page).click();
    await page.getByRole("menuitem", { name: "New company" }).click();
    const menu = page.getByRole("menu", { name: "Companies" });
    await expect(menu.getByLabel("Node URL")).toHaveValue(first.nodeUrl);
    await menu.getByLabel("Company", { exact: true }).fill(second.ledgerName);
    await menu.getByLabel("Key").fill(second.key);
    // Adding makes it active and reloads the page under it.
    await Promise.all([page.waitForEvent("load"), menu.getByRole("button", { name: "Add" }).click()]);

    await expect(companyPickerButton(page)).toHaveText(second.ledgerName);
    expect((await readStoredCompanies(page))?.companies.map((entry) => entry.ledgerName)).toEqual([first.ledgerName, second.ledgerName]);
  });

  test("forgetting a company asks first, then removes it from this browser only", async ({ page }) => {
    await seedCompanies(page, [first, second]);
    await page.goto("/");
    await companyPickerButton(page).click();
    await page.getByRole("button", { name: `Remove ${second.ledgerName} from this browser` }).click();
    await expect(page.getByRole("menu", { name: "Companies" }).locator("p")).toHaveText(
      `Remove ${second.ledgerName} from this browser? It stays on its node; you'll need its key to add it again.`
    );
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("menuitemradio")).toHaveCount(2);

    await page.getByRole("button", { name: `Remove ${second.ledgerName} from this browser` }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page.getByRole("menuitemradio")).toHaveText([first.ledgerName]);
    await expect(companyPickerButton(page)).toHaveText(first.ledgerName);
  });

  test("forgetting the active company moves to the next; forgetting the last goes to sign-in", async ({ page }) => {
    await seedCompanies(page, [first, second]);
    await page.goto("/");
    await companyPickerButton(page).click();
    await page.getByRole("button", { name: `Remove ${first.ledgerName} from this browser` }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(companyPickerButton(page)).toHaveText(second.ledgerName);

    await companyPickerButton(page).click();
    await page.getByRole("button", { name: `Remove ${second.ledgerName} from this browser` }).click();
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("each tab keeps its own companies", async ({ page, context }) => {
    await seedCompanies(page, [first]);
    await page.goto("/");
    await expect(companyPickerButton(page)).toHaveText(first.ledgerName);

    const otherTab = await context.newPage();
    await otherTab.goto("/sign-in");
    await fillSignIn(otherTab, second);
    await expect(companyPickerButton(otherTab)).toHaveText(second.ledgerName);

    await page.reload();
    await expect(companyPickerButton(page)).toHaveText(first.ledgerName);
    expect((await readStoredCompanies(page))?.companies).toHaveLength(1);
  });
});

test("signing out forgets every company and key in the tab", async ({ page }) => {
  const company = await createCompanyOnNode();
  await seedCompanies(page, [company]);
  await page.goto("/");
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(await readStoredCompanies(page)).toBeNull();

  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
});
