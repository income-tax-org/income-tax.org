import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // REPLACED 2026-09-08. This slot previously carried the federal standard
  // deduction ($15,000 / $30,000 / $22,500) forward from 2025. That is no
  // longer what South Carolina subtracts. Act 110 of 2026 amended Section
  // 12-6-50 to add IRC Section 63(b)-(g) to the list of provisions SC does
  // not adopt -- the federal standard deduction among them -- so from TY2026
  // "the calculation for South Carolina taxable income will begin with
  // federal AGI instead of federal taxable income", and Section 12-6-1140
  // adds the South Carolina Income Adjusted Deduction (SCIAD) in its place.
  //
  // SCIAD is a phase-out, not a flat amount, so it needs bands. Per
  // SC Information Letter #26-20 (2026-08-31):
  //
  //   Single / MFS        $0-$40,000      $15,000
  //                       $40,001-$94,999 $15,000 reduced by (AGI-40,000)/55,000
  //                       $95,000+        $0
  //   Head of household   $0-$60,000      $22,500
  //                       $60,001-$142,499 $22,500 reduced by (AGI-60,000)/82,500
  //                       $142,500+       $0
  //   MFJ / surviving     $0-$80,000      $30,000
  //                       $80,001-$189,999 $30,000 reduced by (AGI-80,000)/110,000
  //                       $190,000+       $0
  //
  // Each "reduced by fraction" is the full amount times that fraction, which
  // is the same taper rate in all three columns: 15,000/55,000 =
  // 22,500/82,500 = 30,000/110,000 = 3/11 = 27.272727% of AGI above the
  // threshold. That the three independently published pairs collapse to one
  // rate is the check that the bands are transcribed right, and each column
  // reaches exactly $0 at the cut-off the letter states.
  //
  // Bands are half-open [min, max), so the printed "$40,001 to $94,999" is
  // written min: 40001, max: 95000. `reduce_from` is the printed measuring
  // point, which sits one dollar below the band's own min.
  //
  // KNOWN BOUNDED DIVERGENCE: the letter adds that "any reduction amount
  // which is not a multiple of $10 is rounded down to the next lowest $10",
  // which the schema has no field for. It can only make SC's real deduction
  // larger than this model's, by under $10 -- at most 52 cents of tax at the
  // 5.21% top rate.
  // Source: https://dor.sc.gov/sites/dor/files/policies/IL26-20.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 40001, amount: 15000 },
      {
        min: 40001,
        max: 95000,
        amount: 15000,
        reduce_from: 40000,
        reduce_rate: 27.272727,
      },
      { min: 95000, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 40001, amount: 15000 },
      {
        min: 40001,
        max: 95000,
        amount: 15000,
        reduce_from: 40000,
        reduce_rate: 27.272727,
      },
      { min: 95000, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 60001, amount: 22500 },
      {
        min: 60001,
        max: 142500,
        amount: 22500,
        reduce_from: 60000,
        reduce_rate: 27.272727,
      },
      { min: 142500, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 80001, amount: 30000 },
      {
        min: 80001,
        max: 190000,
        amount: 30000,
        reduce_from: 80000,
        reduce_rate: 27.272727,
      },
      { min: 190000, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-09-08 against SC Information Letter #26-20, "Individual
  // Income Tax Reform" (2026-08-31), reporting Act 110 of 2026 (signed
  // 2026-03-30), effective for tax years beginning after 2025. Act 110
  // replaced three brackets with two and amended Section 12-6-510(C) to:
  //
  //   $0 - $29,999      1.99% times taxable income
  //   $30,000 or more   (5.21% times taxable income) minus $966
  //
  // That is a rate-on-total computation with a subtraction constant, not a
  // marginal ladder, but the two are the same function here and the marginal
  // form is what this repo stores. The constant is what proves it:
  //   marginal:  30,000 x 1.99% + 5.21% x (I - 30,000)
  //           =  597 + 0.0521*I - 1,563
  //           =  0.0521*I - 966          <- the published "minus $966"
  // So no band boundary or rate needs changing; the encoding already agrees
  // with the statute to the dollar. SC still applies one schedule to every
  // filing status, hence [ALL].
  //
  // Watch item: the top rate falls further from TY2027 if the Board of
  // Economic Advisors certifies the revenue trigger, and the bracket amounts
  // are indexed to Chained CPI under Section 12-6-520.
  // Source: https://dor.sc.gov/sites/dor/files/policies/IL26-20.pdf
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 30000, rate: 1.99 },
      { min: 30000, max: INFINITY, rate: 5.21 },
    ],
  },
} as TaxData;
