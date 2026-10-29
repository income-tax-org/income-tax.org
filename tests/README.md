# End-to-End (E2E) Tests

The [`e2e/`](./e2e/) directory contains end-to-end tests for the income tax calculator using [Playwright](https://playwright.dev/).

For information about **unit tests**, see [`tests/unit/README.md`](./unit/README.md).

## Overview

The E2E tests verify the complete user experience by:

1. **Testing in real browsers** - Chromium and Mobile Chrome (Firefox/Safari available but commented out)
2. **Validating user interactions** - Form inputs, navigation, URL routing, and query parameters
3. **Ensuring visual elements** - Page titles, headings, and calculated results are displayed correctly
4. **Cross-page flows** - Navigation between Calculator, Tax Tables, and Support pages

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with interactive UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm test
```

## Test Configuration

The Playwright configuration is defined in `playwright.config.ts`:

- **Base URL**: `http://127.0.0.1:3001`
- **Test Directory**: `tests/e2e/` (`*.spec.ts`)
- **Web Server**: Started automatically. Locally this is the Next.js dev
  server (`npm run dev:test`), reusing one already running if there is one. On
  CI (`CI=1`) it serves the built static export instead (`npm run start:test`),
  so the suite tests what actually ships rather than a dev build
- **Browsers**:
  - Desktop Chrome (Chromium)
  - Mobile Chrome (Pixel 5)
- **CI Settings**: Runs serially with 2 retries on CI, parallel locally

## Test Files

### `calculator.spec.ts`

Tests the main calculator functionality:

- ✅ Page title and heading display
- ✅ Tax calculations for different years (2023, 2024)
- ✅ Income input updates calculations
- ✅ State and city selection (Oregon, Portland)
- ✅ Year changes update calculated amounts
- ✅ Proper result rendering and formatting

**Key Test Pattern:**

```typescript
// Set year first to avoid defaulting to current year
await page.getByTestId("tax-year-select").locator("input").fill("2023");
await page.fill("input#state-select", "Oregon");
await page.fill("input#city-select", "Portland");
await page.fill("input#total-income", "100000");

// Verify calculated result
await expect(page.getByTestId("total-take-home-amount")).toHaveText(
  "$69,136.03",
);
```

### `nav.spec.ts`

Tests navigation between pages:

- ✅ Navigation via nav drawer (hamburger menu)
- ✅ Navigation via footer links
- ✅ Proper page titles and headings after navigation
- ✅ Navigation between: Calculator ↔ Tax Tables ↔ Support

**Test Coverage:**

- Opens nav drawer with `button#open-nav-drawer`
- Clicks navigation buttons/links
- Verifies URL changes and page content

### `routing.spec.ts`

Tests URL routing, query parameters, and browser history:

#### Calculator Routing Tests

- ✅ Income changes update `?income=` query param (using `replaceState`, not added to history)
- ✅ Year changes update path (`/2024`, `/2023`, `/` for current year)
- ✅ State/city selections create proper URLs (`/2024/oregon/portland`)
- ✅ Current year with state/city shows year in path (`/2025/oregon`)
- ✅ Income query param persists across navigation changes
- ✅ All paths are dash-cased, not snake-cased
- ✅ Browser back/forward navigation works correctly

#### Tax Tables Routing Tests

- ✅ Year changes update path (`/tax-tables/2024`)
- ✅ State and city selections update URL
- ✅ Tax type selections show as `?tables=` query param (dash-cased)
- ✅ Multiple tax selections are comma-separated in query param
- ✅ Browser back/forward navigation preserves state
- ✅ Clearing state removes state from path but keeps year and tables param

**Example URL Patterns:**

```
/                              # Current year, no location
/2024                          # Specific year
/2024/oregon                   # Year + state
/2024/oregon/portland          # Year + state + city
/2024/oregon?income=100000     # With income query param
/tax-tables/2023/oregon/portland?tables=federal-income,oregon-state-income
```

### `tax-tables.spec.ts`

Tests the tax tables page:

- ✅ Page title and heading display
- ✅ Federal tax bracket display for different years
- ✅ State-specific tax display (Oregon)
- ✅ City-specific tax display (Portland Art Tax)
- ✅ Multiple tax tables displayed simultaneously
- ✅ Tax deduction data display (Standard Federal Deductions)

**Key Interaction Pattern:**

```typescript
// Select year
await page.getByTestId("tax-year-select").locator("input").fill("2023");

// Select state and city
await page.fill("input#state-select", "Oregon");
await page.fill("input#city-select", "Portland");

// Select tax type to display
await page.locator("input#tax-options-select").click({ force: true });
await page.getByRole("option").filter({ hasText: "Portland Art Tax" }).click();

// Verify table content
await expect(
  page.locator("tr#portland_art_tax_row_0").locator("td").nth(2),
).toHaveText("Fixed $35");
```

## Common Test Patterns

### Waiting for UI Updates

Tests use strategic waits to ensure UI has updated:

```typescript
await page.waitForTimeout(500); // Brief wait for UI update
await page.waitForURL("**/2024/**"); // Wait for navigation
await page.waitForSelector('[data-testid="total-take-home-amount"]', {
  state: "visible",
});
```

### Selecting from Autocomplete/Combobox

```typescript
// For combobox with roles (Tax Tables year select)
await page.getByRole("combobox", { name: "Tax Year" }).click();
await page.getByRole("option", { name: "2024" }).click();

// For input autocomplete (state/city)
await page.fill("input#state-select", "Oregon");
```

### Testing Multi-Select Dropdowns

```typescript
// Click to open dropdown
await page.locator("input#tax-options-select").click({ force: true });

// Type to filter options
await page.keyboard.type("Oregon");

// Select from filtered results
await page
  .getByRole("option")
  .filter({ hasText: "Oregon State Income" })
  .click();
```

## Best Practices

1. **Select year first** - Avoid defaulting to current year which may not have stable test data
2. **Use stable data years** - 2023 and 2024 have complete, stable tax data
3. **Close dropdowns** - Press `Escape` to close dropdowns before interacting with other elements
4. **Force clicks when needed** - Use `{ force: true }` for MUI components that may have overlays
5. **Wait for navigation** - Use `waitForURL()` to ensure routing completes before assertions

## Debugging

### View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Run Tests in UI Mode

Interactive mode with time-travel debugging:

```bash
npm run test:e2e:ui
```

### Run Specific Test File

```bash
npx playwright test calculator.spec.ts
```

### Run in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Enable Debug Mode

```bash
npx playwright test --debug
```

## CI/CD Considerations

On CI environments:

- Tests run serially (`workers: 1`) to avoid resource contention
- 2 retries for flaky tests (`retries: 2`)
- Only Chromium and Mobile Chrome run (Firefox/Safari commented out for speed)
- Test reports are generated as HTML artifacts

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Unit Tests README](./unit/README.md)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
