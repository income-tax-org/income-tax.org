import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Comparison page. Figures are 2026, filing single, on the default $150,000.
 */

const rows = (page: Page) => page.getByTestId("compare-row");

test("a statically generated pair page loads both states and keeps its URL", async ({
  page,
}) => {
  await page.goto("/compare/2026/texas/vs/california", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await expect(page).toHaveTitle(/Texas vs California/);
  await expect(rows(page)).toHaveCount(2);

  // The pretty path is the point of these pages; it must not rewrite itself
  // into a query string on load.
  expect(page.url()).toContain("/compare/2026/texas/vs/california");
  expect(page.url()).not.toContain("locations=");
});

test("both orderings of a pair exist and agree on the canonical", async ({
  page,
}) => {
  for (const path of [
    "/compare/2026/texas/vs/california",
    "/compare/2026/california/vs/texas",
  ]) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/compare\/2026\/california\/vs\/texas\/$/,
    );
  }
});

test("ranks by take home and reports the gap", async ({ page }) => {
  await page.goto("/compare/2026/texas/vs/california", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  // No state income tax in Texas, so it cannot lose to California.
  await expect(rows(page).first()).toContainText("Texas");
  await expect(rows(page).first().getByTestId("compare-delta")).toHaveText(
    "best",
  );

  const gap = await rows(page)
    .nth(1)
    .getByTestId("compare-delta")
    .textContent();
  expect(gap).toMatch(/^−\$[\d,]+$/);
});

test("reads locations and income from the query string", async ({ page }) => {
  // Three states' data chunks plus a cold compile of this route.
  test.slow();
  await page.goto(
    "/compare?locations=oregon/portland,texas,washington&income=200000",
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(1500);

  await expect(rows(page)).toHaveCount(3);
  await expect(page.locator("input#compare-income")).toHaveValue("200,000");
  await expect(
    page.getByRole("heading", { name: /Take home on \$200,000/ }),
  ).toBeVisible();
  // A city is its own location, distinct from the bare state. Scoped to the
  // results: the name also appears on the chip that removes it.
  await expect(rows(page).filter({ hasText: "Portland, Oregon" })).toHaveCount(
    1,
  );
});

test("a row expands to show why it lost", async ({ page }) => {
  await page.goto("/compare?locations=texas,washington&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await page
    .getByRole("button", { name: "Show breakdown for Washington" })
    .click();
  await page.waitForTimeout(500);

  // Washington has no income tax but does levy the Cares Fund, which is the
  // entire reason it trails Texas.
  await expect(page.getByText("Washington Cares Fund")).toBeVisible();
});

test("removing a location updates the ranking and the URL", async ({
  page,
}) => {
  await page.goto("/compare?locations=texas,california,oregon&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  await expect(rows(page)).toHaveCount(3);

  await page.getByRole("button", { name: "Remove California" }).first().click();
  await page.waitForTimeout(500);

  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByText("California", { exact: true })).toHaveCount(0);
  expect(page.url()).not.toContain("california");
});

test("a state with no city taxes can still be added", async ({ page }) => {
  // The city step used to tell people to "press add" with nothing to press,
  // leaving states like Arizona unaddable.
  await page.goto("/compare?locations=texas&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  await expect(rows(page)).toHaveCount(1);

  await page.fill("input#compare-state-select", "Arizona");
  await page.getByRole("option", { name: "Arizona" }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.waitForTimeout(800);

  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).filter({ hasText: "Arizona" })).toHaveCount(1);
  // And the picker resets, ready for the next one.
  await expect(page.locator("input#compare-state-select")).toHaveValue("");
});

test("deductions change every location's take home", async ({ page }) => {
  await page.goto("/compare?locations=texas,washington&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const takeHomes = async () =>
    page.getByTestId("compare-take-home").allTextContents();
  const before = await takeHomes();

  await page.locator("#compare-deductions-header").click();
  await page.fill("input#compare-ira-401k-contributions", "23500");
  await page.waitForTimeout(800);

  const after = await takeHomes();
  expect(after).not.toEqual(before);
  // Contributions are the user's money but they leave take home, so every
  // location's figure must drop.
  const asNumber = (text: string) => Number(text.replace(/[^0-9.]/g, ""));
  for (let i = 0; i < before.length; i++) {
    expect(asNumber(after[i])).toBeLessThan(asNumber(before[i]));
  }
  expect(page.url()).toContain("ira=23500");
});

test("does not repeat the ranking as a sentence", async ({ page }) => {
  await page.goto("/compare?locations=texas,oregon&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await expect(page.getByText(/better off per year than/)).toHaveCount(0);
});

test("has the income slider and the 401(k) maximum, like the calculator", async ({
  page,
}) => {
  await page.goto("/compare?locations=texas,oregon&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  // The slider announces dollars, not its cube-root scale position.
  const slider = page.locator("input[type=range]");
  await expect(slider).toHaveAttribute("aria-valuetext", "$150,000");

  await page.locator("#compare-deductions-header").click();
  await page
    .getByRole("button", { name: "Set to max allowed for year" })
    .click();
  await page.waitForTimeout(600);

  const contributions = page.locator("input#compare-ira-401k-contributions");
  await expect(contributions).not.toHaveValue("");
  await expect(
    page.locator("#compare-ira-401k-contributions-helper-text"),
  ).toContainText("Max 401(k) contribution");
  // At the cap there is nothing left to max out.
  await expect(
    page.getByRole("button", { name: "Set to max allowed for year" }),
  ).toHaveCount(0);
});

test("shows state deductions as a read-only field, not a paragraph", async ({
  page,
}) => {
  await page.goto("/compare?locations=oregon,texas&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  await page.locator("#compare-deductions-header").click();

  const stateDeductions = page.locator("input#compare-state-deductions");
  await expect(stateDeductions).toBeDisabled();
  // Oregon has one and Texas does not, so no single figure applies.
  await expect(stateDeductions).toHaveValue("Varies by state");
});

test("drops the introductory blurb", async ({ page }) => {
  await page.goto("/compare", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await expect(page.getByText(/See what the same salary/)).toHaveCount(0);
});

test("sales tax can flip Washington against Oregon", async ({ page }) => {
  await page.goto(
    "/compare/2026?locations=oregon,washington/seattle&income=150000&sales-tax=1",
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(1500);

  // At the IRS estimate Washington's lack of income tax still wins, and the
  // row says what Seattle's sales tax cost.
  await expect(rows(page).first()).toContainText("Seattle, Washington");
  await expect(
    rows(page).first().getByTestId("compare-sales-tax"),
  ).toContainText("10.55%");
  // Washington alone is charged the statewide average and says so; Oregon's
  // zero is exact, so it does not.
  await page.goto(
    "/compare/2026?locations=oregon,washington,washington/vancouver&income=150000&sales-tax=1",
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(1500);
  await expect(
    rows(page).filter({ hasText: "Washington (state average)" }),
  ).toHaveCount(1);
  await expect(
    rows(page).filter({ hasText: "Vancouver, Washington (state average)" }),
  ).toHaveCount(0);
  await expect(
    rows(page).filter({ hasText: "Oregon (state average)" }),
  ).toHaveCount(0);
  await page.goto(
    "/compare/2026?locations=oregon,washington/seattle&income=150000&sales-tax=1",
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(1500);

  // Oregon has data saying it has no sales tax, so nothing is flagged.
  await expect(page.getByTestId("compare-sales-tax-missing")).toHaveCount(0);

  await page.getByRole("button", { name: "Sales tax" }).click();
  await page.fill("input#compare-taxable-spending", "200000");
  await page.waitForTimeout(500);

  await expect(rows(page).first()).toContainText("Oregon");
  expect(page.url()).toContain("spending=200000");
});

test("sales tax offers Washington's cities and flags years without data", async ({
  page,
}) => {
  // Sales tax data starts in 2025.
  await page.goto("/compare/2024?locations=texas&income=150000&sales-tax=1", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("compare-sales-tax-missing")).toContainText(
    "Texas",
  );

  await page.goto("/compare/2026?locations=texas&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: "Sales tax" }).click();
  await page.getByLabel("Include sales tax").check();
  expect(page.url()).toContain("sales-tax=1");
  await expect(page.getByTestId("compare-sales-tax-missing")).toHaveCount(0);
  await expect(
    rows(page).first().getByTestId("compare-sales-tax"),
  ).toBeVisible();

  await page.fill("input#compare-state-select", "Washington");
  await page.getByRole("option", { name: "Washington" }).click();
  await page.fill("input#compare-city-select", "Tacoma");
  await page.getByRole("option", { name: "Tacoma" }).click();
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.waitForTimeout(800);

  await expect(
    rows(page).filter({ hasText: "Tacoma, Washington" }),
  ).toHaveCount(1);
});

test("cities with their own sales tax rate are offered with sales tax off", async ({
  page,
}) => {
  await page.goto("/compare/2026?locations=texas&income=150000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await page.fill("input#compare-state-select", "Washington");
  await page.getByRole("option", { name: "Washington" }).click();
  await page.fill("input#compare-city-select", "Seattle");
  await expect(page.getByRole("option", { name: "Seattle" })).toBeVisible();
});
