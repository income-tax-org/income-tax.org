// Input schemas shared by the MCP tools and the /api GET routes.
//
// Kept free of transforms and preprocessing: the MCP server advertises these
// as JSON Schema in tools/list, and a transform has no JSON Schema form.
// Normalising loose spellings ("New York", "new-york") is done before
// validation instead, by normalizeKey below and the query-string parser in
// ./http.

import { z } from "zod";
import { CITY_SCOPE, FEDERAL_SCOPE, STATE_SCOPE } from "@/constants";
import { FILING_STATUSES, SINGLE } from "@/constants/filing-status";
import type { FilingStatus } from "@/constants/filing-status";
import { MONTHLY, PAYCHECK_FREQUENCIES } from "@/constants/paycheck-frequency";
import type { PaycheckFrequency } from "@/constants/paycheck-frequency";
import { ALL_STATES } from "@/constants/states";
import { YEARS } from "@/data-loaders/registry";

export const ANNUAL = "annual";

/**
 * Upper bound on every dollar input. Far past any real income, but low enough
 * that the cent math stays well inside Number.MAX_SAFE_INTEGER; 1e300 used to
 * reach the calculator and fail as a 500.
 */
export const MAX_DOLLARS = 1_000_000_000_000;

type NonEmpty = [string, ...string[]];

/** "New York", "new-york" and "NEW_YORK" all become "new_york". */
export function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

const commonFields = {
  state: z
    .enum(ALL_STATES as NonEmpty)
    .describe(
      "US state, or district_of_columbia, in snake_case, e.g. new_york. States without an income tax (texas, florida, ...) are valid.",
    ),
  city: z
    .string()
    .optional()
    .describe(
      "Optional city or county with its own local taxes, in snake_case, e.g. new_york_city. Omit for state-level taxes only. An unknown city returns the list of valid ones for the state.",
    ),
  year: z
    .enum(YEARS as NonEmpty)
    .optional()
    .describe(`Tax year. Defaults to the latest available, ${YEARS[0]}.`),
  filing_status: z
    .enum(FILING_STATUSES as NonEmpty)
    .default(SINGLE)
    .describe("Federal and state filing status."),
  retirement_contribution: z
    .number()
    .min(0)
    .max(MAX_DOLLARS)
    .default(0)
    .describe(
      "Annual pre-tax 401(k) / traditional IRA contribution in dollars. Reduces income tax but not FICA or other payroll taxes, and is subtracted from take-home. Capped at the year's 401(k) limit.",
    ),
  federal_deductions: z
    .number()
    .min(0)
    .max(MAX_DOLLARS)
    .optional()
    .describe(
      "Total federal deductions in dollars (itemized, or any custom figure). Omit to use the standard deduction for the filing status.",
    ),
  state_deductions: z
    .number()
    .min(0)
    .max(MAX_DOLLARS)
    .optional()
    .describe(
      "Total state deductions in dollars. Omit to use the state's own standard deduction, including states that phase it out with income.",
    ),
  exempt_taxes: z
    .array(
      z.object({
        tax: z
          .string()
          .describe("Tax-type key, e.g. social_security or city_income."),
        scope: z.enum([FEDERAL_SCOPE, STATE_SCOPE, CITY_SCOPE]),
      }),
    )
    .default([])
    .describe(
      "Taxes the filer is exempt from, e.g. [{ tax: 'social_security', scope: 'federal' }]. An unknown key returns the list of valid keys for the location.",
    ),
  pay_frequency: z
    .enum(PAYCHECK_FREQUENCIES as NonEmpty)
    .default(MONTHLY)
    .describe("Used to report per-paycheck amounts alongside annual ones."),
};

export const calculateInput = z.object({
  income: z
    .number()
    .min(0)
    .max(MAX_DOLLARS)
    .describe("Annual gross income in dollars."),
  ...commonFields,
});

export const targetInput = z.object({
  take_home: z
    .number()
    .positive()
    .max(MAX_DOLLARS)
    .describe(
      "Desired take-home pay in dollars, after all taxes and the retirement contribution, per target_period.",
    ),
  target_period: z
    .enum([ANNUAL, ...PAYCHECK_FREQUENCIES] as NonEmpty)
    .default(ANNUAL)
    .describe(
      "Whether take_home is a yearly figure or a per-paycheck one (weekly, biweekly, semi_monthly, monthly).",
    ),
  ...commonFields,
});

/**
 * The parsed shape, with the enums narrowed back to the app's own types.
 * Zod infers plain strings because the constant arrays are not `as const`.
 */
type Narrowed<T> = Omit<T, "filing_status" | "pay_frequency"> & {
  filing_status: FilingStatus;
  pay_frequency: PaycheckFrequency;
};

export type CalculateInput = Narrowed<z.output<typeof calculateInput>>;
export type TargetInput = Narrowed<z.output<typeof targetInput>>;

export const taxTablesInput = z.object({
  year: commonFields.year,
  state: commonFields.state
    .optional()
    .describe(
      "US state in snake_case, e.g. new_york. Omit for federal tables only.",
    ),
  city: z
    .string()
    .optional()
    .describe(
      "Optional city or county, e.g. new_york_city, to include its local tables, or a city with its own sales tax rate, e.g. seattle. Without one, the response lists the state's cities so you can ask again.",
    ),
  filing_status: z
    .enum(FILING_STATUSES as NonEmpty)
    .optional()
    .describe(
      "Return only the schedules for this filing status. Omit for all four.",
    ),
  tax_types: z
    .array(z.string())
    .optional()
    .describe(
      "Return only these tax types, e.g. ['federal_income', 'state_income'], or ['sales_tax'] for the state's sales tax rates alone. Omit for all. Unknown keys return the valid ones.",
    ),
});

export type TaxTablesInput = Omit<
  z.output<typeof taxTablesInput>,
  "filing_status"
> & { filing_status?: FilingStatus };
