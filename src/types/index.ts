import type { FilingStatus } from "../constants/filing-status";
import type { ALL } from "../constants/filing-status";
import type {
  FEDERAL_INCOME,
  FEDERAL_TAX_SUBTRACTION,
  LOCAL_SALES_TAX,
  MAX_401K_CONTRIBUTION,
  NONE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
  STATE_SALES_TAX,
} from "../constants/tax_types";
import type { CITIES, EXEMPT, INFINITY } from "../constants";
import type { Money } from "@/utils/money";
import type { ReactElement } from "react";

export type TaxFrequency =
  | "annually"
  | "monthly"
  | "semi_monthly"
  | "biweekly"
  | "weekly";

// Which income figure a tax is measured against. Defaults per tax type -- see
// grossIncomeTaxes in utils/calculator.ts -- and per bracket where a schedule
// overrides it.
export type IncomeBasis = "gross" | "taxable";

/**
 * What a rate schedule is charged on. Either of the income figures, or -- for
 * Yonkers' resident surcharge -- the computed state income tax itself.
 */
export type TaxBasis = IncomeBasis | "state_income_tax";

export type RateBracket = {
  min: number;
  max: number | typeof INFINITY;
  rate: number;
  // Employee share of a split payroll tax, e.g. 60 = 60% employee / 40% employer
  percent_of_total?: number;
  // Turns the schedule into a rate lookup rather than a marginal one: min/max
  // select which rate applies, and that rate is charged on the whole income
  // base. Set on every bracket of such a schedule. Eugene's payroll tax only.
  rate_on_total?: true;
  // Overrides the tax type's default income base. Read from the first bracket.
  basis?: TaxBasis;
  /**
   * Tax already owed at this bracket's floor, charged in full the moment
   * income passes it.
   *
   * Ohio's schedule is published in this form -- "$342.00 plus 2.750% of the
   * amount in excess of $26,050" -- and the base is not the cumulative total
   * of the bands below it. ORC 5747.02(A)(3) charges nothing at $26,050 and
   * $342.03 at $26,051, so the tax function genuinely steps. A marginal
   * schedule is continuous by construction and cannot express that.
   *
   * Set on every bracket of such a schedule, 0 on the ones below the first
   * threshold; the calculator reads it off the first. See
   * isBaseAmountSchedule in utils/calculator.
   */
  base_amount?: number;
};

export type FlatFeeBracket = {
  amount: number;
  // Income at or above which the fee is owed
  min?: number;
  frequency?: TaxFrequency;
  basis?: IncomeBasis;
};

export type Bracket = RateBracket | FlatFeeBracket;

/**
 * One row of a published standard-deduction schedule.
 *
 * Five states shrink the deduction as income rises, so a single number cannot
 * express what they allow. A band is one row of the state's own schedule: the
 * income range it covers, the amount at the top of that range, and how the
 * amount falls across it.
 *
 * Bands are half-open, `[min, max)`, and contiguous the same way rate brackets
 * are -- one band's `max` is the next one's `min`. A schedule that publishes
 * "over $19,549 but not over $132,549" is written `min: 19550, max: 132550`.
 *
 * A band needs no reduction at all, which is how a **cliff** is written -- a
 * deduction allowed in full up to a threshold and not at all above it, rather
 * than tapering across a range. Illinois disallows its exemption allowance
 * entirely above $250,000 of base income ("you are not entitled to an
 * exemption allowance on Line 10. Enter 'zero'"), which is:
 *
 * ```ts
 * [
 *   { min: 0, max: 250_000, amount: 2_850 },
 *   { min: 250_000, max: INFINITY, amount: 0 },
 * ]
 * ```
 *
 * This is a distinct case from a taper and worth looking for by name; the two
 * simply happen to share a representation.
 */
export type DeductionBand = {
  min: number;
  max: number | typeof INFINITY;
  /** The deduction at `reduce_from`, before this band's reduction. */
  amount: number;
  /**
   * Income the reduction is measured from. Defaults to `min`, which is what
   * the published schedules almost always use. Wisconsin's head-of-household
   * schedule is the exception: past the crossover it switches to the single
   * taxpayer's formula and keeps measuring from the *first* threshold, so that
   * band carries a `reduce_from` well below its own `min`.
   */
  reduce_from?: number;
  /**
   * Percent of the excess over `reduce_from`. For schedules published as a
   * rate -- Wisconsin's "$13,560 less 12%", Connecticut's dollar-per-dollar
   * taper.
   */
  reduce_rate?: number;
  /**
   * Stepped reduction: every whole `reduce_per` of excess costs `reduce_by`.
   * For schedules published as a chart of increments -- Alabama's "$175 for
   * each $500". Mutually exclusive with `reduce_rate`.
   */
  reduce_per?: number;
  reduce_by?: number;
  /**
   * The deduction is this percentage of income, clamped into
   * `[floor, amount]` -- a schedule that *rises* with income rather than
   * phasing out. Montana through tax year 2023: "20% of Montana AGI", floored
   * at $2,460 and capped at $5,540. Mutually exclusive with the reduction
   * fields.
   */
  percent_of_income?: number;
  /**
   * The least this band allows. Defaults to 0. Alabama floors at $5,000, and
   * a percentage-of-income schedule floors at its statutory minimum.
   */
  floor?: number;
};

/**
 * What a jurisdiction allows a filing status: a flat amount, or a schedule
 * that varies with income. Roughly forty states use the flat form.
 */
export type StandardDeduction = number | DeductionBand[];

export type StandardDeductionByFilingStatus = {
  [Key in FilingStatus]: StandardDeduction;
};

/**
 * One tax's bracket list. Uniform in kind: a schedule is either all rate
 * brackets or all flat fees, never a mix. Modelling it as a union of arrays
 * rather than an array of unions is what lets `isFlatFeeSchedule` narrow it.
 */
export type BracketSchedule = RateBracket[] | FlatFeeBracket[];

export type BracketsByFilingStatus =
  | { [Key in FilingStatus]?: BracketSchedule }
  | { [ALL]?: BracketSchedule };

export interface TaxData {
  [MAX_401K_CONTRIBUTION]?: number;
  [STANDARD_DEDUCTION]?: StandardDeductionByFilingStatus;
  /**
   * Cap on the federal income tax a state lets filers subtract. Same shape as
   * a standard deduction: a number, or bands chosen by income. Oregon's
   * published table is stepped, so its bands carry no reduction fields.
   */
  [FEDERAL_TAX_SUBTRACTION]?: StandardDeductionByFilingStatus;
  [FEDERAL_INCOME]?: BracketsByFilingStatus;
  [STATE_INCOME]?: BracketsByFilingStatus | typeof NONE;
  [CITIES]?: {
    [Key: string]: {
      [Key: string]: BracketsByFilingStatus;
    };
  };
  // Every other tax type (social_security, medicare, oregon_transit_tax, the
  // state payroll taxes, …). Without this the data files can only typecheck
  // behind an `as TaxData` assertion, which suppresses all checking.
  [taxType: string]:
    | number
    | StandardDeductionByFilingStatus
    | BracketsByFilingStatus
    | TaxData[typeof CITIES]
    | typeof NONE
    | undefined;
}

export type TaxResults = {
  [Key: string]: Money | typeof EXEMPT;
};

export type TaxResultsWithCities = {
  [Key: string]: TaxResults | Money | typeof EXEMPT;
};

export type AutocompleteOption = {
  title: string;
  firstLetter: string;
  disabled: boolean;
};

export type AvailableStatesAndCities = { [key: string]: { cities: string[] } };

export type NavPage = {
  name: string;
  icon: ReactElement;
  route: string;
  selected: boolean;
};

/**
 * A sales tax rate in percent, as a single number when it held all year or as
 * the rate for each calendar quarter when it changed. Quarters are the only
 * granularity needed: Washington lets a local rate change take effect only on
 * the first day of a quarter (RCW 82.14.055).
 */
export type SalesTaxRate = number | [number, number, number, number];

/**
 * One state's general sales tax for one year, in
 * src/data/{year}/sales-tax/state/{state}.ts. Separate from TaxData because
 * it is charged on spending, not income, and the income calculator never
 * reads it.
 */
export interface SalesTaxData {
  [STATE_SALES_TAX]: SalesTaxRate;
  /** Used for a location with no city picked, or a city not listed. */
  [LOCAL_SALES_TAX]: SalesTaxRate;
  [CITIES]?: { [city: string]: { [LOCAL_SALES_TAX]: SalesTaxRate } };
}

/**
 * One row of the IRS Optional State Sales Tax Table: the sales tax the IRS
 * estimates a household pays at this income, by family size.
 */
export type SalesTaxTableBand = {
  min: number;
  max: number | typeof INFINITY;
  /** Family sizes 1 through 5, then "over 5", as the table prints them. */
  amounts: [number, number, number, number, number, number];
};

/**
 * The IRS table the default taxable spending is derived from: the table's
 * amounts divided by the state rate it was computed at.
 */
export type TaxableSpendingTable = {
  rate: number;
  bands: SalesTaxTableBand[];
};
