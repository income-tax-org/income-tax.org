import { test, expect } from "@playwright/test";

test("shows the marginal rate alongside the effective rate", async ({
  page,
}) => {
  await page.goto("/2025/oregon/portland/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const effective = page.getByTestId("effective-tax-rate");
  const marginal = page.getByTestId("marginal-tax-rate");
  await expect(effective).toBeVisible();
  await expect(marginal).toBeVisible();

  const asNumber = async (locator: typeof effective) =>
    Number(((await locator.textContent()) ?? "").replace(/[^0-9.]/g, ""));

  // The whole point of showing both: on a progressive schedule the next
  // dollar is taxed higher than the average of all the ones before it.
  expect(await asNumber(marginal)).toBeGreaterThan(await asNumber(effective));
});

test("the bracket ladder marks the band the last dollar lands in", async ({
  page,
}) => {
  await page.goto("/2025/oregon/portland/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await expect(
    page.getByRole("heading", { name: "Tax brackets" }),
  ).toBeVisible();
  await expect(page.locator('dt[aria-current="true"]')).toHaveCount(1);
});

test("the marginal rate falls at the Social Security wage base", async ({
  page,
}) => {
  const rateAt = async (income: number) => {
    await page.goto(`/2025/oregon/portland/?income=${income}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(1200);
    const text = await page.getByTestId("marginal-tax-rate").textContent();
    return Number((text ?? "").replace(/[^0-9.]/g, ""));
  };

  // 6.2% stops applying above the 2025 base of $176,100.
  const below = await rateAt(170000);
  const above = await rateAt(180000);
  expect(above).toBeLessThan(below);
});

test("the ladder can show any schedule in the calculation", async ({
  page,
}) => {
  await page.goto("/2025/oregon/portland/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const picker = page.locator("#bracket-schedule-select");
  await expect(picker).toContainText("Federal Income");

  // Portland levies two of its own banded taxes on top of Oregon's.
  await picker.click();
  await page.getByRole("option", { name: "Preschool for All (City)" }).click();
  await page.waitForTimeout(400);

  // Both of its bands, and the amount matching the breakdown above.
  await expect(page.getByText("$125,000 – $250,000")).toBeVisible();
  await expect(page.getByText("$250,000+")).toBeVisible();
  await expect(page.getByText("$1,832.48")).toHaveCount(2);
});

test("a state's own bands are available too", async ({ page }) => {
  await page.goto("/2025/oregon/portland/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await page.locator("#bracket-schedule-select").click();
  await page.getByRole("option", { name: "Oregon State Income" }).click();
  await page.waitForTimeout(400);

  // Oregon's top band, which a $250,000 income reaches. Exact: the page's
  // introduction quotes the same rate inside a sentence.
  await expect(page.getByText("9.9%", { exact: true })).toBeVisible();
  await expect(page.locator('dt[aria-current="true"]')).toHaveCount(1);
});

test("a payroll tax shows its wage base as a band ceiling", async ({
  page,
}) => {
  await page.goto("/2025/oregon/portland/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  await page.locator("#bracket-schedule-select").click();
  await page.getByRole("option", { name: "Social Security" }).click();
  await page.waitForTimeout(400);

  // The wage base shows up as the band's ceiling.
  await expect(page.getByText("$0 – $176,100")).toBeVisible();
});

test("a state with no bands of its own is simply not offered", async ({
  page,
}) => {
  await page.goto("/2025/texas/?income=250000", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);

  const picker = page.locator("#bracket-schedule-select");
  await picker.click();
  await expect(page.getByRole("option", { name: /Texas/ })).toHaveCount(0);
  // Federal schedules are still there.
  await expect(
    page.getByRole("option", { name: "Federal Income" }),
  ).toHaveCount(1);
});
