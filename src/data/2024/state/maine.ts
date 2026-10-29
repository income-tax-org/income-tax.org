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
  // Cross-checked against the worksheet. Single at $134,650: excess 37,500,
  // 37,500 / 75,000 = 0.5000, 14,600 x 0.5 = 7,300 reduced, deduction
  // $7,300 - and 37,500 x 19.466667% = 7,300.00 to the cent. Joint at
  // $269,300: excess 75,000, quotient 0.5000, deduction $14,600. Single at
  // $172,150: excess 75,000, quotient 1.0000, deduction $0, which is where
  // the third band starts.
  //
  // Source: MRS 2024 "Phaseout of Itemized / Standard Deductions Worksheet"
  // (36 M.R.S. 5124-C(2) and 5125(7)) for the phase-out, and the 2024
  // Individual Income Tax Rate Schedules for the base amounts - which also
  // state "The Maine standard deduction amount is equal to the federal
  // standard deduction amount".
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/24_item_stand_%20ded_phaseout_wksht.pdf
  // https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/ind_tax_rate_sched_2024.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 97151, amount: 14600 },
      {
        min: 97151,
        max: 172151,
        amount: 14600,
        reduce_from: 97150,
        reduce_rate: 19.466667,
      },
      { min: 172151, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 194301, amount: 29200 },
      {
        min: 194301,
        max: 344301,
        amount: 29200,
        reduce_from: 194300,
        reduce_rate: 19.466667,
      },
      { min: 344301, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 97151, amount: 14600 },
      {
        min: 97151,
        max: 172151,
        amount: 14600,
        reduce_from: 97150,
        reduce_rate: 19.466667,
      },
      { min: 172151, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 145751, amount: 21900 },
      {
        min: 145751,
        max: 258251,
        amount: 21900,
        reduce_from: 145750,
        reduce_rate: 19.466667,
      },
      { min: 258251, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 26050, rate: 5.8 },
      { min: 26050, max: 61600, rate: 6.75 },
      { min: 61600, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED]: [
      { min: 0, max: 52100, rate: 5.8 },
      { min: 52100, max: 123250, rate: 6.75 },
      { min: 123250, max: INFINITY, rate: 7.15 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 26050, rate: 5.8 },
      { min: 26050, max: 61600, rate: 6.75 },
      { min: 61600, max: INFINITY, rate: 7.15 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 39050, rate: 5.8 },
      { min: 39050, max: 92450, rate: 6.75 },
      { min: 92450, max: INFINITY, rate: 7.15 },
    ],
  },
} as TaxData;
