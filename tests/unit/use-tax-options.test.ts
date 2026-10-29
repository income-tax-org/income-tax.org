/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTaxOptions } from "@/hooks/use-tax-options";
import type { TaxData } from "@/types";
import {
  MAX_401K_CONTRIBUTION,
  STANDARD_DEDUCTION,
  STATE_INCOME,
  FEDERAL_INCOME,
  SOCIAL_SECURITY,
  ART_TAX,
} from "@/constants/tax-types";
import { CITIES, CITY_SCOPE, FEDERAL_SCOPE, STATE_SCOPE } from "@/constants";
import { EMPTY_STANDARD_DEDUCTION_MAP } from "@/constants/filing-status";

const setFederalStandardDeductionMap = vi.fn();
const setStateStandardDeductionMap = vi.fn();
const setMax401KContribution = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function options(
  federalTaxes: TaxData,
  stateTaxes: TaxData,
  USAState = "oregon",
  USACity = "",
) {
  const { result } = renderHook(() =>
    useTaxOptions({
      federalTaxes,
      stateTaxes,
      USACity,
      USAState,
      setFederalStandardDeductionMap,
      setStateStandardDeductionMap,
      setMax401KContribution,
    }),
  );
  return result.current;
}

const deductionMap = {
  single: 16100,
  married: 32200,
  married_separately: 16100,
  head_of_household: 24150,
} as TaxData[string];

describe("useTaxOptions", () => {
  it("turns each tax type into a selectable option", () => {
    const result = options(
      { [FEDERAL_INCOME]: {}, [SOCIAL_SECURITY]: {} } as TaxData,
      {} as TaxData,
    );
    expect(result).toEqual([
      {
        title: "Federal Income",
        value: FEDERAL_INCOME,
        scope: FEDERAL_SCOPE,
        disabled: false,
      },
      {
        title: "Social Security",
        value: SOCIAL_SECURITY,
        scope: FEDERAL_SCOPE,
        disabled: false,
      },
    ]);
  });

  it("qualifies the state income tax with the state's name", () => {
    const result = options({} as TaxData, { [STATE_INCOME]: {} } as TaxData);
    expect(result).toEqual([
      {
        title: "Oregon State Income",
        value: STATE_INCOME,
        scope: STATE_SCOPE,
        disabled: false,
      },
    ]);
  });

  // The two bookkeeping keys are not taxes. They ride along in the same object
  // and are lifted out into component state rather than offered as options.
  it("lifts the standard deduction out instead of listing it", () => {
    const result = options(
      { [STANDARD_DEDUCTION]: deductionMap } as TaxData,
      { [STANDARD_DEDUCTION]: deductionMap } as TaxData,
    );
    expect(result).toEqual([]);
    expect(setFederalStandardDeductionMap).toHaveBeenCalledWith(deductionMap);
    expect(setStateStandardDeductionMap).toHaveBeenCalledWith(deductionMap);
  });

  it("lifts the 401k limit out instead of listing it", () => {
    const result = options(
      { [MAX_401K_CONTRIBUTION]: 24500 } as TaxData,
      {} as TaxData,
    );
    expect(result).toEqual([]);
    expect(setMax401KContribution).toHaveBeenCalledWith(24500);
  });

  describe("city taxes", () => {
    const stateWithCities = {
      [STATE_INCOME]: {},
      [CITIES]: {
        portland: { [ART_TAX]: {} },
        eugene: { employee_payroll_tax: {} },
      },
    } as unknown as TaxData;

    it("appends only the selected city's taxes, titled with the city", () => {
      const result = options(
        {} as TaxData,
        stateWithCities,
        "oregon",
        "portland",
      );
      expect(result).toEqual([
        {
          title: "Oregon State Income",
          value: STATE_INCOME,
          scope: STATE_SCOPE,
          disabled: false,
        },
        {
          title: "Portland Art Tax",
          value: ART_TAX,
          scope: CITY_SCOPE,
          disabled: false,
        },
      ]);
    });

    it("offers no city taxes when no city is selected", () => {
      const result = options({} as TaxData, stateWithCities, "oregon", "");
      expect(result.map((option) => option.value)).toEqual([STATE_INCOME]);
    });

    // Reachable by hand-editing the URL to a city the state does not tax.
    it("offers no city taxes for a city the state has no data for", () => {
      const result = options({} as TaxData, stateWithCities, "oregon", "salem");
      expect(result.map((option) => option.value)).toEqual([STATE_INCOME]);
    });

    // A city and its state can use the same tax-type key. The key alone cannot
    // say which one an option means, so `scope` carries the jurisdiction and
    // the calculator matches exemptions against it.
    it("scopes a city option separately from a state option of the same key", () => {
      const result = options(
        {} as TaxData,
        {
          occupational_tax: {},
          [CITIES]: { birmingham: { occupational_tax: {} } },
        } as unknown as TaxData,
        "alabama",
        "birmingham",
      );
      expect(result.map((option) => [option.value, option.scope])).toEqual([
        ["occupational_tax", STATE_SCOPE],
        ["occupational_tax", CITY_SCOPE],
      ]);
    });

    it("keeps city options last, after federal and state", () => {
      const result = options(
        { [FEDERAL_INCOME]: {} } as TaxData,
        stateWithCities,
        "oregon",
        "portland",
      );
      expect(result.map((option) => option.value)).toEqual([
        FEDERAL_INCOME,
        STATE_INCOME,
        ART_TAX,
      ]);
    });
  });

  /**
   * Fifteen states declare no standard deduction, and the map used to be
   * reported only when a file had the key -- so the previous state's figure
   * survived an in-session switch and was then applied. New York to
   * Pennsylvania charged $2,824.40 instead of $3,070.00 at $100,000, with the
   * field still captioned "Standard deduction for 2025". A fresh load was
   * fine, which is what kept it hidden.
   */
  describe("the standard deduction map after a state switch", () => {
    const withDeduction = { [STANDARD_DEDUCTION]: deductionMap } as TaxData;
    const withoutDeduction = { [STATE_INCOME]: {} } as TaxData;

    it("reports the state's own figure when it has one", () => {
      options({} as TaxData, withDeduction);
      expect(setStateStandardDeductionMap).toHaveBeenCalledWith(deductionMap);
    });

    it("reports an empty map for a state that declares none", () => {
      options({} as TaxData, withoutDeduction);
      expect(setStateStandardDeductionMap).toHaveBeenCalledWith(
        EMPTY_STANDARD_DEDUCTION_MAP,
      );
    });

    it("does not leave the previous state's figure standing", () => {
      // The switch itself: whatever was reported for the state with a
      // deduction must not still be the last word after moving to one without.
      options({} as TaxData, withDeduction);
      vi.clearAllMocks();
      options({} as TaxData, withoutDeduction);

      expect(setStateStandardDeductionMap).toHaveBeenCalledTimes(1);
      expect(setStateStandardDeductionMap).not.toHaveBeenCalledWith(
        deductionMap,
      );
      expect(setStateStandardDeductionMap).toHaveBeenCalledWith(
        EMPTY_STANDARD_DEDUCTION_MAP,
      );
    });

    it("reports the same object each time, so React can bail out", () => {
      // Called unconditionally now, so a changing identity would loop.
      options({} as TaxData, withoutDeduction);
      options({} as TaxData, withoutDeduction);
      const [first] = setStateStandardDeductionMap.mock.calls[0];
      const [second] = setStateStandardDeductionMap.mock.calls[1];
      expect(first).toBe(second);
    });
  });

  it("survives missing tax data", () => {
    expect(
      options(undefined as unknown as TaxData, undefined as unknown as TaxData),
    ).toEqual([]);
  });
});
