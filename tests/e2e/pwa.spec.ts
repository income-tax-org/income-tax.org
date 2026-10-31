import { test, expect } from "@playwright/test";

// Only the production export has a service worker, and CI is what serves it.
// It was once missing from production with no test noticing.
test.skip(!process.env.CI, "only the production export has a service worker");

test("a visited page still loads offline", async ({ page, context }) => {
  await page.goto("/2026/oregon/portland/?income=100000");
  await page.evaluate(() => navigator.serviceWorker.ready);

  // The first load came before the worker took control. This one goes through
  // it, which caches the page.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId("total-take-home-amount")).toBeVisible();
});
