import { INFINITY } from "@/constants";
import type { FilingStatus } from "@/constants/filing-status";
import {
  FEDERAL_TAX_SUBTRACTION,
  STANDARD_DEDUCTION,
} from "@/constants/tax_types";
import type {
  DeductionBand,
  StandardDeduction,
  StandardDeductionByFilingStatus,
  TaxData,
} from "@/types";

/**
 * Whether a filing status's deduction varies with income.
 *
 * Roughly forty states publish one number and are unaffected by any of this.
 */
export function isBandedDeduction(
  deduction: StandardDeduction | undefined,
): deduction is DeductionBand[] {
  return Array.isArray(deduction);
}

/** The band covering this income. Bands are half-open, `[min, max)`. */
function bandFor(
  bands: DeductionBand[],
  income: number,
): DeductionBand | undefined {
  return bands.find(
    (band) =>
      income >= band.min &&
      (band.max === INFINITY || income < (band.max as number)),
  );
}

/**
 * What one band allows at this income.
 *
 * Two shapes. Usually the band starts at `amount` and falls: the reduction is
 * measured from `reduce_from`, defaulting to the band's own floor, and is
 * either a percentage of the excess or a fixed sum per whole step of it. The
 * other shape is a straight percentage of income, which rises instead.
 *
 * Either way the result is clamped into `[floor, amount]` -- `amount` is the
 * most the band allows and `floor` the least.
 */
function amountForBand(band: DeductionBand, income: number): number {
  let allowed: number;

  if (band.percent_of_income !== undefined) {
    allowed = (income * band.percent_of_income) / 100;
  } else {
    const excess = Math.max(0, income - (band.reduce_from ?? band.min));
    let reduction = 0;
    if (band.reduce_rate !== undefined) {
      reduction = (excess * band.reduce_rate) / 100;
    } else if (band.reduce_per !== undefined && band.reduce_by !== undefined) {
      reduction = Math.floor(excess / band.reduce_per) * band.reduce_by;
    }
    allowed = band.amount - reduction;
  }

  allowed = Math.min(band.amount, allowed);
  // Published schedules and the deduction field are both whole dollars, and
  // 19.778% of an income is not: without this the field renders a figure like
  // "22,234.381980000002".
  return Math.round(Math.max(band.floor ?? 0, allowed));
}

/**
 * The deduction a schedule allows at a given income.
 *
 * `income` is the figure that feeds taxable income for the jurisdiction --
 * wages after retirement contributions, before the deduction itself. That is a
 * **proxy for AGI**, which is what these states actually key their schedules
 * on; the two differ by above-the-line items this calculator does not model
 * (HSA contributions, student loan interest, self-employment adjustments). It
 * is deliberately not the FICA wage figure, which ignores the retirement
 * contribution and would overstate income here.
 *
 * Note this is the published *formula*. Some states also print a lookup table
 * stepped in income increments, which is the same formula evaluated at each
 * step; the two can differ by a few dollars of deduction for a given income.
 */
export function resolveStandardDeduction(
  deduction: StandardDeduction | undefined,
  income: number,
): number | undefined {
  if (deduction === undefined) {
    return undefined;
  }
  if (!isBandedDeduction(deduction)) {
    return deduction;
  }
  // Bands are validated as contiguous from 0 to INFINITY, so a non-negative
  // income always lands in one. A negative income (not reachable from the UI,
  // which clamps at zero) falls back to the first band.
  const band = bandFor(deduction, income) ?? deduction[0];
  return band ? amountForBand(band, income) : undefined;
}

/**
 * The standard deduction a jurisdiction declares for this filing status at
 * this income, or undefined when it declares none.
 *
 * Read at two levels: a state (or the federal schedule) resolves its own, and
 * a city may declare one of its own rather than inheriting the state's.
 */
export function standardDeductionFor(
  taxData: TaxData,
  filingStatus: FilingStatus,
  income: number,
): number | undefined {
  const declared = taxData?.[STANDARD_DEDUCTION] as
    | StandardDeductionByFilingStatus
    | undefined;
  return resolveStandardDeduction(declared?.[filingStatus], income);
}

/**
 * How much federal income tax this jurisdiction lets the filer subtract: the
 * smaller of the tax itself and the declared cap, or 0 if it declares none.
 *
 * Oregon's subtraction (OR-40 worksheet) takes federal tax after nonrefundable
 * credits, Form 1040 line 22 -- what the calculator's federal_income pass
 * computes, and never FICA. The cap is chosen by federal AGI, so `income` is
 * the same AGI proxy the standard deduction uses: income after the retirement
 * contribution.
 */
export function federalTaxSubtractionFor(
  taxData: TaxData,
  filingStatus: FilingStatus,
  income: number,
  federalIncomeTax: number,
): number {
  const declared = taxData?.[FEDERAL_TAX_SUBTRACTION] as
    | StandardDeductionByFilingStatus
    | undefined;
  const cap = resolveStandardDeduction(declared?.[filingStatus], income);
  if (cap === undefined) {
    return 0;
  }
  return Math.max(0, Math.min(cap, federalIncomeTax));
}

/**
 * Every filing status's deduction resolved at one income.
 *
 * The UI prefills its deduction fields from this, so it needs numbers rather
 * than schedules.
 */
export function resolveStandardDeductionMap(
  declared: StandardDeductionByFilingStatus | undefined,
  income: number,
): Record<FilingStatus, number> {
  const resolved = {} as Record<FilingStatus, number>;
  for (const [filingStatus, deduction] of Object.entries(declared ?? {})) {
    resolved[filingStatus as FilingStatus] =
      resolveStandardDeduction(deduction, income) ?? 0;
  }
  return resolved;
}
