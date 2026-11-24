import { expect, test, type Page } from "@playwright/test";

// The UI kit's behaviour, on the development-only UI kit page.

async function openKit(page: Page) {
  await page.goto("/dev/ui-kit");
  await expect(page.getByRole("heading", { name: "UI kit" })).toBeVisible();
}

test("the select narrows as you type, says when nothing matches, and takes a choice", async ({ page }) => {
  await openKit(page);
  const category = page.getByLabel("Category", { exact: true });
  await category.click();
  const list = page.getByRole("listbox");
  await expect(list.getByRole("option")).toHaveCount(4);
  await expect(page.getByText("Assets", { exact: true })).toBeVisible();

  await category.fill("ink");
  await expect(list.getByRole("option")).toHaveText([/Office supplies/]);
  await category.fill("zzz");
  await expect(page.getByText("No matches")).toBeVisible();

  await category.fill("sav");
  await list.getByRole("option", { name: /Savings/ }).click();
  await expect(category).toHaveValue("Savings");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("the select's help text opens under its option", async ({ page }) => {
  await openKit(page);
  await page.getByLabel("Category", { exact: true }).click();
  await page.getByRole("button", { name: "About Savings" }).click();
  await expect(page.getByText("Money set aside, earning interest.")).toBeVisible();
});

test("the modal traps focus, closes on Escape, and gives focus back", async ({ page }) => {
  await openKit(page);
  const opener = page.getByRole("button", { name: "Open modal" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Import accounts" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();

  for (let step = 0; step < 6; step += 1) await page.keyboard.press("Tab");
  const focusIsInside = await dialog.evaluate((element) => element.contains(document.activeElement));
  expect(focusIsInside).toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("the confirm dialog answers with the button pressed", async ({ page }) => {
  await openKit(page);
  await page.getByRole("button", { name: "Ask to confirm" }).click();
  const dialog = page.getByRole("dialog", { name: "Disconnect bank?" });
  await expect(dialog.getByText("Its transactions stop arriving.")).toBeVisible();
  await dialog.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByText("Answer: confirmed")).toBeVisible();

  await page.getByRole("button", { name: "Ask to confirm" }).click();
  await page.getByRole("dialog", { name: "Disconnect bank?" }).getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Answer: cancelled")).toBeVisible();
});

test("toasts appear, announce errors as alerts, and can be dismissed", async ({ page }) => {
  await openKit(page);
  await page.getByRole("button", { name: "Success toast" }).click();
  const success = page.getByRole("status").filter({ hasText: "Transaction posted" });
  await expect(success).toBeVisible();
  await success.getByRole("button", { name: "Dismiss" }).click();
  await expect(success).toHaveCount(0);

  await page.getByRole("button", { name: "Error toast" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not post this transaction" })).toBeVisible();
});

test("the dropdown menu closes after a choice and on Escape", async ({ page }) => {
  await openKit(page);
  const trigger = page.getByRole("button", { name: "More actions" });
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Create rule" })).toBeDisabled();
  await page.getByRole("menuitem", { name: "Split" }).click();
  await expect(page.getByRole("menuitem")).toHaveCount(0);

  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem")).toHaveCount(0);
});

test("the kit renders in light and dark", async ({ page }, testInfo) => {
  await openKit(page);
  for (const theme of ["Light", "Dark"]) {
    await page.getByRole("button", { name: "Choose theme" }).click();
    await page.getByRole("menuitemradio", { name: theme }).click();
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme.toLowerCase()}\\b`));
    // Buttons fade colours over 150ms; capture after the fade.
    await page.waitForTimeout(300);
    await testInfo.attach(`ui-kit-${theme.toLowerCase()}`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  }
});
