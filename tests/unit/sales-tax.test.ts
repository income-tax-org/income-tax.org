import { describe, it, expect } from "vitest";
import {
  defaultTaxableSpending,
  estimateSalesTax,
  salesTaxCitiesFor,
  salesTaxRatesFor,
  usesAverageLocalRate,
} from "@/utils/sales-tax";
import { toUnit } from "@/utils/money";
import { HEAD_OF_HOUSEHOLD, MARRIED, SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax_types";
import { SEATTLE, TACOMA } from "@/constants/cities";
import type { SalesTaxData, TaxableSpendingTable } from "@/types";
import washington2026 from "@/data/2026/sales-tax/state/washington";
import oregon2026 from "@/data/2026/sales-tax/state/oregon";
import spending2025 from "@/data/2025/sales-tax/taxable-spending";

const washington = washington2026 as SalesTaxData;
const oregon = oregon2026 as SalesTaxData;
const table = spending2025 as TaxableSpendingTable;

describe("salesTaxRatesFor", () => {
  it("adds the city's local rate to the state's", () => {
    // DOR code 1726: 6.5% state + 4.05% local, all of 2026.
    expect(salesTaxRatesFor(washington, SEATTLE)).toEqual([
      10.55, 10.55, 10.55, 10.55,
    ]);
  });

  it("follows a rate that changed mid-year", () => {
    // Tacoma raised its local rate on April 1 and again on July 1.
    const rates = salesTaxRatesFor(washington, TACOMA);
    [10.3, 10.4, 10.5, 10.5].forEach((rate, i) =>
      expect(rates[i]).toBeCloseTo(rate, 10),
    );
  });

  it("uses the statewide average local rate with no city, or an unlisted one", () => {
    const average = salesTaxRatesFor(washington, "");
    [9.51, 9.51, 9.57, 9.57].forEach((rate, i) =>
      expect(average[i]).toBeCloseTo(rate, 10),
    );
    expect(salesTaxRatesFor(washington, "not_a_listed_city")).toEqual(average);
  });

  it("is zero everywhere in Oregon, Portland included", () => {
    expect(salesTaxRatesFor(oregon, "portland")).toEqual([0, 0, 0, 0]);
  });
});

describe("estimateSalesTax", () => {
  it("charges a rate that held all year exactly", () => {
    const { tax, effectiveRate } = estimateSalesTax(
      washington,
      SEATTLE,
      10_000,
      2026,
    );
    expect(toUnit(tax)).toBe(1055);
    expect(effectiveRate).toBeCloseTo(10.55, 10);
  });

  it("weights each quarter's rate by its days", () => {
    // (10.3 x 90 + 10.4 x 91 + 10.5 x 92 + 10.5 x 92) / 365 = 10.42575...%,
    // not the 10.5% in force at year end.
    const { tax, effectiveRate } = estimateSalesTax(
      washington,
      TACOMA,
      10_000,
      2026,
    );
    expect(effectiveRate).toBeCloseTo(3805.4 / 365, 10);
    expect(toUnit(tax)).toBe(1042.58);
  });

  it("counts February 29 in a leap year", () => {
    const firstQuarterOnly: SalesTaxData = {
      [STATE_SALES_TAX]: [10, 0, 0, 0],
      [LOCAL_SALES_TAX]: 0,
    };
    expect(
      toUnit(estimateSalesTax(firstQuarterOnly, "", 36_600, 2024).tax),
    ).toBe(910);
    expect(
      toUnit(estimateSalesTax(firstQuarterOnly, "", 36_500, 2026).tax),
    ).toBe(900);
  });

  it("is nothing in Oregon", () => {
    expect(toUnit(estimateSalesTax(oregon, "", 50_000, 2026).tax)).toBe(0);
  });
});

describe("defaultTaxableSpending", () => {
  const spend = (income: number, status: string) =>
    defaultTaxableSpending(table, income, status as FilingStatus);

  it("divides the IRS table's tax by the rate it was computed at", () => {
    // $100,000-$120,000, family of one: $1,040 at 6.5%.
    expect(spend(100_000, SINGLE)).toBe(16_000);
  });

  it("counts a joint return, or head of household, as a family of two", () => {
    // $50,000-$60,000: $919 for two, against $802 for one.
    expect(spend(55_000, MARRIED)).toBe(Math.round(919 / 0.065));
    expect(spend(55_000, HEAD_OF_HOUSEHOLD)).toBe(spend(55_000, MARRIED));
    expect(spend(55_000, SINGLE)).toBe(Math.round(802 / 0.065));
  });

  it("reads bands as half-open, the way the table prints them", () => {
    expect(spend(19_999, SINGLE)).toBe(Math.round(430 / 0.065));
    expect(spend(20_000, SINGLE)).toBe(Math.round(594 / 0.065));
  });

  it("stops rising past the table's last row", () => {
    expect(spend(1_000_000, SINGLE)).toBe(Math.round(1790 / 0.065));
  });
});

describe("salesTaxCitiesFor", () => {
  it("lists a state's cities, and none for a state without data", () => {
    expect(salesTaxCitiesFor(washington)).toContain(SEATTLE);
    expect(salesTaxCitiesFor(oregon)).toEqual([]);
    expect(salesTaxCitiesFor(null)).toEqual([]);
  });
});

describe("usesAverageLocalRate", () => {
  it("is true where the statewide average stands in for a city's rate", () => {
    expect(usesAverageLocalRate(washington, "")).toBe(true);
    expect(usesAverageLocalRate(washington, "not_a_listed_city")).toBe(true);
    expect(usesAverageLocalRate(washington, SEATTLE)).toBe(false);
  });

  it("is false where the average is zero, which is exact", () => {
    expect(usesAverageLocalRate(oregon, "")).toBe(false);
  });
});
