import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-08.
//
// Brackets — VERIFIED against the enrolled bill. HB 2764 of the 2025 session
// (signed 5/28/25) rewrote 68 O.S. 2355(D) for "tax year 2026 and for
// subsequent tax years", cutting the top rate 4.75% -> 4.5% and collapsing six
// bands to four. Enrolled text:
// https://www.oklegislature.gov/cf_pdf/2025-26%20ENR/hB/HB2764%20ENR.PDF
//
// The Act is written as widths, not boundaries, so the arithmetic matters:
//   Single and married filing separately: 0% on the first $3,750, 2.5% on the
//   next $1,150 (-> $4,900), 3.5% on the next $2,300 (-> $7,200), 4.5% on the
//   remainder.
//   Married joint, surviving spouse and head of household: 0% on the first
//   $7,500, 2.5% on the next $2,300 (-> $9,800), 3.5% on the next $4,600
//   (-> $14,400), 4.5% on the remainder.
//
// Confirmed independently by the Oklahoma Tax Commission's own Summary of 2025
// Tax Legislation, whose 2026 table publishes the cumulative "Pay" column:
// https://oklahoma.gov/content/dam/ok/en/tax/documents/resources/publications/legislation/2025LegislativeUpdate.pdf
// That column reconciles only with these boundaries — $1,150 x 2.5% = $28.75 at
// $4,900 and + $2,300 x 3.5% = $109.25 at $7,200 for single; $2,300 x 2.5% =
// $57.50 at $9,800 and + $4,600 x 3.5% = $218.50 at $14,400 for joint.
//
// Standard deduction — VERIFIED unchanged at $6,350 / $12,700 / $6,350 /
// $9,350. It is fixed at the 2017 federal amounts by 68 O.S. 2358(C) and is not
// indexed; HB 2764 amends only 68 O.S. 2355, and the OTC legislative summary
// records no deduction change in the 2025 session.
//
// Watch item: 62 O.S. 34.103 lets all four rates fall a further 0.25 point when
// the State Board of Equalization certifies a revenue trigger each December,
// with final certification in February. Re-check before the 2027 file.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 6350,
    [MARRIED]: 12700,
    [MARRIED_SEPARATELY]: 6350,
    [HEAD_OF_HOUSEHOLD]: 9350,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3750, rate: 0 },
      { min: 3750, max: 4900, rate: 2.5 },
      { min: 4900, max: 7200, rate: 3.5 },
      { min: 7200, max: INFINITY, rate: 4.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 7500, rate: 0 },
      { min: 7500, max: 9800, rate: 2.5 },
      { min: 9800, max: 14400, rate: 3.5 },
      { min: 14400, max: INFINITY, rate: 4.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3750, rate: 0 },
      { min: 3750, max: 4900, rate: 2.5 },
      { min: 4900, max: 7200, rate: 3.5 },
      { min: 7200, max: INFINITY, rate: 4.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 7500, rate: 0 },
      { min: 7500, max: 9800, rate: 2.5 },
      { min: 9800, max: 14400, rate: 3.5 },
      { min: 14400, max: INFINITY, rate: 4.5 },
    ],
  },
} as TaxData;
