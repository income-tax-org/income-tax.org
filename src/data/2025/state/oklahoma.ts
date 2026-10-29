import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-08 against the Oklahoma Tax Commission's own Form 511
// resident packet (2025 packet: https://oklahoma.gov/content/dam/ok/en/tax/documents/forms/individuals/current/511-Pkt.pdf).
//
// Standard deduction — VERIFIED $6,350 single / $12,700 joint / $6,350 married
// separate / $9,350 head of household. The packet states each one in words:
// "If your filing status is 'single' or 'married filing separate', your
// Oklahoma standard deduction is $6,350." Oklahoma's deduction is fixed at the
// 2017 federal amounts by 68 O.S. 2358(C) and is not indexed, which is why the
// same four numbers hold in every year here.
//
// Brackets — VERIFIED by reproducing the packet's entire published tax table.
// Evaluating the schedules below at each row's midpoint reproduces all 2,003
// printed rows in both status columns with zero mismatches. That pins every
// boundary and every rate, not just their sum.
//
// Independent arithmetic check from the packet's own "Calculating Tax on
// Taxable Income of $100,000 or more" worksheets, which state the cumulative
// tax at $100,000:
//   Single / married separate, packet says $4,562:
//     1000x0.25% + 1500x0.75% + 1250x1.75% + 1150x2.75% + 2300x3.75%
//       = $153.50 at $7,200, then 92,800x4.75% = $4,408.00 -> $4,561.50 -> $4,562
//   Married joint / head of household, packet says $4,373:
//     2000x0.25% + 3000x0.75% + 2500x1.75% + 2300x2.75% + 4600x3.75%
//       = $307.00 at $14,400, then 85,600x4.75% = $4,066.00 -> $4,373.00
//
// Head of household is not a copy-paste of the joint column by accident:
// Oklahoma's table column is headed "Married filing joint or head of
// household", so the two genuinely share a schedule. Married filing separate
// shares the single schedule for the same reason, and is not "half of joint" —
// at $100,000 it owes $4,562, not half of $4,373.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 6350,
    [MARRIED]: 12700,
    [MARRIED_SEPARATELY]: 6350,
    [HEAD_OF_HOUSEHOLD]: 9350,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 1000, rate: 0.25 },
      { min: 1000, max: 2500, rate: 0.75 },
      { min: 2500, max: 3750, rate: 1.75 },
      { min: 3750, max: 4900, rate: 2.75 },
      { min: 4900, max: 7200, rate: 3.75 },
      { min: 7200, max: INFINITY, rate: 4.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 2000, rate: 0.25 },
      { min: 2000, max: 5000, rate: 0.75 },
      { min: 5000, max: 7500, rate: 1.75 },
      { min: 7500, max: 9800, rate: 2.75 },
      { min: 9800, max: 14400, rate: 3.75 },
      { min: 14400, max: INFINITY, rate: 4.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 1000, rate: 0.25 },
      { min: 1000, max: 2500, rate: 0.75 },
      { min: 2500, max: 3750, rate: 1.75 },
      { min: 3750, max: 4900, rate: 2.75 },
      { min: 4900, max: 7200, rate: 3.75 },
      { min: 7200, max: INFINITY, rate: 4.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 2000, rate: 0.25 },
      { min: 2000, max: 5000, rate: 0.75 },
      { min: 5000, max: 7500, rate: 1.75 },
      { min: 7500, max: 9800, rate: 2.75 },
      { min: 9800, max: 14400, rate: 3.75 },
      { min: 14400, max: INFINITY, rate: 4.75 },
    ],
  },
} as TaxData;
