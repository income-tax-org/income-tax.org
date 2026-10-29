import { describe, it, expect } from "vitest";
import {
  buildBracketLadder,
  getMarginalRate,
  MARGINAL_WINDOW,
} from "@/utils/marginal-rate";
import { calculate } from "@/utils/calculator";
import { withExemptionCreditPinned } from "@/utils/standard-deduction";
import { toUnit } from "@/utils/money";
import { INFINITY } from "@/constants";
import { ALL, SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import type { RateBracket, TaxData } from "@/types";
import type { Money } from "@/utils/money";
import { OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE } from "@/constants/tax-types";
import federal2025 from "@/data/2025/federal";
import oregon2025 from "@/data/2025/state/oregon";

const portlandTaxAt = (income: number) =>
  toUnit(
    calculate(
      federal2025 as TaxData,
      oregon2025 as TaxData,
      income,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      "oregon",
      "portland",
    ).totalTaxes,
  );

describe("getMarginalRate", () => {
  it("reports a flat rate on a flat schedule", () => {
    const flat = (income: number) => income * 0.25;
    const { percent, spansRateChange } = getMarginalRate(flat, 50_000);
    expect(percent).toBeCloseTo(25, 6);
    expect(spansRateChange).toBe(false);
  });

  it("resolves finer than a whole percent", () => {
    // A $1 window would quantise this to 27% or 28%; the point of the
    // hundred-dollar window is that it does not.
    const odd = (income: number) => Math.round(income * 0.2745 * 100) / 100;
    expect(getMarginalRate(odd, 80_000).percent).toBeCloseTo(27.45, 1);
  });

  it("flags a window that spans a rate change", () => {
    const stepAt = (income: number) =>
      income <= 50_000 ? income * 0.1 : 5_000 + (income - 50_000) * 0.3;
    expect(getMarginalRate(stepAt, 49_950).spansRateChange).toBe(true);
    expect(getMarginalRate(stepAt, 60_000).spansRateChange).toBe(false);
  });

  it("flags a flat fee switching on inside the window", () => {
    const withFee = (income: number) =>
      income * 0.1 + (income >= 20_000 ? 35 : 0);
    expect(getMarginalRate(withFee, 19_950).spansRateChange).toBe(true);
  });

  it("honours a custom window", () => {
    const flat = (income: number) => income * 0.4;
    expect(getMarginalRate(flat, 1_000, 1_000).percent).toBeCloseTo(40, 6);
    expect(MARGINAL_WINDOW).toBe(100);
  });

  describe("against real tax data", () => {
    it("rises with income", () => {
      const low = getMarginalRate(portlandTaxAt, 50_000).percent;
      const high = getMarginalRate(portlandTaxAt, 400_000).percent;
      expect(high).toBeGreaterThan(low);
    });

    it("falls at the Social Security wage base", () => {
      // 6.2% stops applying above the 2025 base of $176,100, so the next
      // dollar is cheaper than the one before it -- the one place a
      // progressive system runs backwards.
      const below = getMarginalRate(portlandTaxAt, 170_000).percent;
      const above = getMarginalRate(portlandTaxAt, 180_000).percent;
      expect(above).toBeLessThan(below - 5);
    });

    it("stays within a sane range", () => {
      // Not 100,000: that is exactly Oregon's exemption-credit cliff, tested
      // on its own below.
      for (const income of [1_000, 25_000, 90_000, 250_000, 1_000_000]) {
        const { percent } = getMarginalRate(portlandTaxAt, income);
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThan(100);
      }
    });

    it("flags Oregon's exemption-credit cliff at $100,000", () => {
      // A single filer loses the whole $256 credit once federal AGI is more
      // than $100,000, so the next $100 costs far more than $100 of tax. That
      // is the law, not an error, and the window says it spans a change.
      const atCliff = getMarginalRate(portlandTaxAt, 100_000);
      expect(atCliff.spansRateChange).toBe(true);
      expect(atCliff.percent).toBeGreaterThan(100);
    });

    it("measures the brackets, not the cliff, with the credit pinned", () => {
      // What the results page does: hold the credit this income qualifies for.
      const pinned = withExemptionCreditPinned(
        oregon2025 as TaxData,
        SINGLE as FilingStatus,
        100_000,
      );
      const pinnedTaxAt = (income: number) =>
        toUnit(
          calculate(
            federal2025 as TaxData,
            pinned,
            income,
            SINGLE as FilingStatus,
            0,
            undefined,
            undefined,
            [],
            "oregon",
            "portland",
          ).totalTaxes,
        );
      const atCliff = getMarginalRate(pinnedTaxAt, 100_000);
      expect(atCliff.percent).toBeLessThan(60);
      expect(atCliff.percent).toBeCloseTo(
        getMarginalRate(portlandTaxAt, 99_000).percent,
        0,
      );
    });
  });
});

describe("buildBracketLadder", () => {
  const brackets: RateBracket[] = [
    { min: 0, max: 10_000, rate: 10 },
    { min: 10_000, max: 40_000, rate: 20 },
    { min: 40_000, max: INFINITY, rate: 30 },
  ];

  it("slices income across brackets", () => {
    const ladder = buildBracketLadder(brackets, 25_000);
    expect(ladder.map((s) => s.amountInBracket)).toEqual([10_000, 15_000, 0]);
    expect(ladder.map((s) => s.taxFromBracket)).toEqual([1_000, 3_000, 0]);
  });

  it("marks the bracket the last dollar lands in", () => {
    expect(
      buildBracketLadder(brackets, 25_000).map((s) => s.isCurrent),
    ).toEqual([false, true, false]);
    expect(buildBracketLadder(brackets, 5_000).map((s) => s.isCurrent)).toEqual(
      [true, false, false],
    );
  });

  it("puts income above the top threshold in the open-ended bracket", () => {
    const ladder = buildBracketLadder(brackets, 100_000);
    expect(ladder[2].amountInBracket).toBe(60_000);
    expect(ladder[2].isCurrent).toBe(true);
    expect(ladder[2].max).toBeNull();
  });

  it("fills no bracket at zero income", () => {
    const ladder = buildBracketLadder(brackets, 0);
    expect(ladder.every((s) => s.amountInBracket === 0)).toBe(true);
    expect(ladder.every((s) => !s.isCurrent)).toBe(true);
  });

  it("does not depend on the order given", () => {
    const shuffled = [brackets[2], brackets[0], brackets[1]];
    expect(buildBracketLadder(shuffled, 25_000).map((s) => s.min)).toEqual([
      0, 10_000, 40_000,
    ]);
  });
});

/**
 * A tax split with the employer shows the employee's share, as the
 * calculation charges it.
 *
 * Oregon Paid Family and Medical Leave is `rate: 1, percent_of_total: 60`.
 * The ladder used to draw the full 1%, so it said $1,000 at $100,000 against
 * the $600 actually charged -- disagreeing with the breakdown table directly
 * above it. `tax-table-data.ts` already got this right via its "Employee
 * Portion" column; only the ladder did not.
 */
describe("buildBracketLadder and percent_of_total", () => {
  const splitTax: RateBracket[] = [
    { min: 0, max: 176_100, rate: 1, percent_of_total: 60 },
  ];

  it("applies the employee share to the tax it reports", () => {
    const [step] = buildBracketLadder(splitTax, 100_000);
    expect(step.amountInBracket).toBe(100_000);
    expect(step.taxFromBracket).toBeCloseTo(600, 6);
  });

  it("still reports the published rate, which is not the employee's share", () => {
    // The rate column shows what the statute says; the money column shows
    // what comes out of the paycheck.
    const [step] = buildBracketLadder(splitTax, 100_000);
    expect(step.rate).toBe(1);
  });

  it("leaves an unsplit tax alone", () => {
    const [step] = buildBracketLadder(
      [{ min: 0, max: INFINITY, rate: 5 }],
      100_000,
    );
    expect(step.taxFromBracket).toBeCloseTo(5_000, 6);
  });

  it("agrees with what the calculator charges", () => {
    // The invariant that matters: the ladder's own total must match the bill.
    const results = calculate(
      federal2025,
      oregon2025 as TaxData,
      100_000,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      "oregon",
      "",
    );
    const schedule = (oregon2025 as TaxData)[
      OREGON_PAID_FAMILY_AND_MEDICAL_LEAVE
    ] as Record<string, RateBracket[]>;
    const laddered = buildBracketLadder(schedule[ALL], 100_000).reduce(
      (total, step) => total + step.taxFromBracket,
      0,
    );
    expect(laddered).toBeCloseTo(
      toUnit(
        results.stateResults
          .oregon_paid_family_and_medical_leave as unknown as Money,
      ),
      2,
    );
  });
});
