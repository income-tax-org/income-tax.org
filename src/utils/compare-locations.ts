import { CITIES } from "@/constants";
import { ALL_STATES } from "@/constants/states";
import type { FilingStatus } from "@/constants/filing-status";
import type { SalesTaxData, TaxData } from "@/types";
import { calculate } from "./calculator";
import { standardDeductionFor } from "./standard-deduction";
import type { Money } from "./money";
import { subtract, toUnit } from "./money";
import { defaultTaxableSpending, estimateSalesTax } from "./sales-tax";
import {
  dashToSnakeCase,
  snakeToDashCase,
  snakeToTitleCase,
} from "./string-utils";

/** A place to compare: a state, optionally narrowed to one of its cities. */
export type ComparedLocation = {
  state: string;
  /** "" when comparing the state without a city's local taxes. */
  city: string;
};

export type ComparisonRow = {
  location: ComparedLocation;
  /** Stable key for React and for the URL. */
  id: string;
  label: string;
  takeHome: Money;
  totalTaxes: Money;
  /** Of gross income, 0-100. */
  effectiveRate: number;
  /**
   * Estimated sales tax on the year's taxable spending. Null when sales tax
   * is not being compared, or there is no sales tax data for the state.
   */
  salesTax: Money | null;
  /** Combined rate actually charged over the year, 0-100. */
  salesTaxRate: number;
  /** The taxable spending it was charged on: the user's, or the estimate. */
  spending: number;
  /** Take home less sales tax: what the ranking uses. */
  leftOver: Money;
  /** Dollars behind the best location in the set; 0 for the winner. */
  behindLeaderBy: number;
  federalResults: ReturnType<typeof calculate>["federalResults"];
  stateResults: ReturnType<typeof calculate>["stateResults"];
};

export function locationId({ state, city }: ComparedLocation): string {
  return city ? `${state}/${city}` : state;
}

export function labelFor({ state, city }: ComparedLocation): string {
  return city
    ? `${snakeToTitleCase(city)}, ${snakeToTitleCase(state)}`
    : snakeToTitleCase(state);
}

/** Serialised into `?locations=` as `oregon/portland,texas`. */
export function parseLocations(value: string | null): ComparedLocation[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [state, city = ""] = entry.split("/");
      return { state: dashToSnakeCase(state), city: dashToSnakeCase(city) };
    })
    .filter((location) => ALL_STATES.includes(location.state));
}

export function serialiseLocations(locations: ComparedLocation[]): string {
  return locations
    .map(({ state, city }) =>
      city
        ? `${snakeToDashCase(state)}/${snakeToDashCase(city)}`
        : snakeToDashCase(state),
    )
    .join(",");
}

/**
 * The state's own standard deduction for this filing status at this income.
 *
 * Carrying one number across locations is the trap here: applying Oregon's
 * $2,835 to Texas would quietly flatter whichever state the comparison
 * started from. Each location resolves its own.
 *
 * `income` matters because five states phase their deduction down as income
 * rises, so the same state answers differently at $40,000 and $140,000. Pass
 * income after retirement contributions, the proxy for AGI the schedules key
 * on.
 */
export function standardStateDeduction(
  stateTaxes: TaxData,
  filingStatus: FilingStatus,
  income: number,
): number | undefined {
  return standardDeductionFor(stateTaxes, filingStatus, income);
}

/** Cities that levy their own taxes in this state, for the location picker. */
export function citiesForState(stateTaxes: TaxData): string[] {
  return Object.keys(stateTaxes?.[CITIES] ?? {});
}

type BuildArgs = {
  locations: ComparedLocation[];
  /** Keyed by state name. */
  stateTaxesByState: Record<string, TaxData>;
  federalTaxes: TaxData;
  income: number;
  filingStatus: FilingStatus;
  totalIRA: number;
  /** Federal deductions are the same wherever you live. */
  federalDeductions: number | undefined;
  /**
   * Set to compare sales tax too. `dataByState` holds null for a state with
   * no sales tax data yet, which is charged nothing and flagged by the
   * row's null `salesTax`.
   */
  salesTax?: {
    /**
     * The user's own figure, for every location. Undefined estimates it per
     * location from that state's IRS table.
     */
    spending: number | undefined;
    year: number;
    dataByState: Record<string, SalesTaxData | null>;
  };
};

/**
 * Run the same calculation once per location and rank by take-home -- less
 * sales tax, when that is being compared.
 *
 * State deductions are deliberately not a parameter: see
 * standardStateDeduction above.
 */
export function buildComparison({
  locations,
  stateTaxesByState,
  federalTaxes,
  income,
  filingStatus,
  totalIRA,
  federalDeductions,
  salesTax,
}: BuildArgs): ComparisonRow[] {
  const rows = locations.flatMap((location) => {
    const stateTaxes = stateTaxesByState[location.state];
    if (!stateTaxes) return [];

    const result = calculate(
      federalTaxes,
      stateTaxes,
      income,
      filingStatus,
      totalIRA,
      federalDeductions,
      standardStateDeduction(
        stateTaxes,
        filingStatus,
        Math.max(0, income - totalIRA),
      ),
      [],
      location.state,
      location.city,
    );

    const salesTaxData = salesTax?.dataByState[location.state];
    const spending = salesTaxData
      ? salesTax.spending ??
        defaultTaxableSpending(salesTaxData, income, filingStatus) ??
        0
      : 0;
    const salesTaxEstimate = salesTaxData
      ? estimateSalesTax(salesTaxData, location.city, spending, salesTax.year)
      : null;
    const takeHome = result.takeHome.amount;

    return [
      {
        location,
        id: locationId(location),
        label: "",
        takeHome,
        totalTaxes: result.totalTaxes,
        effectiveRate:
          income > 0 ? (toUnit(result.totalTaxes) / income) * 100 : 0,
        salesTax: salesTaxEstimate?.tax ?? null,
        salesTaxRate: salesTaxEstimate?.effectiveRate ?? 0,
        spending,
        leftOver: salesTaxEstimate
          ? subtract(takeHome, salesTaxEstimate.tax)
          : takeHome,
        behindLeaderBy: 0,
        federalResults: result.federalResults,
        stateResults: result.stateResults,
      },
    ];
  });

  rows.sort((a, b) => toUnit(b.leftOver) - toUnit(a.leftOver));

  const leader = rows.length ? toUnit(rows[0].leftOver) : 0;
  return rows.map((row) => ({
    ...row,
    behindLeaderBy: leader - toUnit(row.leftOver),
  }));
}
