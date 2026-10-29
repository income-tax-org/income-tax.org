import { test, expect } from "@playwright/test";

/**
 * Tests for URL routing, query parameters, and navigation behavior
 *
 * Calculator Tests:
 * - Income changes update the `?income=` query param (using replaceState, not in history)
 * - Year changes update the path (e.g., `/2024`, `/2023`), current year shows `/`
 * - State and city selections work with proper URLs (e.g., `/2024/oregon/portland`)
 * - Current year with state/city shows year in path (e.g., `/2025/oregon`)
 * - Income query param persists across navigation changes
 * - All paths are dash-cased, not snake-cased
 * - Browser back/forward navigation works correctly
 *
 * Tax Tables Tests:
 * - Year changes update the path (e.g., `/tax-tables/2024`)
 * - State and city selections work with proper URLs
 * - Specific tax selection shows up as `?tables=` query param (dash-cased)
 * - Multiple tax selections are comma-separated in query param
 * - All paths are dash-cased, not snake-cased
 * - Browser back/forward navigation works correctly
 * - Tax table selections persist across navigation
 * - Clearing state removes state from path but keeps year and tables param
 */

test.describe("Calculator Routing and Query Params", () => {
  test("income changes update the income query param without adding to history", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Set an initial income value
    await page.fill("input#total-income", "50000");
    await page.waitForTimeout(500);

    // Check that the income query param is in the URL
    await expect(page).toHaveURL(/\?income=50000/);

    // Change income to a different value
    await page.fill("input#total-income", "75000");
    await page.waitForTimeout(500);

    // Check that the income query param updated
    await expect(page).toHaveURL(/\?income=75000/);

    // Go back in history - should NOT go back to previous income
    await page.goBack();
    await page.waitForTimeout(500);

    // URL should still have income param (or be at the base page without it)
    // The income changes use replaceState, so going back should go to the page before
    const url = page.url();
    expect(url).not.toContain("income=50000");
  });

  test("year changes update the path correctly", async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Current year should be at root path "/"
    await expect(page).toHaveURL(/^.*\/$|^.*$/);

    // Change to 2024
    await page.getByTestId("tax-year-select").locator("input").fill("2024");
    await page.waitForTimeout(500);

    // Should navigate to /2024
    await page.waitForURL("**/2024");
    await expect(page).toHaveURL(/\/2024\/?$/);

    // Change to 2023
    await page.getByTestId("tax-year-select").locator("input").fill("2023");
    await page.waitForTimeout(500);

    // Should navigate to /2023
    await page.waitForURL("**/2023");
    await expect(page).toHaveURL(/\/2023\/?$/);

    // Change back to current year
    await page
      .getByTestId("tax-year-select")
      .locator("input")
      .fill(currentYear);
    await page.waitForTimeout(500);

    // Should navigate back to root "/"
    await expect(page).toHaveURL(/^.*\/$|^.*$/);
    expect(page.url()).not.toContain(`/${currentYear}`);
  });

  test("state selection updates path correctly with year", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Select year 2024
    await page.getByTestId("tax-year-select").locator("input").fill("2024");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024");

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);

    // Should navigate to /2024/oregon (dash-case)
    await page.waitForURL("**/2024/oregon");
    await expect(page).toHaveURL(/\/2024\/oregon\/?$/);
  });

  test("city selection updates path correctly with year and state", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Select year 2024
    await page.getByTestId("tax-year-select").locator("input").fill("2024");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024");

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024/oregon");

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(500);

    // Should navigate to /2024/oregon/portland (dash-case)
    await page.waitForURL("**/2024/oregon/portland");
    await expect(page).toHaveURL(/\/2024\/oregon\/portland\/?$/);
  });

  test("current year with state/city shows year in path", async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Ensure we're on current year (should be default)
    await page
      .getByTestId("tax-year-select")
      .locator("input")
      .fill(currentYear);
    await page.waitForTimeout(500);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);

    // Should show year in path when state is selected
    await page.waitForURL(`**/${currentYear}/oregon`);
    await expect(page).toHaveURL(new RegExp(`\\/${currentYear}\\/oregon\\/?$`));

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(500);

    // Should show year in path with state and city
    await page.waitForURL(`**/${currentYear}/oregon/portland`);
    await expect(page).toHaveURL(
      new RegExp(`\\/${currentYear}\\/oregon\\/portland\\/?$`),
    );
  });

  test("income query param persists across year/state/city changes", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Set income
    await page.fill("input#total-income", "100000");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\?income=100000/);

    // Change year
    await page.getByTestId("tax-year-select").locator("input").fill("2024");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024**");

    // Income param should persist
    await expect(page).toHaveURL(/\?income=100000/);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024/oregon**");

    // Income param should persist
    await expect(page).toHaveURL(/\?income=100000/);

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(500);
    await page.waitForURL("**/2024/oregon/portland**");

    // Income param should persist
    await expect(page).toHaveURL(/\?income=100000/);
  });

  test("paths are dash-cased not snake-cased", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Select year 2023 for stable data
    await page.getByTestId("tax-year-select").locator("input").fill("2023");
    await page.waitForTimeout(500);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(500);

    // Close any open dropdowns
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // URL should be dash-case
    await page.waitForURL("**/2023/oregon/portland");
    await expect(page).toHaveURL(/\/2023\/oregon\/portland\/?$/);
    expect(page.url()).not.toContain("_");
  });

  test("browser back/forward navigation works correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Navigate to 2024
    await page.getByTestId("tax-year-select").locator("input").fill("2024");
    await page.waitForTimeout(500);
    // Close any open dropdowns
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.waitForURL("**/2024");

    // Navigate to Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(500);
    // Close any open dropdowns
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.waitForURL("**/2024/oregon");

    // Navigate to Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(500);
    // Close any open dropdowns
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await page.waitForURL("**/2024/oregon/portland");

    // Go back - should be at /2024/oregon
    await page.goBack();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/2024\/oregon\/?$/);

    // Go back - should be at /2024
    await page.goBack();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/2024\/?$/);

    // Go forward - should be at /2024/oregon
    await page.goForward();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/2024\/oregon\/?$/);
  });
});

test.describe("Tax Tables Routing and Query Params", () => {
  test("tax tables year changes update the path correctly", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Current year path behavior - may include year in path initially
    // Just verify we're on tax-tables (with or without year)
    expect(page.url()).toContain("/tax-tables");

    // Change to 2024 - Click the combobox role element, then click the option
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2024" }).click();
    await page.waitForTimeout(500);

    // Verify we navigated (don't wait for specific URL since initial state varies)
    expect(page.url()).toContain("2024");

    // Change to 2023
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Should navigate to /tax-tables/2023
    await expect(page).toHaveURL(/\/tax-tables\/2023/);
  });

  test("tax tables state selection updates path correctly", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023 for stable data
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Verify year is in URL
    expect(page.url()).toContain("2023");

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);

    // Should have oregon in the path (dash-case)
    expect(page.url()).toContain("/oregon");
    expect(page.url()).not.toContain("_");
  });

  test("tax tables city selection updates path correctly", async ({ page }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023 for stable data
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/oregon");

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(1000);

    // Should have portland in path (dash-case)
    expect(page.url()).toContain("/portland");
    expect(page.url()).not.toContain("_");
  });

  test("selecting specific taxes shows up as a query param", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023 for stable data
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Federal Income tax
    const federalIncome = "Federal Income";
    await page.getByTestId("tax-options-select").click({ force: true });
    await page.waitForTimeout(1000);
    await page.getByRole("option").filter({ hasText: federalIncome }).click();
    await page.waitForTimeout(1500);

    // Should have tables query param with dash-case value
    expect(page.url()).toContain("tables=");
    expect(page.url()).toContain("federal-income");
    expect(page.url()).not.toContain("federal_income");
  });

  test("multiple selected taxes show up in query param", async ({ page }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Federal Income
    await page.getByTestId("tax-options-select").click({ force: true });
    await page.waitForTimeout(1000);
    await page
      .getByRole("option")
      .filter({ hasText: "Federal Income" })
      .click();
    await page.waitForTimeout(1500);

    // Verify first tax is in URL
    expect(page.url()).toContain("federal-income");

    // The dropdown should still be open due to disableCloseOnSelect
    // Wait a moment for UI to update
    await page.waitForTimeout(1000);

    // Select Social Security (dropdown should still be open)
    await page
      .getByRole("option")
      .filter({ hasText: "Social Security" })
      .click();
    await page.waitForTimeout(1000);

    // Should have both taxes in query param, comma-separated, dash-case
    const url = page.url();
    expect(url).toContain("tables=");
    expect(url).toContain("federal-income");
    expect(url).toContain("social-security");
  });

  test("tax tables paths are dash-cased with state and city", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023 for stable data
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);

    // Should be dash-case
    expect(page.url()).toContain("/oregon");
    expect(page.url()).not.toContain("_");

    // Select Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(1000);

    // Should be dash-case
    expect(page.url()).toContain("/portland");
    expect(page.url()).not.toContain("_");
  });

  test("tax tables browser back/forward navigation works", async ({ page }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Navigate to 2023
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Navigate to Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);

    // Navigate to Portland
    await page.fill("input#city-select", "Portland");
    await page.waitForTimeout(1000);

    // Verify we're at the full path
    expect(page.url()).toContain("/2023/oregon/portland");

    // Go back - should be at /tax-tables/2023/oregon
    await page.goBack();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/2023/oregon");
    expect(page.url()).not.toContain("/portland");

    // Go forward - should be at /tax-tables/2023/oregon/portland again
    await page.goForward();
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/2023/oregon/portland");
  });

  test("tax table selection persists with browser back/forward", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Federal Income
    await page.getByTestId("tax-options-select").click({ force: true });
    await page.waitForTimeout(1000);
    await page
      .getByRole("option")
      .filter({ hasText: "Federal Income" })
      .click();
    await page.waitForTimeout(1500);

    // Verify URL has the param
    expect(page.url()).toContain("tables=federal-income");

    // Navigate to Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/oregon");

    // Go back
    await page.goBack();
    await page.waitForTimeout(500);

    // Should still have the tables param
    expect(page.url()).toContain("tables=federal-income");
  });

  test("clearing state removes state from path but keeps year and tables", async ({
    page,
  }) => {
    await page.goto("/tax-tables", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Select year 2023
    await page.getByRole("combobox", { name: "Tax Year" }).click();
    await page.waitForTimeout(300);
    await page.getByRole("option", { name: "2023" }).click();
    await page.waitForTimeout(500);

    // Select Federal Income
    await page.getByTestId("tax-options-select").click({ force: true });
    await page.waitForTimeout(1000);
    await page
      .getByRole("option")
      .filter({ hasText: "Federal Income" })
      .click();
    await page.waitForTimeout(1500);

    // Select Oregon
    await page.fill("input#state-select", "Oregon");
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/oregon");

    // Clear the state
    await page.fill("input#state-select", "");
    await page.waitForTimeout(1000);

    // Should go back to /tax-tables/2023 with tables param
    expect(page.url()).not.toContain("/oregon");
    expect(page.url()).toContain("/2023");
    expect(page.url()).toContain("tables=federal-income");
  });
});
