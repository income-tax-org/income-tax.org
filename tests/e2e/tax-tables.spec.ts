import { test, expect } from "@playwright/test";

test("has expected title and heading", async ({ page }) => {
  await page.goto("/tax-tables");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Income Tax Tables/);

  await expect(
    page.getByRole("heading", { name: "Income Tax Tables" }),
  ).toBeVisible();
});

test("expected federal values are displayed for different tax years", async ({
  page,
}) => {
  await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Select year, 2023 - 2024
  await page.getByTestId("tax-year-select").locator("input").fill("2023");
  await page.waitForTimeout(500);

  const federalIncome = "Federal Income";
  await page.getByTestId("tax-options-select").click({ force: true });
  await page.waitForTimeout(800);
  await page.getByRole("option").filter({ hasText: federalIncome }).click();
  await page.waitForTimeout(800);

  await expect(
    page.locator("tr#federal_income_row_0").locator("td").nth(2),
  ).toHaveText("$0 - $22,000");

  // Change year and expect federal value to update
  await page.getByTestId("tax-year-select").locator("input").fill("2024");
  await page.waitForTimeout(500);

  await expect(
    page.locator("tr#federal_income_row_0").locator("td").nth(2),
  ).toHaveText("$0 - $23,200");
});

test("expected values are displayed for portland specific tax", async ({
  page,
}) => {
  await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Select year first to avoid defaulting to current year (2023 has stable data)
  await page.getByTestId("tax-year-select").locator("input").fill("2023");
  await page.waitForTimeout(500);

  // Select state, Oregon
  await page.fill("input#state-select", "Oregon");
  await page.waitForTimeout(500);

  // Select city, Portland
  await page.fill("input#city-select", "Portland");
  await page.waitForTimeout(500);

  // Close any open dropdowns by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  const portlandArtTax = "Portland Art Tax";
  await page.getByTestId("tax-options-select").click({ force: true });
  await page.waitForTimeout(1000);
  const portlandOption = page
    .getByRole("option")
    .filter({ hasText: portlandArtTax });
  await portlandOption.waitFor({ state: "visible", timeout: 10000 });
  await portlandOption.click();
  await page.waitForTimeout(500);

  // The threshold is part of the answer: this fee only applies at $1,000+.
  await expect(
    page.locator("tr#portland_art_tax_row_0").locator("td").nth(2),
  ).toHaveText("$35 at $1,000+");
});

test("per-period city fees are shown annualized", async ({ page }) => {
  // Denver's occupational privilege tax is $5.75 a month. The table used to
  // print the raw amount, disagreeing with the calculator by a factor of 12.
  await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  await page.getByTestId("tax-year-select").locator("input").fill("2023");
  await page.waitForTimeout(500);

  await page.fill("input#state-select", "Colorado");
  await page.waitForTimeout(500);

  await page.fill("input#city-select", "Denver");
  await page.waitForTimeout(500);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  await page.getByTestId("tax-options-select").click({ force: true });
  await page.waitForTimeout(1000);
  const denverOption = page
    .getByRole("option")
    .filter({ hasText: "Denver Occupational Privilege" });
  await denverOption.waitFor({ state: "visible", timeout: 10000 });
  await denverOption.click();
  await page.waitForTimeout(500);

  await expect(
    page.locator("tr#denver_occupational_privilege_row_0").locator("td").nth(2),
  ).toHaveText("$69/yr ($5.75 monthly) at $6,000+");
});

test("multiple tables displayed for multiple tax types", async ({ page }) => {
  await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // Select year first to avoid defaulting to current year (2023 has stable data)
  await page.getByTestId("tax-year-select").locator("input").fill("2023");
  await page.waitForTimeout(500);

  // Select state, Oregon
  await page.fill("input#state-select", "Oregon");
  await page.waitForTimeout(500);

  // Close any open dropdowns by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Open tax options select and select both options without closing
  const oregonStateIncomeTax = "Oregon State Income";
  const federalIncome = "Federal Income";

  await page.getByTestId("tax-options-select").click({ force: true });
  await page.waitForTimeout(1000);

  // Wait for and click Oregon State Income option
  const oregonOption = page
    .getByRole("option")
    .filter({ hasText: oregonStateIncomeTax });
  await oregonOption.waitFor({ state: "visible", timeout: 10000 });
  await oregonOption.click();
  await page.waitForTimeout(500);

  // Wait for Federal Income option to be visible and click it
  const federalOption = page
    .getByRole("option")
    .filter({ hasText: federalIncome });
  await federalOption.waitFor({ state: "visible", timeout: 10000 });
  await federalOption.click();
  await page.waitForTimeout(500);

  // Close the dropdown
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // Verify both chips are visible
  await expect(
    page.getByTestId("tax-options-select").getByText(oregonStateIncomeTax),
  ).toBeVisible();
  await expect(
    page.getByTestId("tax-options-select").getByText(federalIncome),
  ).toBeVisible();

  await expect(
    page.locator("tr#federal_income_row_0").locator("td").nth(2),
  ).toHaveText("$0 - $22,000");

  await expect(
    page.locator("tr#oregon_state_income_row_2").locator("td").nth(2),
  ).toHaveText("$21,501 - $250,000");
});

test("tax data for deductions is displayed", async ({ page }) => {
  await page.goto("/tax-tables");

  // Select year, 2023 - 2024
  await page.getByTestId("tax-year-select").locator("input").fill("2023");

  const standardFederalDeductions = "Standard Federal Deductions";
  await page.getByTestId("tax-data-select").click({ force: true });
  await page
    .getByRole("option")
    .filter({ hasText: standardFederalDeductions })
    .click();

  await expect(
    page.locator("tr#standard_federal_deductions_row_0").locator("td").nth(1),
  ).toHaveText("$13,850");
});

test("sales tax rates are listed by period where they changed", async ({
  page,
}) => {
  await page.goto("/tax-tables/2026/washington/?tables=sales-tax", {
    waitUntil: "domcontentloaded",
  });

  // Washington's average local rate rose for the second half of 2026; the
  // table lists both rather than averaging them.
  const average = page.locator("tr#washington_sales_tax_row_0").locator("td");
  await expect(average.nth(0)).toHaveText("State average");
  await expect(average.nth(2)).toContainText("3.01% (Jan–Jun)");
  await expect(average.nth(2)).toContainText("3.07% (Jul–Dec)");
  await expect(
    page.getByText(
      "Rates that changed during 2026 are listed with the months each applied.",
    ),
  ).toBeVisible();
});

test("a city with only a sales tax rate has its own tax tables", async ({
  page,
}) => {
  await page.goto("/tax-tables/2026/washington/?tables=sales-tax", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1000);

  // Seattle levies no income tax, so only sales tax puts it in the list.
  await page.fill("input#city-select", "Seattle");
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  expect(page.url()).toContain("/tax-tables/2026/washington/seattle");

  const seattle = page.locator("tr#seattle_sales_tax_row_0").locator("td");
  await expect(seattle.nth(0)).toHaveText("Seattle");
  await expect(seattle.nth(3)).toHaveText("10.55%");

  // 2024 has no sales tax data, and no Seattle page: the city is dropped and
  // the table says the data is missing rather than showing 0%.
  await page.getByTestId("tax-year-select").locator("input").fill("2024");
  await page.waitForTimeout(500);
  expect(page.url()).toContain("/tax-tables/2024/washington");
  expect(page.url()).not.toContain("seattle");
  await expect(page.locator("table#washington_sales_tax")).toContainText(
    "No sales tax data for 2024",
  );
});
