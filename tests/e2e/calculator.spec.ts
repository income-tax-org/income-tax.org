import { test, expect } from "@playwright/test";

test("has expected title and heading", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Income Tax Calculator/);

  await expect(
    page.getByRole("heading", { name: "Income Tax Calculator" }),
  ).toBeVisible();
});

test("expected values are calculated for different tax years", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Select year first to avoid defaulting to current year
  await page.getByTestId("tax-year-select").locator("input").fill("2023");
  await page.waitForTimeout(500);

  // Select state, Oregon
  await page.fill("input#state-select", "Oregon");
  await page.waitForTimeout(500);

  // Select city, Portland
  await page.fill("input#city-select", "Portland");
  await page.waitForTimeout(500);

  // Set income to 100,000
  await page.fill("input#total-income", "100000");
  await page.waitForTimeout(500);

  // Wait for results to render
  await page.waitForSelector('[data-testid="total-take-home-amount"]', {
    state: "visible",
  });

  // Expect total take home for 2023. The Oregon statewide transit tax is
  // computed on gross wages, so Oregon's standard deduction does not reduce it.
  await expect(page.getByTestId("total-take-home-amount")).toHaveText(
    "$70,051.93",
  );

  // Change year to 2024 and expect total to update
  await page.getByTestId("tax-year-select").locator("input").fill("2024");
  await page.waitForTimeout(500);

  // Wait for the URL to update and results to re-render
  await page.waitForURL("**/2024/**");
  await page.waitForSelector('[data-testid="total-take-home-amount"]', {
    state: "visible",
  });

  await expect(page.getByTestId("total-take-home-amount")).toHaveText(
    "$70,536.06",
  );
});
