import { CITIES, INFINITY } from "@/constants";
import type { FilingStatus } from "@/constants/filing-status";
import { HEAD_OF_HOUSEHOLD, MARRIED } from "@/constants/filing-status";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData, SalesTaxRate } from "@/types";
import type { Money } from "./money";
import { asCurrency, percentage } from "./money";

const MONTHS = Array.from({ length: 12 }, (_, month) => month);

/** The rate in force each month, whichever way the file wrote it. */
function monthly(rate: SalesTaxRate): number[] {
  if (typeof rate === "number") return MONTHS.map(() => rate);
  // Quarterly: each quarter's rate for its three months.
  if (rate.length === 4) return MONTHS.map((month) => rate[(month / 3) | 0]);
  return rate;
}

/**
 * Days in each month of `year`, so a rate that changed mid-year is weighted by
 * how long it was in force.
 */
function daysPerMonth(year: number): number[] {
  return MONTHS.map(
    (month) =>
      (Date.UTC(year, month + 1, 1) - Date.UTC(year, month, 1)) / 86_400_000,
  );
}

/**
 * Combined state and local rate for each month, in percent.
 *
 * A city the file does not list falls back to the state's average local rate,
 * the same as picking no city: every Washington location levies some local
 * tax, so the state rate alone would understate all of them.
 */
export function salesTaxRatesFor(
  salesTax: SalesTaxData,
  city: string,
): number[] {
  const state = stateSalesTaxRates(salesTax);
  const local = localSalesTaxRates(salesTax, city);
  return state.map((rate, i) => rate + local[i]);
}

/** The state's own rate for each month, in percent. */
export function stateSalesTaxRates(salesTax: SalesTaxData): number[] {
  return monthly(salesTax[STATE_SALES_TAX]);
}

/**
 * The local rate on top of the state's for each month, in percent: the
 * city's own, or the state's average for a city the file does not list.
 */
export function localSalesTaxRates(
  salesTax: SalesTaxData,
  city: string,
): number[] {
  return monthly(
    salesTax[CITIES]?.[city]?.[LOCAL_SALES_TAX] ?? salesTax[LOCAL_SALES_TAX],
  );
}

/** A run of months at one rate. Months are 0 to 11, both ends included. */
export type SalesTaxPeriod = {
  firstMonth: number;
  lastMonth: number;
  rate: number;
};

/**
 * Twelve monthly rates as the runs of months they held for: one period for a
 * rate that held all year, more where it changed.
 *
 * Rounded to four places, which is past any published rate, so that
 * Colorado's 2.9 plus Arvada's 5.06 reads 7.96 rather than 7.959999999999999.
 */
export function salesTaxPeriods(monthlyRates: number[]): SalesTaxPeriod[] {
  const periods: SalesTaxPeriod[] = [];
  monthlyRates.forEach((value, month) => {
    const rate = Math.round(value * 10_000) / 10_000;
    const last = periods.at(-1);
    if (last && last.rate === rate) {
      last.lastMonth = month;
    } else {
      periods.push({ firstMonth: month, lastMonth: month, rate });
    }
  });
  return periods;
}

export type SalesTaxEstimate = {
  tax: Money;
  /** The year's combined rates weighted by days, in percent. */
  effectiveRate: number;
};

/**
 * Sales tax on a year's taxable spending, spread evenly across the year.
 *
 * Each month's share of the spending is charged at that month's rate.
 * Tacoma's rate rose twice in 2026; charging the whole year at the October
 * rate would overstate it. The rates are averaged by days and the tax rounded
 * once, so a rate that held all year gives exactly spending times rate.
 */
export function estimateSalesTax(
  salesTax: SalesTaxData,
  city: string,
  spending: number,
  year: number,
): SalesTaxEstimate {
  const rates = salesTaxRatesFor(salesTax, city);
  const days = daysPerMonth(year);
  const daysInYear = days.reduce((sum, d) => sum + d, 0);
  const effectiveRate = rates.reduce(
    (sum, rate, i) => sum + (rate * days[i]) / daysInYear,
    0,
  );
  return {
    tax: percentage(asCurrency(spending), effectiveRate),
    effectiveRate,
  };
}

/**
 * The IRS table has a column per family size; the calculator models no
 * dependents, so this is the filer and a spouse on a joint return. Head of
 * household requires a qualifying person, so it counts as two as well.
 */
function familySizeFor(filingStatus: FilingStatus): number {
  return filingStatus === MARRIED || filingStatus === HEAD_OF_HOUSEHOLD ? 2 : 1;
}

/**
 * A starting estimate of a year's taxable spending in this state, in whole
 * dollars. Undefined for a state with no sales tax, and so no IRS table.
 *
 * The state's IRS table's sales tax for this income and family size, divided
 * by the rate the table was computed at. Each state's own table, because tax
 * bases differ: Alabama taxes groceries, Washington does not, and the same
 * household has more taxable spending in the first. The table's income is AGI
 * plus nontaxable receipts; gross income is passed as the nearest figure on
 * hand.
 */
export function defaultTaxableSpending(
  salesTax: SalesTaxData,
  income: number,
  filingStatus: FilingStatus,
): number | undefined {
  const table = salesTax[TAXABLE_SPENDING];
  if (!table) return undefined;
  const band =
    table.bands.find(
      (b) =>
        income >= b.min && (b.max === INFINITY || income < (b.max as number)),
    ) ?? table.bands[0];
  const amount = band.amounts[familySizeFor(filingStatus) - 1];
  return Math.round(amount / (table.rate / 100));
}

/**
 * Whether this location is charged the state's average local rate rather
 * than a city's own: no city picked, or one the file does not list. False
 * where that average is zero, as in Oregon, since there it is exact.
 */
export function usesAverageLocalRate(
  salesTax: SalesTaxData,
  city: string,
): boolean {
  return (
    !salesTax[CITIES]?.[city] &&
    monthly(salesTax[LOCAL_SALES_TAX]).some((rate) => rate > 0)
  );
}

/** Cities with their own sales tax rate, for the location picker. */
export function salesTaxCitiesFor(salesTax: SalesTaxData | null): string[] {
  return Object.keys(salesTax?.[CITIES] ?? {});
}
