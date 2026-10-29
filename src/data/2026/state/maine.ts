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
  // L.D. 2212 (P.L. 2025, c. 650, Pt. K, SS14) replaced Maine's indexed
  // formula with flat 2026 amounts in 36 M.R.S. 5124-C(1-C). Maine returns
  // to the federal standard deduction in 2027 under 5124-C(1-D).
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
  // Cross-checked against the worksheet. Single at $139,750: excess 37,500,
  // 37,500 / 75,000 = 0.5000, 15,700 x 0.5 = 7,850 reduced, deduction
  // $7,850 - and 37,500 x 20.933333% = 7,849.99999, $7,850 rounded. Joint
  // at $279,550: excess 75,000, quotient 0.5000, deduction $15,700. Single
  // at $177,250: excess 75,000, quotient 1.0000, deduction $0, which is
  // where the third band starts.
  //
  // Source: MRS 2026 "Phaseout of Itemized / Standard Deductions Worksheet"
  // (36 M.R.S. 5124-C(2) and 5125(7)) for the phase-out, and the 2026
  // Individual Income Tax Rate Schedules, rev. 2026-05-20, for the base
  // amounts.
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/26_item_stand_%20ded_phaseout_wksht_0.pdf
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/2026-05/ind_tax_rate_sched_2026_rev.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 102251, amount: 15700 },
      {
        min: 102251,
        max: 177251,
        amount: 15700,
        reduce_from: 102250,
        reduce_rate: 20.933333,
      },
      { min: 177251, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 204551, amount: 31400 },
      {
        min: 204551,
        max: 354551,
        amount: 31400,
        reduce_from: 204550,
        reduce_rate: 20.933333,
      },
      { min: 354551, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 102251, amount: 15700 },
      {
        min: 102251,
        max: 177251,
        amount: 15700,
        reduce_from: 102250,
        reduce_rate: 20.933333,
      },
      { min: 177251, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 153401, amount: 23550 },
      {
        min: 153401,
        max: 265901,
        amount: 23550,
        reduce_from: 153400,
        reduce_rate: 20.933333,
      },
      { min: 265901, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 27400, rate: 5.8 },
      { min: 27400, max: 64850, rate: 6.75 },
      { min: 64850, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED]: [
      { min: 0, max: 54850, rate: 5.8 },
      { min: 54850, max: 129750, rate: 6.75 },
      { min: 129750, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 27400, rate: 5.8 },
      { min: 27400, max: 64850, rate: 6.75 },
      { min: 64850, max: INFINITY, rate: 7.15 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 41100, rate: 5.8 },
      { min: 41100, max: 97300, rate: 6.75 },
      { min: 97300, max: INFINITY, rate: 7.15 },
    ],
  },
} as TaxData;
