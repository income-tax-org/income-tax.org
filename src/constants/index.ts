import type { TaxFrequency } from "@/types";
import { WEEKLY, BIWEEKLY, SEMI_MONTHLY, MONTHLY } from "./paycheck-frequency";

export const INFINITY = "Infinity";

// Single source of truth lives in ./cities, alongside the city name
// constants the tax-data files use. Re-exported here so app code can keep
// importing it from "@/constants".
export { CITIES } from "./cities";

export const EXEMPT = "exempt";

export const ANNUALLY = "annually";

// How many times a year a tax-data `frequency` recurs. Distinct from
// FREQUENCY_TO_PAYCHECKS_PER_YEAR, which drives the paycheck-frequency picker:
// this one also covers `annually`, which tax data may declare but nobody
// selects as a pay schedule.
export const TAX_FREQUENCY_PERIODS_PER_YEAR: Record<TaxFrequency, number> = {
  [WEEKLY]: 52,
  [BIWEEKLY]: 26,
  [SEMI_MONTHLY]: 24,
  [MONTHLY]: 12,
  [ANNUALLY]: 1,
};

// Which income figure a rate schedule or flat-fee threshold is measured
// against. "gross" is true wages: before deductions and before any pre-tax
// retirement contribution.
export const GROSS_INCOME_BASIS = "gross";
export const TAXABLE_INCOME_BASIS = "taxable";
export const INCOME_BASES = [GROSS_INCOME_BASIS, TAXABLE_INCOME_BASIS];

/**
 * Charged on the computed state income tax rather than on any income figure.
 *
 * Yonkers' resident surcharge is the case: IT-201 line 55 is 16.75% of the
 * New York State tax, not of the income that tax was worked out from. Writing
 * it as an income schedule would mean copying the state's own brackets into a
 * second place, where the next rate change would silently miss them.
 *
 * Only a rate schedule can use it, and only a city's -- a state tax charged on
 * itself is meaningless. Flat fees keep to INCOME_BASES.
 */
export const STATE_INCOME_TAX_BASIS = "state_income_tax";
export const TAX_BASES = [...INCOME_BASES, STATE_INCOME_TAX_BASIS];

// How a bracket schedule turns income into tax; see scheduleKind in
// utils/calculator. The values are also the `kind` /api/tax-tables reports.
export const MARGINAL_SCHEDULE = "marginal";
export const RATE_ON_TOTAL_SCHEDULE = "rate_on_total";
export const BASE_AMOUNT_SCHEDULE = "base_amount";
export const FLAT_FEE_SCHEDULE = "flat_fee";

// Which jurisdiction a selectable tax option belongs to.
//
// Federal and state tax-type keys share one namespace and are matched together;
// a city's keys are its own, so that exempting a city tax cannot also exempt a
// federal or state tax that happens to use the same key.
export const FEDERAL_SCOPE = "federal";
export const STATE_SCOPE = "state";
export const CITY_SCOPE = "city";
