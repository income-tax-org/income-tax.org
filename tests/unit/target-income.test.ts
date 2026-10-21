import { describe, it, expect } from "vitest";
import {
  MAX_SOLVABLE_INCOME_CENTS,
  solveForIncome,
} from "@/utils/target-income";
import type { TakeHomeAt } from "@/utils/target-income";
import { runCalculate, runTarget } from "@/mcp/run";
import { calculateInput, targetInput } from "@/mcp/inputs";
import type { CalculateInput, TargetInput } from "@/mcp/inputs";

const SITE = "https://income-tax.org";

/** A flat 25% tax: take-home is 75% of gross, rounded down to the cent. */
const flat: TakeHomeAt = (cents) => Math.floor(cents * 0.75);

describe("solveForIncome", () => {
  it("finds the lowest cent that reaches the target", () => {
    const solution = solveForIncome(flat, 7_500_000);
    expect(solution?.incomeCents).toBe(10_000_000);
    expect(flat(solution!.incomeCents)).toBeGreaterThanOrEqual(7_500_000);
    expect(flat(solution!.incomeCents - 1)).toBeLessThan(7_500_000);
  });

  it("answers zero when nothing is needed", () => {
    expect(solveForIncome(flat, 0)?.incomeCents).toBe(0);
  });

  it("returns null for an unreachable target", () => {
    const capped: TakeHomeAt = (cents) => Math.min(flat(cents), 100);
    expect(solveForIncome(capped, 1_000)).toBeNull();
  });

  // A $200 fee switching on at $50,000 makes take-home dip, so there are two
  // incomes where it crosses $37,450: just under the threshold, and again
  // once the extra salary has paid the fee off. Plain bisection can land on
  // the second. The answer must be the first.
  it("finds the crossing before a dip, not after it", () => {
    const withFee: TakeHomeAt = (cents) =>
      flat(cents) - (cents >= 5_000_000 ? 20_000 : 0);
    const target = 3_745_000;
    const solution = solveForIncome(withFee, target)!;
    expect(solution.incomeCents).toBe(4_993_334);
    expect(withFee(solution.incomeCents)).toBeGreaterThanOrEqual(target);
  });

  it("stays well inside the CPU budget", () => {
    const solution = solveForIncome(flat, 50_000_000)!;
    // Each evaluation is one run of the calculator, about 0.06ms.
    expect(solution.evaluations).toBeLessThan(80);
  });

  it("caps the search", () => {
    expect(MAX_SOLVABLE_INCOME_CENTS).toBe(10_000_000_000);
  });
});

const target = (args: Record<string, unknown>) =>
  runTarget(targetInput.parse(args) as TargetInput, SITE);
const calc = (args: Record<string, unknown>) =>
  runCalculate(calculateInput.parse(args) as CalculateInput, SITE);

describe("runTarget against real tax data", () => {
  const locations = [
    { state: "texas" },
    { state: "new_york", city: "new_york_city" },
    { state: "oregon", city: "portland" },
    { state: "ohio", city: "columbus" },
    { state: "maryland", city: "baltimore_city" },
    { state: "kentucky", city: "louisville" },
    { state: "california" },
  ];
  const scenarios = [
    { take_home: 60_000 },
    { take_home: 150_000, filing_status: "married" },
    { take_home: 4_000, target_period: "biweekly" },
    { take_home: 80_000, retirement_contribution: 15_000 },
    { take_home: 70_000, federal_deductions: 30_000, state_deductions: 5_000 },
  ];

  for (const location of locations) {
    for (const scenario of scenarios) {
      it(`round-trips ${JSON.stringify({ ...location, ...scenario })}`, async () => {
        const args = { ...location, ...scenario };
        const solved = await target(args);
        const annualTarget = solved.target.annual_take_home;

        // The answer reaches the target...
        expect(solved.result.take_home.annual).toBeGreaterThanOrEqual(
          annualTarget,
        );
        // ...and agrees with a plain calculate call at that income...
        const check = await calc({
          ...location,
          ...scenario,
          income: solved.required_gross_income,
          take_home: undefined,
          target_period: undefined,
        });
        expect(check.take_home.annual).toBe(solved.result.take_home.annual);
        // ...and one cent less falls short.
        const below = await calc({
          ...location,
          ...scenario,
          income: solved.required_gross_income - 0.01,
          take_home: undefined,
          target_period: undefined,
        });
        expect(below.take_home.annual).toBeLessThan(annualTarget);
      });
    }
  }

  it("converts a per-paycheck target to annual", async () => {
    const solved = await target({
      state: "texas",
      take_home: 5_000,
      target_period: "monthly",
    });
    expect(solved.target.annual_take_home).toBe(60_000);
  });
});
