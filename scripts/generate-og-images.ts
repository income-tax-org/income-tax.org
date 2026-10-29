// Generate Open Graph images for each tax page's state and city PieChart breakdowns
// Images are generated per state/city and reused across all years

import { OG_SCREEN_HEIGHT, OG_SCREEN_WIDTH } from "@/constants/open-graph";
import { readTaxDataFromDisk } from "@/data-loaders/read-from-disk";
import { snakeToDashCase, snakeToTitleCase } from "@/utils/string-utils";
import type { BrowserContext } from "@playwright/test";
import { webkit } from "playwright";

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext();

  const { years, statesAndCitiesForYear } = await readTaxDataFromDisk(
    process.cwd() + "/src/data",
  );

  const ogImageRoute = "og-image";
  const taxTablesRoute = "tax-tables";
  const port = process.env.PORT || "3001";

  const basePath = process.cwd() + `/public/og-images`;

  // Generate support page image
  await screenshotPieChart(
    context,
    `http://localhost:${port}/support`,
    `${basePath}/support.png`,
  );

  // Generate disclaimer page image
  await screenshotPieChart(
    context,
    `http://localhost:${port}/disclaimer`,
    `${basePath}/disclaimer.png`,
  );

  // Generate landing page image (not year-specific)
  const currentYear = new Date().getFullYear().toString();
  await screenshotPieChart(
    context,
    `http://localhost:${port}/${ogImageRoute}`,
    `${basePath}/landing.png`,
  );
  await screenshotTaxTable(
    context,
    `http://localhost:${port}/${taxTablesRoute}`,
    `${basePath}/${taxTablesRoute}/landing.png`,
    currentYear,
    "Federal Income",
  );

  // One image for every comparison page. A representative pair shows the
  // feature; six hundred near-identical screenshots would not add anything.
  await screenshotPieChart(
    context,
    `http://localhost:${port}/compare/${years[0]}/california/vs/texas`,
    `${basePath}/compare.png`,
  );

  // Collect all unique states and cities across all years
  // Track the most recent year for each state and city combination
  const allStatesAndCities = new Map<string, Set<string>>();
  const stateYearMap = new Map<string, string>(); // state -> most recent year
  const cityYearMap = new Map<string, string>(); // state/city -> most recent year

  for (const year of years) {
    const statesAndCities = statesAndCitiesForYear[year];
    for (const [state, possibleCities] of Object.entries(statesAndCities)) {
      if (!allStatesAndCities.has(state)) {
        allStatesAndCities.set(state, new Set());
      }
      // Track the most recent year for this state (years are sorted newest first)
      if (!stateYearMap.has(state)) {
        stateYearMap.set(state, year);
      }

      if (possibleCities?.cities?.length) {
        for (const city of possibleCities.cities) {
          allStatesAndCities.get(state)?.add(city);
          // Track the most recent year for this city (years are sorted newest first)
          const cityKey = `${state}/${city}`;
          if (!cityYearMap.has(cityKey)) {
            cityYearMap.set(cityKey, year);
          }
        }
      }
    }
  }

  // Generate images for each unique state and city (not year-specific)
  for (const [state, cities] of Array.from(allStatesAndCities.entries())) {
    const stateDash = snakeToDashCase(state);
    const stateYear = stateYearMap.get(state) || currentYear;

    // Generate state-level images (using dash-case for filenames to match URLs)
    await screenshotPieChart(
      context,
      `http://localhost:${port}/${ogImageRoute}/${stateYear}/${stateDash}`,
      `${basePath}/${stateDash}.png`,
    );
    await screenshotTaxTable(
      context,
      `http://localhost:${port}/${taxTablesRoute}/${stateYear}/${stateDash}`,
      `${basePath}/${taxTablesRoute}/${stateDash}.png`,
      stateYear,
      state,
    );

    // Generate city-level images (using dash-case for filenames to match URLs)
    for (const city of Array.from(cities)) {
      const cityDash = snakeToDashCase(city);
      const cityKey = `${state}/${city}`;
      const cityYear = cityYearMap.get(cityKey) || stateYear;

      await screenshotPieChart(
        context,
        `http://localhost:${port}/${ogImageRoute}/${cityYear}/${stateDash}/${cityDash}`,
        `${basePath}/${stateDash}/${cityDash}.png`,
      );
      await screenshotTaxTable(
        context,
        `http://localhost:${port}/${taxTablesRoute}/${cityYear}/${stateDash}/${cityDash}`,
        `${basePath}/${taxTablesRoute}/${stateDash}/${cityDash}.png`,
        cityYear,
        city,
      );
    }
  }

  await browser.close();
})();

async function screenshotPieChart(
  context: BrowserContext,
  url: string,
  savePath: string,
) {
  console.log("Capturing screen for", url, "and saving to", savePath);
  const page = await context.newPage();
  try {
    await page.setViewportSize({
      width: OG_SCREEN_WIDTH,
      height: OG_SCREEN_HEIGHT,
    });
    await page.goto(url);
    await page.waitForTimeout(500);
    await page.screenshot({ path: savePath });
  } finally {
    // This runs a few hundred times; without closing, every page stays
    // resident in the one context for the whole run.
    await page.close();
  }
}

async function screenshotTaxTable(
  context: BrowserContext,
  url: string,
  savePath: string,
  year: string,
  selectionText: string,
) {
  const page = await context.newPage();
  try {
    await page.setViewportSize({
      width: OG_SCREEN_WIDTH,
      height: OG_SCREEN_HEIGHT,
    });
    await page.goto(url);
    await page.getByTestId("tax-year-select").locator("input").fill(year);

    // The select's own id is derived from its label, so it changed when the
    // label did and this stopped matching. The test id is what the e2e suite
    // targets and does not move with copy.
    await page.getByTestId("tax-options-select").click({ force: true });
    await page
      .getByRole("option")
      .filter({ hasText: snakeToTitleCase(selectionText) })
      ?.nth(0)
      .click();

    // The select sets disableCloseOnSelect so multiple tables can be picked in
    // one go. Left open, the option list covers the table this image exists to
    // show.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await page.screenshot({ path: savePath });
  } finally {
    await page.close();
  }
}
