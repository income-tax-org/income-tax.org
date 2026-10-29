import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Maine's standard deduction equaled the federal one through tax year
  // 2024 (36 M.R.S. 5124-C(1-A)).
  //
  // Maine's deduction is not flat: 36 M.R.S. 5124-C(2) phases it out over a
  // fixed span of Maine AGI, so this is a schedule. The amounts this file
  // used to carry alone are the base amounts, which survive intact only up to
  // the threshold below and are gone entirely one span above it.
  //
  // The rule is the Worksheet for Standard / Itemized Deductions printed with
  // Form 1040ME, line 17. In its own steps: take Maine AGI, subtract the
  // threshold (line 2), divide the excess by the span (line 4) capping the
  // quotient at 1.0000 (line 5), multiply the base deduction by that fraction
  // (line 7) and subtract the product (line 8). So the deduction falls in a
  // straight line from the base amount at the threshold to zero one span
  // above it, which is `reduce_rate` = base / span, measured from the
  // threshold. The span is the same every year: $75,000 single and married
  // filing separately, $112,500 head of household, $150,000 filing jointly.
  //
  // The worksheet is "greater than" the threshold, so each band starts one
  // dollar above the printed figure.
  //
  // MRS rounds its line 5 fraction to four decimal places and the calculator
  // does not. Sampled across the phase-out range the two never differ by more
  // than a dollar of deduction, and only where the exact figure lands on a
  // half dollar and the two round it opposite ways - about seven cents of
  // tax. The divergence is unsigned - the calculator runs a dollar low at 2025
  // head of household on $192,188 and a dollar high at 2026 head of household
  // on $215,275 - so do not try to correct for it in one direction.
  //
  // Cross-checked against the worksheet. Single at $129,000: excess 37,500,
  // 37,500 / 75,000 = 0.5000, 13,850 x 0.5 = 6,925 reduced, deduction
  // $6,925 - and 37,500 x 18.466667% = 6,925.00 to the cent. Joint at
  // $258,050: excess 75,000, 75,000 / 150,000 = 0.5000, 27,700 x 0.5 =
  // 13,850, deduction $13,850. Head of household at $249,800: excess
  // 112,500, quotient 1.0000, deduction $0, which is where the third band
  // starts.
  //
  // Source: MRS 2023 Form 1040ME general instructions - "Worksheet for
  // Standard / Itemized Deductions (for Form 1040ME, line 17)" for the
  // phase-out, "2023 Tax Year Quick Facts" for the base amounts.
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/23_1040me_book_gen_instr.pdf
  // Base amounts corroborated by the 2023 Individual Income Tax Rate
  // Schedules, which also state "The Maine standard deduction amount is
  // equal to the federal standard deduction amount".
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/ind_tax_rate_sched_2023.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 91501, amount: 13850 },
      {
        min: 91501,
        max: 166501,
        amount: 13850,
        reduce_from: 91500,
        reduce_rate: 18.466667,
      },
      { min: 166501, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 183051, amount: 27700 },
      {
        min: 183051,
        max: 333051,
        amount: 27700,
        reduce_from: 183050,
        reduce_rate: 18.466667,
      },
      { min: 333051, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 91501, amount: 13850 },
      {
        min: 91501,
        max: 166501,
        amount: 13850,
        reduce_from: 91500,
        reduce_rate: 18.466667,
      },
      { min: 166501, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 137301, amount: 20800 },
      {
        min: 137301,
        max: 249801,
        amount: 20800,
        reduce_from: 137300,
        reduce_rate: 18.488889,
      },
      { min: 249801, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 24500, rate: 5.8 },
      { min: 24500, max: 58050, rate: 6.75 },
      { min: 58050, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED]: [
      { min: 0, max: 49050, rate: 5.8 },
      { min: 49050, max: 116100, rate: 6.75 },
      { min: 116100, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 24500, rate: 5.8 },
      { min: 24500, max: 58050, rate: 6.75 },
      { min: 58050, max: INFINITY, rate: 7.15 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 36750, rate: 5.8 },
      { min: 36750, max: 87100, rate: 6.75 },
      { min: 87100, max: INFINITY, rate: 7.15 },
    ],
  },
} as TaxData;
