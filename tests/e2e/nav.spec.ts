// Able to navigate between Calculator, Tax-Tables, and Support via the header
// links (wide screens), the nav drawer (narrow screens), or the footer.
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/** MUI's default `md`, the width at which the header links replace the menu. */
const MD_BREAKPOINT = 900;

const isWide = (page: Page) =>
  (page.viewportSize()?.width ?? 0) >= MD_BREAKPOINT;

/**
 * The test server runs with NODE_ENV=test, which leaves the service worker
 * enabled, and it can re-navigate to the URL just loaded. Waiting only for the
 * URL leaves the next click landing on a document about to be replaced.
 */
async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(500);
}

async function expectOnCalculator(page: Page) {
  await expect(page).toHaveTitle(/Income Tax Calculator/);
  await expect(
    page.getByRole("heading", { name: "Income Tax Calculator" }),
  ).toBeVisible();
}

test("can navigate via the header links on wide screens", async ({ page }) => {
  // Walks three routes; against a cold dev server each one is compiled on
  // demand, which alone can approach the default timeout.
  test.slow();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  test.skip(!isWide(page), "header links are only shown from md up");

  await expectOnCalculator(page);

  // Scoped to the header: the same names appear again in the footer.
  const headerNav = page.locator("header").getByRole("navigation");

  await headerNav.getByRole("link", { name: "Tax Tables" }).click();
  await page.waitForURL("**/tax-tables/**");
  await settle(page);
  await expect(page).toHaveTitle(/Income Tax Tables/);

  await headerNav.getByRole("link", { name: "Support" }).click();
  await page.waitForURL("**/support/**");
  await settle(page);
  await expect(page).toHaveTitle(/Support/);

  await headerNav.getByRole("link", { name: "Calculator" }).click();
  await settle(page);
  await expectOnCalculator(page);
});

test("the header marks the current page", async ({ page }) => {
  await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  test.skip(!isWide(page), "header links are only shown from md up");

  const headerNav = page.locator("header").getByRole("navigation");
  await expect(
    headerNav.getByRole("link", { name: "Tax Tables" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    headerNav.getByRole("link", { name: "Calculator" }),
  ).not.toHaveAttribute("aria-current", "page");
});

test("can navigate via the nav drawer on narrow screens", async ({ page }) => {
  test.slow();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  test.skip(isWide(page), "the menu button is replaced by links from md up");

  await expectOnCalculator(page);

  await page.locator("button#open-nav-drawer").click();
  await page.waitForTimeout(500);
  await page.getByRole("button").filter({ hasText: "Tax Tables" }).click();
  await page.waitForURL("**/tax-tables/**");
  await settle(page);
  await expect(page).toHaveTitle(/Income Tax Tables/);

  await page.locator("button#open-nav-drawer").click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Support" }).click();
  await page.waitForURL("**/support/**");
  await settle(page);
  await expect(page).toHaveTitle(/Support/);

  await page.locator("button#open-nav-drawer").click();
  await page.waitForTimeout(500);
  await page.getByRole("button").filter({ hasText: "Calculator" }).click();
  await settle(page);
  await expectOnCalculator(page);
});

test("can navigate via footer links", async ({ page }) => {
  test.slow();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await expectOnCalculator(page);

  // Scoped to the footer: on wide screens the header carries the same names.
  const footer = page.locator("footer");

  await footer.getByRole("link", { name: "Tax Tables" }).click();
  await page.waitForURL("**/tax-tables/**");
  await settle(page);
  await expect(page).toHaveTitle(/Income Tax Tables/);

  await footer.getByRole("link", { name: "Support" }).click();
  await page.waitForURL("**/support/**");
  await settle(page);
  await expect(page).toHaveTitle(/Support/);

  await footer.getByRole("link", { name: "Calculator" }).click();
  await settle(page);
  await expectOnCalculator(page);
});

test("a skip link is the first thing keyboard focus reaches", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.keyboard.press("Tab");

  const focused = page.locator(":focus");
  await expect(focused).toHaveText("Skip to main content");
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute("href", "#main-content");

  // And it points at something that exists.
  await expect(page.locator("main#main-content")).toBeVisible();
});

test("compare sits second in the navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  test.skip(!isWide(page), "header links are only shown from md up");

  const names = await page
    .locator("header")
    .getByRole("navigation")
    .getByRole("link")
    .allTextContents();

  expect(names.map((name) => name.trim())).toEqual([
    "Calculator",
    "Compare",
    "Tax Tables",
    "City Taxes",
    "Support",
    "Disclaimer",
    "API",
  ]);
});

test("header links underline on hover and on keyboard focus", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  test.skip(!isWide(page), "header links are only shown from md up");

  const headerNav = page.locator("header").getByRole("navigation");
  const taxTables = headerNav.getByRole("link", { name: "Tax Tables" });

  // The bar is drawn but collapsed until the link is pointed at.
  const underlineScale = () =>
    taxTables.evaluate((el) => getComputedStyle(el, "::after").transform);

  expect(await underlineScale()).toBe("matrix(0, 0, 0, 1, 0, 0)");

  await taxTables.hover();
  await page.waitForTimeout(300);
  expect(await underlineScale()).toBe("matrix(1, 0, 0, 1, 0, 0)");

  // The current page carries it without needing to be pointed at.
  const calculator = headerNav.getByRole("link", { name: "Calculator" });
  await expect(calculator).toHaveAttribute("aria-current", "page");
  expect(
    await calculator.evaluate(
      (el) => getComputedStyle(el, "::after").transform,
    ),
  ).toBe("matrix(1, 0, 0, 1, 0, 0)");
});
