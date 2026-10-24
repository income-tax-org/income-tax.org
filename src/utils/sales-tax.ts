import { CITIES, INFINITY } from "@/constants";
import type { FilingStatus } from "@/constants/filing-status";
import { HEAD_OF_HOUSEHOLD, MARRIED } from "@/constants/filing-status";
import { LOCAL_SALES_TAX, STATE_SALES_TAX } from "@/constants/tax_types";
import type { SalesTaxData, SalesTaxRate, TaxableSpendingTable } from "@/types";
import type { Money } from "./money";
import { asCurrency, percentage } from "./money";

type Quarterly = [number, number, number, number];

function quarterly(rate: SalesTaxRate): Quarterly {
  return typeof rate === "number" ? [rate, rate, rate, rate] : rate;
}

/**
 * Days in each calendar quarter of `year`, so a rate that changed mid-year is
 * weighted by how long it was in force. Q1 is 90 or 91 days, Q3 92.
 */
function daysPerQuarter(year: number): Quarterly {
  const days = (fromMonth: number, toMonth: number) =>
    (Date.UTC(year, toMonth, 1) - Date.UTC(year, fromMonth, 1)) / 86_400_000;
  return [days(0, 3), days(3, 6), days(6, 9), days(9, 12)];
}

/**
 * Combined state and local rate for each quarter, in percent.
 *
 * A city the file does not list falls back to the state's average local rate,
 * the same as picking no city: every Washington location levies some local
 * tax, so the state rate alone would understate all of them.
 */
export function salesTaxRatesFor(
  salesTax: SalesTaxData,
  city: string,
): Quarterly {
  const state = quarterly(salesTax[STATE_SALES_TAX]);
  const local = quarterly(
    salesTax[CITIES]?.[city]?.[LOCAL_SALES_TAX] ?? salesTax[LOCAL_SALES_TAX],
  );
  return state.map((rate, i) => rate + local[i]) as Quarterly;
}

export type SalesTaxEstimate = {
  tax: Money;
  /** The year's combined rates weighted by days, in percent. */
  effectiveRate: number;
};

/**
 * Sales tax on a year's taxable spending, spread evenly across the year.
 *
 * Each quarter's share of the spending is charged at that quarter's rate.
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
  const days = daysPerQuarter(year);
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
 * A starting estimate of a year's taxable spending, in whole dollars.
 *
 * The IRS table's sales tax for this income and family size, divided by the
 * rate the table was computed at. The table's income is AGI plus nontaxable
 * receipts; gross income is passed as the nearest figure on hand.
 */
export function defaultTaxableSpending(
  table: TaxableSpendingTable,
  income: number,
  filingStatus: FilingStatus,
): number {
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
    quarterly(salesTax[LOCAL_SALES_TAX]).some((rate) => rate > 0)
  );
}

/** Cities with their own sales tax rate, for the location picker. */
export function salesTaxCitiesFor(salesTax: SalesTaxData | null): string[] {
  return Object.keys(salesTax?.[CITIES] ?? {});
}
