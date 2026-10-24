import { describe, it, expect } from "vitest";
import {
  buildComparison,
  citiesForState,
  locationId,
  standardStateDeduction,
} from "@/utils/compare-locations";
import { toUnit } from "@/utils/money";
import { SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import type { SalesTaxData, TaxData } from "@/types";
import federal2025 from "@/data/2025/federal";
import wisconsin2025 from "@/data/2025/state/wisconsin";
import oregon2025 from "@/data/2025/state/oregon";
import texas2025 from "@/data/2025/state/texas";
import washington2025 from "@/data/2025/state/washington";
import washingtonSalesTax2025 from "@/data/2025/sales-tax/state/washington";
import oregonSalesTax2025 from "@/data/2025/sales-tax/state/oregon";

const stateTaxesByState: Record<string, TaxData> = {
  oregon: oregon2025 as TaxData,
  texas: texas2025 as TaxData,
  washington: washington2025 as TaxData,
};

const compare = (
  locations: { state: string; city: string }[],
  income = 150_000,
) =>
  buildComparison({
    locations,
    stateTaxesByState,
    federalTaxes: federal2025 as TaxData,
    income,
    filingStatus: SINGLE as FilingStatus,
    totalIRA: 0,
    federalDeductions: undefined,
  });

describe("locationId", () => {
  it("distinguishes a state from a city inside it", () => {
    expect(locationId({ state: "oregon", city: "" })).toBe("oregon");
    expect(locationId({ state: "oregon", city: "portland" })).toBe(
      "oregon/portland",
    );
  });
});

describe("standardStateDeduction", () => {
  it("reads the state's own figure", () => {
    expect(
      standardStateDeduction(oregon2025 as TaxData, SINGLE as FilingStatus, 0),
    ).toBe(2835);
  });

  it("is undefined for a state that has none", () => {
    expect(
      standardStateDeduction(texas2025 as TaxData, SINGLE as FilingStatus, 0),
    ).toBeUndefined();
  });

  // Oregon's is one number at every income. Wisconsin's is not, and each
  // compared location has to be asked at the income being compared.
  it("resolves a phased-out deduction at the given income", () => {
    const at = (income: number) =>
      standardStateDeduction(
        wisconsin2025 as TaxData,
        SINGLE as FilingStatus,
        income,
      );
    expect(at(19_549)).toBe(13_560);
    expect(at(100_000)).toBe(3_906);
    expect(at(200_000)).toBe(0);
  });

  it("stays flat for Oregon whatever the income", () => {
    for (const income of [0, 100_000, 400_000]) {
      expect(
        standardStateDeduction(
          oregon2025 as TaxData,
          SINGLE as FilingStatus,
          income,
        ),
      ).toBe(2835);
    }
  });
});

describe("citiesForState", () => {
  it("lists the cities that levy their own taxes", () => {
    expect(citiesForState(oregon2025 as TaxData)).toContain("portland");
    expect(citiesForState(texas2025 as TaxData)).toEqual([]);
  });
});

describe("buildComparison", () => {
  it("ranks by take home, best first", () => {
    const rows = compare([
      { state: "oregon", city: "portland" },
      { state: "texas", city: "" },
      { state: "washington", city: "" },
    ]);
    const takeHomes = rows.map((r) => toUnit(r.takeHome));
    expect(takeHomes).toEqual([...takeHomes].sort((a, b) => b - a));
    // No state income tax in Texas, so it cannot lose to Oregon.
    expect(rows[rows.length - 1].id).toBe("oregon/portland");
  });

  it("reports how far each location is behind the leader", () => {
    const rows = compare([
      { state: "oregon", city: "portland" },
      { state: "texas", city: "" },
    ]);
    expect(rows[0].behindLeaderBy).toBe(0);
    expect(rows[1].behindLeaderBy).toBeGreaterThan(0);
    expect(rows[1].behindLeaderBy).toBeCloseTo(
      toUnit(rows[0].takeHome) - toUnit(rows[1].takeHome),
      2,
    );
  });

  it("uses each state's own standard deduction, not one carried across", () => {
    // Oregon's $2,835 must not be applied to Texas. Texas has no state income
    // tax, so its take home is gross minus federal and FICA only -- if a
    // foreign deduction leaked in, the figure would not match a direct run.
    const [texasRow] = compare([{ state: "texas", city: "" }]);
    const oregonDeductionApplied = buildComparison({
      locations: [{ state: "texas", city: "" }],
      stateTaxesByState,
      federalTaxes: federal2025 as TaxData,
      income: 150_000,
      filingStatus: SINGLE as FilingStatus,
      totalIRA: 0,
      federalDeductions: undefined,
    });
    expect(toUnit(texasRow.takeHome)).toBe(
      toUnit(oregonDeductionApplied[0].takeHome),
    );
  });

  it("separates a city from its state", () => {
    const rows = compare([
      { state: "oregon", city: "" },
      { state: "oregon", city: "portland" },
    ]);
    const bare = rows.find((r) => r.id === "oregon");
    const portland = rows.find((r) => r.id === "oregon/portland");
    // Portland's local taxes are on top of Oregon's, so it must take home less.
    expect(toUnit(portland!.takeHome)).toBeLessThan(toUnit(bare!.takeHome));
  });

  it("skips locations whose data has not loaded yet", () => {
    const rows = compare([
      { state: "texas", city: "" },
      { state: "hawaii", city: "" },
    ]);
    expect(rows.map((r) => r.id)).toEqual(["texas"]);
  });

  it("gives an effective rate of zero at zero income rather than NaN", () => {
    const [row] = compare([{ state: "texas", city: "" }], 0);
    expect(Number.isNaN(row.effectiveRate)).toBe(false);
    expect(row.effectiveRate).toBe(0);
  });
});

describe("buildComparison with sales tax", () => {
  const withSalesTax = (
    locations: { state: string; city: string }[],
    spending: number | undefined,
  ) =>
    buildComparison({
      locations,
      stateTaxesByState,
      federalTaxes: federal2025 as TaxData,
      income: 150_000,
      filingStatus: SINGLE as FilingStatus,
      totalIRA: 0,
      federalDeductions: undefined,
      salesTax: {
        spending,
        year: 2025,
        dataByState: {
          washington: washingtonSalesTax2025 as SalesTaxData,
          oregon: oregonSalesTax2025 as SalesTaxData,
          texas: null,
        },
      },
    });

  it("takes the sales tax out of take home", () => {
    const [seattle] = withSalesTax(
      [{ state: "washington", city: "seattle" }],
      20_000,
    );
    // 6.5% + Seattle's 3.85%, all of 2025.
    expect(toUnit(seattle.salesTax!)).toBe(2070);
    expect(toUnit(seattle.leftOver)).toBeCloseTo(
      toUnit(seattle.takeHome) - 2070,
      2,
    );
  });

  it("charges Oregon nothing", () => {
    const [oregon] = withSalesTax([{ state: "oregon", city: "" }], 20_000);
    expect(toUnit(oregon.salesTax!)).toBe(0);
    expect(toUnit(oregon.leftOver)).toBe(toUnit(oregon.takeHome));
  });

  it("ranks on what is left after sales tax", () => {
    const locations = [
      { state: "oregon", city: "" },
      { state: "washington", city: "seattle" },
    ];
    // On take home alone Washington wins: it has no income tax.
    expect(withSalesTax(locations, 0)[0].id).toBe("washington/seattle");
    // Spend enough and Seattle's 10.35% costs more than Oregon's income tax.
    const rows = withSalesTax(locations, 200_000);
    expect(rows[0].id).toBe("oregon");
    expect(rows[1].behindLeaderBy).toBeCloseTo(
      toUnit(rows[0].leftOver) - toUnit(rows[1].leftOver),
      2,
    );
  });

  it("estimates each location's spending from its own state's table", () => {
    const [seattle, oregon] = withSalesTax(
      [
        { state: "washington", city: "seattle" },
        { state: "oregon", city: "" },
      ],
      undefined,
    );
    // Washington's 2025 table, $140,000-$160,000, family of one: $1,171 at
    // 6.5%. Oregon has no table, and nothing to estimate.
    expect(seattle.spending).toBe(Math.round(1171 / 0.065));
    expect(oregon.spending).toBe(0);
  });

  it("applies the user's figure to every location alike", () => {
    const rows = withSalesTax(
      [
        { state: "washington", city: "seattle" },
        { state: "oregon", city: "" },
      ],
      12_345,
    );
    expect(rows.map((row) => row.spending)).toEqual([12_345, 12_345]);
  });

  it("flags a state with no sales tax data rather than charging it", () => {
    const [texas] = withSalesTax([{ state: "texas", city: "" }], 20_000);
    expect(texas.salesTax).toBeNull();
    expect(toUnit(texas.leftOver)).toBe(toUnit(texas.takeHome));
  });
});
