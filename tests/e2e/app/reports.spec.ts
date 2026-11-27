import { expect, test, type Locator, type Page } from "@playwright/test";
import Big from "big.js";

import { seedCompanies, type TestCompany } from "@tests/e2e/companies";
import { seededCompany } from "@tests/e2e/seeded-books";

// The Trial Balance against the small seeded company (its figures are in
// tests/e2e/seeded-books.ts). Every total on screen is checked against
// gl-node's own answer for the same date.

async function askNode(company: TestCompany, at: string): Promise<{ totalDebit: string; totalCredit: string }> {
  const response = await fetch(`${company.nodeUrl}/ledgers/${company.ledgerName}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": company.key },
    body: JSON.stringify({ query: "query($at: Date!) { trialBalance(at: $at) { totalDebit totalCredit } }", variables: { at } })
  });
  const body = (await response.json()) as { data: { trialBalance: { totalDebit: string; totalCredit: string } } };
  return body.data.trialBalance;
}

/** A table row by the text in its first cell, its cells' text after it. */
async function rowCells(table: Locator, label: string): Promise<string[]> {
  const row = table.getByRole("row").filter({ has: table.page().getByRole("cell", { name: label, exact: true }) });
  await expect(row).toHaveCount(1);
  return (await row.getByRole("cell").allInnerTexts()).map((text) => text.trim());
}

/** Turns `1,590.75` back into a decimal for adding up in the test. */
function decimalOf(text: string): Big {
  return new Big(text.replaceAll(",", "") || "0");
}

async function openTrialBalance(page: Page, query = ""): Promise<Locator> {
  await seedCompanies(page, [seededCompany("small")]);
  await page.goto(`/reports/trial-balance${query}`);
  const table = page.getByRole("table");
  await expect(table.getByRole("row").filter({ hasText: /^Total\b/ }).last()).toBeVisible();
  return table;
}

test("the rail's Reports goes to Standard Reports, which lists the Trial Balance", async ({ page }) => {
  await seedCompanies(page, [seededCompany("small")]);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Reports" }).click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByRole("heading", { name: "Standard Reports" })).toBeVisible();
  await page.getByRole("link", { name: "Trial Balance" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Trial Balance" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Reports" })).toHaveAttribute("aria-current", "page");
});

test("the trial balance shows each account, nested, with section and parent totals", async ({ page }) => {
  const table = await openTrialBalance(page);
  await expect(page.getByRole("heading", { level: 2, name: "Trial Balance" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Trial Balance" }).getByText("seeded-small", { exact: true })).toBeVisible();

  expect(await table.getByRole("columnheader").allInnerTexts()).toEqual(["Account", "Debit", "Credit"]);
  // Assets:Bank has a row of its own, shown on its heading, and Checking under it.
  expect(await rowCells(table, "Bank")).toEqual(["Bank", "250.50", "0.00"]);
  expect(await rowCells(table, "Checking")).toEqual(["Checking", "800.00", "0.00"]);
  expect(await rowCells(table, "Total for Bank")).toEqual(["Total for Bank", "1,050.50", "0.00"]);
  expect(await rowCells(table, "Total for Assets")).toEqual(["Total for Assets", "1,050.50", "0.00"]);
  // Expenses:Office has no row: a heading with nothing on it, and its total.
  expect(await rowCells(table, "Office")).toEqual(["Office", "", ""]);
  expect(await rowCells(table, "Total for Office")).toEqual(["Total for Office", "540.25", "0.00"]);
  expect(await rowCells(table, "Total for Income")).toEqual(["Total for Income", "0.00", "550.50"]);
  expect(await rowCells(table, "Total for Liabilities")).toEqual(["Total for Liabilities", "0.00", "40.25"]);
  expect(await rowCells(table, "Total for Equity")).toEqual(["Total for Equity", "0.00", "1,000.00"]);
  expect(await rowCells(table, "Total")).toEqual(["Total", "1,590.75", "1,590.75"]);
  // gl-node names no currency for the trial balance, so no sign is shown.
  await expect(table).not.toContainText("$");
  await expect(page.getByText(/^Accrual basis/)).toBeVisible();
});

test("the sections add up to gl-node's own totals, and the bottom row is gl-node's", async ({ page }) => {
  const table = await openTrialBalance(page);
  const node = await askNode(seededCompany("small"), new Date().toISOString().slice(0, 10));
  let debit = new Big(0);
  let credit = new Big(0);
  for (const section of ["Assets", "Liabilities", "Equity", "Income", "Expenses"]) {
    const [, sectionDebit, sectionCredit] = await rowCells(table, `Total for ${section}`);
    debit = debit.plus(decimalOf(sectionDebit));
    credit = credit.plus(decimalOf(sectionCredit));
  }
  expect(debit.eq(node.totalDebit)).toBe(true);
  expect(credit.eq(node.totalCredit)).toBe(true);
  const [, bottomDebit, bottomCredit] = await rowCells(table, "Total");
  expect(decimalOf(bottomDebit).eq(node.totalDebit)).toBe(true);
  expect(decimalOf(bottomCredit).eq(node.totalCredit)).toBe(true);
});

test("the date is in the address: a later date takes in a later entry, and survives a reload", async ({ page }) => {
  const table = await openTrialBalance(page, "?asOf=2099-12-31");
  await expect(page.getByLabel("As of")).toHaveValue("2099-12-31");
  await expect(page.getByText("As of 2099-12-31", { exact: true })).toBeVisible();
  expect(await rowCells(table, "Supplies")).toEqual(["Supplies", "60.00", "0.00"]);
  expect(await rowCells(table, "Total")).toEqual(["Total", "1,610.50", "1,610.50"]);

  await page.getByLabel("As of").fill("2026-02-28");
  await expect(page).toHaveURL(/asOf=2026-02-28/);
  await expect.poll(() => rowCells(table, "Total")).toEqual(["Total", "1,290.75", "1,290.75"]);
  await page.reload();
  await expect(page.getByLabel("As of")).toHaveValue("2026-02-28");
  await expect.poll(() => rowCells(table, "Total")).toEqual(["Total", "1,290.75", "1,290.75"]);
});

test("a collapsed section shows its total on its heading; Collapse all and Expand all", async ({ page }) => {
  const table = await openTrialBalance(page);
  await table.getByRole("button", { name: "Income" }).click();
  await expect(table.getByRole("button", { name: "Income" })).toHaveAttribute("aria-expanded", "false");
  expect(await rowCells(table, "Income")).toEqual(["Income", "0.00", "550.50"]);
  await expect(table.getByRole("cell", { name: "Sales", exact: true })).toHaveCount(0);

  await table.getByRole("button", { name: "Office" }).click();
  expect(await rowCells(table, "Office")).toEqual(["Office", "540.25", "0.00"]);
  await expect(table.getByRole("cell", { name: "Total for Office" })).toHaveCount(0);

  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(table.getByRole("cell", { name: "Sales", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Collapse all" }).click();
  await expect(table.getByRole("button", { name: /^(Bank|Office|Services)$/ })).toHaveCount(0);
  await expect(table.getByRole("cell", { name: /^Total for/ })).toHaveCount(0);
  expect(await rowCells(table, "Total")).toEqual(["Total", "1,590.75", "1,590.75"]);
});

test("a refused key says so, with Try again", async ({ page }) => {
  const company = seededCompany("small");
  await seedCompanies(page, [{ ...company, key: "not-a-real-key" }]);
  await page.goto("/reports/trial-balance");
  await expect(page.getByRole("region", { name: "Trial Balance" }).getByRole("alert")).toContainText("That key isn't accepted for this company.");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("printing shows the statement without the controls", async ({ page }) => {
  await openTrialBalance(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Print" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Collapse all" })).toBeHidden();
  await expect(page.getByLabel("As of")).toBeHidden();
  await expect(page.getByRole("table")).toBeVisible();
});
