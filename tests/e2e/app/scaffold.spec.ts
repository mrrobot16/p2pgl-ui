import { expect, test } from "@playwright/test";
import { runningGlNode } from "@tests/e2e/settings";

// The scaffold's proof: the export is served, and a page on the app's
// origin can call gl-node directly (CORS) with a key, as every screen will.

test("the exported app is served with its name", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page).toHaveTitle("New GL - Sign in");
});

test("a page on the app's origin can call gl-node with a key", async ({ page }) => {
  const node = runningGlNode();
  await page.goto("/");

  const answer = await page.evaluate(
    async ({ url, key }) => {
      const response = await fetch(`${url}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Api-Key": key },
        body: JSON.stringify({ query: "{ health { status } }" })
      });
      return { status: response.status, body: await response.json() };
    },
    { url: node.url, key: node.operatorKey }
  );

  expect(answer.status).toBe(200);
  expect(answer.body).toEqual({ data: { health: { status: expect.any(String) } } });
});

test("gl-node refuses a request without the right key", async ({ page }) => {
  const node = runningGlNode();
  await page.goto("/");

  const status = await page.evaluate(async (url) => {
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": "not-the-key-0123456789" },
      body: JSON.stringify({ query: "{ health { status } }" })
    });
    return response.status;
  }, node.url);

  expect(status).toBe(401);
});
