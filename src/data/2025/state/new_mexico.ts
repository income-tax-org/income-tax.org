import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STATE_INCOME, STANDARD_DEDUCTION } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // New Mexico uses the federal standard deduction amounts.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  // Corrected: this file previously carried a schedule that exists in no New
  // Mexico publication -- it kept the pre-2025 bracket boundaries ($5,500 /
  // $11,000 / $16,000 single) while adopting the post-2025 rates, then split
  // 4.7%/4.9% at $100,000. HB 252 (Laws 2024, ch. 67, Sections 5, 8 & 10)
  // rewrote NMSA 1978 Section 7-2-7 for taxable years beginning on or after
  // January 1, 2025, moving the boundaries as well as the rates.
  // Below is Section 7-2-7 as enacted, verbatim. Its printed cumulative
  // figures pin the boundaries: single $82.50 = 1.5% x $5,500;
  // $434.50 = $82.50 + 3.2% x $11,000; $1,165.50 = $434.50 + 4.3% x $17,000;
  // $2,716.50 = $1,165.50 + 4.7% x $33,000; $9,748 = $2,716.50 + 4.9% x
  // $143,500. Joint: $120 / $664 / $1,739 / $4,089 / $14,624 reconcile the
  // same way. Separate: $60 / $332 / $869.50 / $2,044.50 / $7,312.
  // The 2025 PIT-TRT look-up table agrees independently -- its tax at the
  // $99,900-$100,000 row (midpoint $99,950) is $4,356 single, $4,087 joint and
  // head of household, $4,492 separate, which this schedule reproduces to the
  // dollar; the old schedule gave $4,419 / $4,290 / $4,544.
  // Head of household shares the joint schedule (Section 7-2-7(A) covers
  // "married individuals filing joint returns, heads of household and
  // surviving spouses").
  // https://www.nmlegis.gov/Sessions/24%20Regular/final/HB0252.pdf
  // https://realfile.tax.newmexico.gov/2025trt.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 5500, rate: 1.5 },
      { min: 5500, max: 16500, rate: 3.2 },
      { min: 16500, max: 33500, rate: 4.3 },
      { min: 33500, max: 66500, rate: 4.7 },
      { min: 66500, max: 210000, rate: 4.9 },
      { min: 210000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 8000, rate: 1.5 },
      { min: 8000, max: 25000, rate: 3.2 },
      { min: 25000, max: 50000, rate: 4.3 },
      { min: 50000, max: 100000, rate: 4.7 },
      { min: 100000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4000, rate: 1.5 },
      { min: 4000, max: 12500, rate: 3.2 },
      { min: 12500, max: 25000, rate: 4.3 },
      { min: 25000, max: 50000, rate: 4.7 },
      { min: 50000, max: 157500, rate: 4.9 },
      { min: 157500, max: INFINITY, rate: 5.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 8000, rate: 1.5 },
      { min: 8000, max: 25000, rate: 3.2 },
      { min: 25000, max: 50000, rate: 4.3 },
      { min: 50000, max: 100000, rate: 4.7 },
      { min: 100000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
  },
} as TaxData;
