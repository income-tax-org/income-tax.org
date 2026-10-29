/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { calculate } from "@/utils/calculator";
import { collectBracketSchedules } from "@/utils/bracket-schedules";
import { tableDataFromTaxData } from "@/utils/tax-table-data";
import { toUnit } from "@/utils/money";
import { SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import {
  CAPITAL_GAINS,
  DC_PAID_FAMILY_LEAVE,
  EMPLOYEE_PAYROLL_TAX,
  EMPLOYER_PAYROLL_TAX,
  INTEREST_AND_DIVIDENDS,
  NON_WAGE_TAX_TYPES,
  STATE_INCOME,
} from "@/constants/tax-types";
import { CITIES, INFINITY } from "@/constants";
import { NEWARK } from "@/constants/cities";
import { ALL } from "@/constants/filing-status";
import { renderHook } from "@testing-library/react";
import { useTaxOptions } from "@/hooks/use-tax-options";
import type { TaxData } from "@/types";
import fed2023 from "@/data/2023/federal";
import fed2026 from "@/data/2026/federal";
import newHampshire2023 from "@/data/2023/state/new_hampshire";
import washington2026 from "@/data/2026/state/washington";
import districtOfColumbia2026 from "@/data/2026/state/district_of_columbia";

/**
 * Washington taxes long-term capital gains and New Hampshire taxed interest
 * and dividends. Neither taxes wages, and this calculator only knows about
 * wages. Charging them made a $60,000 New Hampshire salary owe $2,304 of tax
 * in a state with no wage tax at all.
 */
const stateTaxOn = (
  income: number,
  federal: TaxData,
  state: TaxData,
  stateName: string,
) =>
  toUnit(
    calculate(
      federal,
      state,
      income,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      stateName,
      "",
    ).totalState.amount,
  );

describe("taxes that are not levied on wages", () => {
  it("charges New Hampshire no wage tax at all", () => {
    for (const income of [5_000, 60_000, 456_533]) {
      expect(
        stateTaxOn(
          income,
          fed2023 as TaxData,
          newHampshire2023 as TaxData,
          "new_hampshire",
        ),
      ).toBe(0);
    }
  });

  it("charges Washington only its long-term care premium", () => {
    // 0.58% of gross, and nothing else -- not the capital gains tax, whose
    // threshold a large salary would otherwise cross.
    expect(
      stateTaxOn(
        60_000,
        fed2026 as TaxData,
        washington2026 as TaxData,
        "washington",
      ),
    ).toBeCloseTo(348, 2);
    expect(
      stateTaxOn(
        456_533,
        fed2026 as TaxData,
        washington2026 as TaxData,
        "washington",
      ),
    ).toBeCloseTo(2_647.89, 2);
  });

  it("leaves them out of the results entirely", () => {
    const results = calculate(
      fed2026 as TaxData,
      washington2026 as TaxData,
      456_533,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      "washington",
      "",
    );
    expect(Object.keys(results.stateResults)).not.toContain(CAPITAL_GAINS);
  });

  it("does not offer them as bracket ladders", () => {
    const keys = collectBracketSchedules({
      federalTaxes: fed2026 as TaxData,
      stateTaxes: washington2026 as TaxData,
      USAState: "washington",
      USACity: "",
      filingStatus: SINGLE as FilingStatus,
      grossIncome: 456_533,
      federalTaxableIncome: 440_433,
      stateTaxableIncome: 456_533,
    }).map((schedule) => schedule.key);
    expect(keys).not.toContain(`state:${CAPITAL_GAINS}`);
    expect(keys).toContain("state:washington_cares_fund");
  });

  it("still documents them in the tax tables", () => {
    // They are real taxes; the reference pages should keep showing them.
    const table = tableDataFromTaxData(
      CAPITAL_GAINS,
      (washington2026 as TaxData)[CAPITAL_GAINS],
    );
    expect(table.rows.length).toBeGreaterThan(0);

    const nhTable = tableDataFromTaxData(
      INTEREST_AND_DIVIDENDS,
      (newHampshire2023 as TaxData)[INTEREST_AND_DIVIDENDS],
    );
    expect(nhTable.rows.length).toBeGreaterThan(0);
  });
});

/**
 * An employer-borne tax is the second reason a tax lands in
 * NON_WAGE_TAX_TYPES, and it is a different one: Newark's payroll tax *is*
 * levied on wages, so the base is right. N.J.S.A. 40:48C-15 simply puts it on
 * the employer -- the return is filed against a FEIN, and a resident's
 * residency reduces their employer's bill rather than creating one of their
 * own. Charging it cost a Newark resident about $1,000 a year at $100,000.
 */
describe("a payroll tax borne by the employer", () => {
  const stateWithEmployerTax = {
    [STATE_INCOME]: { [ALL]: [{ min: 0, max: INFINITY, rate: 2 }] },
    [CITIES]: {
      [NEWARK]: {
        [EMPLOYER_PAYROLL_TAX]: {
          [ALL]: [{ min: 0, max: INFINITY, rate: 1 }],
        },
      },
    },
  } as unknown as TaxData;

  const results = () =>
    calculate(
      {} as TaxData,
      stateWithEmployerTax,
      100_000,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      "new_jersey",
      NEWARK,
    );

  // The guard reaches a city tax only because calculateTaxesPerBracket
  // recurses into itself, so the second pass hits the same check.
  it("is not charged, even nested under a city", () => {
    expect(toUnit(results().totalCity.amount)).toBe(0);
    expect(
      Object.keys((results().stateResults.cities ?? {}) as object),
    ).not.toContain(EMPLOYER_PAYROLL_TAX);
  });

  it("is not offered as something to exempt", () => {
    // Nothing to exempt from a tax that is never charged.
    const { result } = renderHook(() =>
      useTaxOptions({
        federalTaxes: {} as TaxData,
        stateTaxes: stateWithEmployerTax,
        USACity: NEWARK,
        USAState: "new_jersey",
        setFederalStandardDeductionMap: () => {},
        setStateStandardDeductionMap: () => {},
        setMax401KContribution: () => {},
        excludeNonWageTaxes: true,
      }),
    );
    expect(result.current.map((option) => option.value)).not.toContain(
      EMPLOYER_PAYROLL_TAX,
    );
  });

  it("is not drawn as a bracket ladder", () => {
    const keys = collectBracketSchedules({
      federalTaxes: {} as TaxData,
      stateTaxes: stateWithEmployerTax,
      USAState: "new_jersey",
      USACity: NEWARK,
      filingStatus: SINGLE as FilingStatus,
      grossIncome: 100_000,
      federalTaxableIncome: 100_000,
      stateTaxableIncome: 100_000,
    }).map((schedule) => schedule.key);
    expect(keys).not.toContain(`city:${EMPLOYER_PAYROLL_TAX}`);
  });

  it("is still documented in the tax tables", () => {
    const table = tableDataFromTaxData(
      EMPLOYER_PAYROLL_TAX,
      (stateWithEmployerTax[CITIES] as any)[NEWARK][EMPLOYER_PAYROLL_TAX],
    );
    expect(table.rows.length).toBeGreaterThan(0);
  });

  // Two names two characters apart with opposite behaviour. Eugene's is
  // withheld from the employee and is charged; Newark's is not.
  it("does not drag the employee payroll tax down with it", () => {
    expect(NON_WAGE_TAX_TYPES).toContain(EMPLOYER_PAYROLL_TAX);
    expect(NON_WAGE_TAX_TYPES).not.toContain(EMPLOYEE_PAYROLL_TAX);
  });
});

/**
 * D.C.'s paid family leave is the employer's, not the employee's.
 *
 * D.C. Code 32-541.03(a): "A covered employer shall contribute an amount equal
 * to 0.75% of the wages of each of its covered employees to the District", and
 * the programme describes the benefit as available to employees "whose
 * employer pays the PFL tax". Nothing is withheld from the worker. Charging it
 * cost a DC filer $750 a year at $100,000 -- the same shape as Newark, in a
 * second place.
 */
describe("DC paid family leave", () => {
  const dcResults = (income: number) =>
    calculate(
      fed2026 as TaxData,
      districtOfColumbia2026 as TaxData,
      income,
      SINGLE as FilingStatus,
      0,
      undefined,
      undefined,
      [],
      "district_of_columbia",
      "",
    );

  it("is not charged", () => {
    const results = dcResults(100_000);
    expect(Object.keys(results.stateResults)).not.toContain(
      DC_PAID_FAMILY_LEAVE,
    );
  });

  it("does not silently remove the rest of DC's tax", () => {
    // The point is to stop charging one tax, not to empty the state.
    expect(toUnit(dcResults(100_000).totalState.amount)).toBeGreaterThan(0);
  });

  it("is still documented in the tax tables", () => {
    const table = tableDataFromTaxData(
      DC_PAID_FAMILY_LEAVE,
      (districtOfColumbia2026 as TaxData)[DC_PAID_FAMILY_LEAVE],
    );
    expect(table.rows.length).toBeGreaterThan(0);
  });
});
