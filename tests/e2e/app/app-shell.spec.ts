import { expect, test } from "@playwright/test";
import { createCompanyOnNode, seedCompanies, type TestCompany } from "@tests/e2e/companies";

// The app shell as it ships (docs/parity/app-shell.md), signed in to a company.

let company: TestCompany;

test.beforeAll(async () => {
  company = await createCompanyOnNode({ role: "READ" });
});

test.beforeEach(async ({ page }) => {
  await seedCompanies(page, [company]);
});

test("the shell shows the rail's logo and the header's theme menu", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("newGL");
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Choose theme" })).toBeVisible();
});

test("the tab icon is the logo, as SVG", async ({ page, request }) => {
  await page.goto("/sign-in");
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute("href", /^\/logo\.svg/);
  await expect(icon).toHaveAttribute("type", "image/svg+xml");
  const response = await request.get("/logo.svg");
  expect(response.ok()).toBe(true);
});

test("areas that aren't backed yet are not in the navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
  for (const label of ["Home", "Reports", "Accounting", "Expenses", "Sales", "More apps", "Settings"]) {
    await expect(page.getByRole("link", { name: label, exact: true })).toHaveCount(0);
  }
});

test("the theme menu offers Light and Dark, and the choice is kept", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Choose theme" }).click();
  const choices = page.getByRole("menuitemradio");
  await expect(choices).toHaveText(["Light", "Dark"]);

  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(page.getByRole("menuitemradio")).toHaveCount(0);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);

  await page.getByRole("button", { name: "Choose theme" }).click();
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("menuitemradio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
});

test("the theme menu closes on Escape and gives focus back", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Choose theme" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("light and dark paint the shell from their tokens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const rail = page.locator("aside.side-nav");
  await expect(rail).toHaveCSS("background-color", "rgb(240, 244, 246)");
  await expect(page.locator("header.top-header")).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(rail).toHaveCSS("background-color", "rgb(26, 29, 33)");
  await expect(page.locator("header.top-header")).toHaveCSS("background-color", "rgb(30, 33, 36)");
});
