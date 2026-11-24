import { expect, test, type Page } from "@playwright/test";

// The shell's moving parts, on the development-only UI kit page with sample
// navigation (no built screen shows them yet).

async function openKit(page: Page) {
  await page.goto("/dev/ui-kit");
  await expect(page.getByRole("heading", { name: "UI kit" })).toBeVisible();
}

test.describe("rail flyout", () => {
  test("opens after a short hover, lists the category's pages, and closes when the pointer leaves", async ({ page }) => {
    await openKit(page);
    const accounting = page.getByRole("link", { name: "Accounting", exact: true });
    await accounting.hover();
    const flyout = page.getByRole("menu", { name: "Accounting" });
    await expect(flyout).toBeVisible();
    await expect(flyout.getByRole("menuitem")).toHaveText(["Bank Transactions", "Chart of Accounts"]);

    await page.mouse.move(900, 800);
    await expect(flyout).toHaveCount(0);
  });

  test("a pointer passing straight over the icon does not open it", async ({ page }) => {
    await openKit(page);
    const box = await page.getByRole("link", { name: "Accounting", exact: true }).boundingBox();
    if (!box) throw new Error("no rail item");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(900, 800);
    await page.waitForTimeout(500);
    await expect(page.getByRole("menu", { name: "Accounting" })).toHaveCount(0);
  });

  test("keyboard focus opens it at once; Escape closes it and focus returns", async ({ page }) => {
    await openKit(page);
    const accounting = page.getByRole("link", { name: "Accounting", exact: true });
    await accounting.focus();
    const flyout = page.getByRole("menu", { name: "Accounting" });
    await expect(flyout).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(flyout.getByRole("menuitem", { name: "Bank Transactions" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(flyout).toHaveCount(0);
    await expect(accounting).toBeFocused();
  });
});

test.describe("All apps sub menu", () => {
  test("starts closed, opens and closes, and remembers the choice", async ({ page }) => {
    await openKit(page);
    const submenu = page.getByRole("navigation", { name: "All apps" });
    await expect(submenu).toBeHidden();

    await page.getByRole("button", { name: "Show sub menu" }).click();
    await expect(submenu).toBeVisible();
    await expect(submenu.getByRole("link", { name: "Bank Transactions" })).toHaveAttribute("aria-current", "page");

    await page.reload();
    await expect(page.getByRole("navigation", { name: "All apps" })).toBeVisible();

    await page.getByRole("button", { name: "Hide sub menu" }).click();
    await expect(page.getByRole("navigation", { name: "All apps" })).toBeHidden();
    await page.reload();
    await expect(page.getByRole("navigation", { name: "All apps" })).toBeHidden();
  });

  test("its categories fold and unfold", async ({ page }) => {
    await openKit(page);
    await page.getByRole("button", { name: "Show sub menu" }).click();
    const submenu = page.getByRole("navigation", { name: "All apps" });
    const accounting = submenu.getByRole("button", { name: "Accounting" });
    await expect(accounting).toHaveAttribute("aria-expanded", "true");
    await accounting.click();
    await expect(accounting).toHaveAttribute("aria-expanded", "false");
    await expect(submenu.getByRole("link", { name: "Bank Transactions" })).toHaveCount(0);
  });
});
