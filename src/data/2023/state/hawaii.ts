import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  HI_TEMPORARY_DISABILITY_INSURANCE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // VERIFIED 2026-09-08 against the 2023 N-11 instructions, "Standard
  // Deduction": Single $2,200 / Married filing jointly $4,400 / Married filing
  // separately $2,200 / Head of Household $3,212. Head of household is NOT
  // 1.5x single here -- $3,212 is the figure Hawaii prints, and the ratio is
  // 1.46x. Correct as stored.
  // https://files.hawaii.gov/tax/forms/2023/n11ins.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2200,
    [MARRIED]: 4400,
    [MARRIED_SEPARATELY]: 2200,
    [HEAD_OF_HOUSEHOLD]: 3212,
  },
  // CORRECTED 2026-09-08: ran to INFINITY, so a filer on $100,000 was charged
  // $500 against a real statutory maximum of $342.80. HRS sec. 392-43 lets the
  // employer withhold half the premium but "not more than .5% of the employee's
  // weekly wage, with the maximum not to exceed" the annual maximum weekly
  // deduction -- $6.59 a week for 2023. That is the same defect the 2026-09-07
  // audit found in New York's disability premium.
  // 0.5% of the 2023 maximum weekly wage base of $1,318.48 x 52 = $68,560.96,
  // floored to $68,560 to match the convention already used by 2024-2026.
  // Source: DLIR Disability Compensation Division, "2023 Maximum Weekly Wage
  // Base and Maximum Weekly Benefit Amount", dated 2022-12-01.
  // https://web.archive.org/web/20240304093724if_/https://labor.hawaii.gov/dcd/files/2019/11/olderWBA.pdf
  [HI_TEMPORARY_DISABILITY_INSURANCE]: {
    [ALL]: [
      { min: 0, max: 68560, rate: 0.5 },
      { min: 68560, max: INFINITY, rate: 0 },
    ],
  },
  // VERIFIED 2026-09-08 against the 2023 N-11 Tax Rate Schedules (page 36),
  // Schedules I (single / married filing separately), II (joint) and III
  // (unmarried heads of household) -- all four statuses correct as stored.
  // Cross-checked against the booklet's own cumulative column, which reconciles
  // only with these boundaries: single $150,000 floor = $11,629
  // (2400x1.4 + 2400x3.2 + 4800x5.5 + 4800x6.4 + 4800x6.8 + 4800x7.2 +
  // 12000x7.6 + 12000x7.9 + 102000x8.25 = $11,628.60), and joint $300,000
  // floor = $23,257.
  // https://files.hawaii.gov/tax/forms/2023/n11ins.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 2400, rate: 1.4 },
      { min: 2400, max: 4800, rate: 3.2 },
      { min: 4800, max: 9600, rate: 5.5 },
      { min: 9600, max: 14400, rate: 6.4 },
      { min: 14400, max: 19200, rate: 6.8 },
      { min: 19200, max: 24000, rate: 7.2 },
      { min: 24000, max: 36000, rate: 7.6 },
      { min: 36000, max: 48000, rate: 7.9 },
      { min: 48000, max: 150000, rate: 8.25 },
      { min: 150000, max: 175000, rate: 9 },
      { min: 175000, max: 200000, rate: 10 },
      { min: 200000, max: INFINITY, rate: 11 },
    ],
    [MARRIED]: [
      { min: 0, max: 4800, rate: 1.4 },
      { min: 4800, max: 9600, rate: 3.2 },
      { min: 9600, max: 19200, rate: 5.5 },
      { min: 19200, max: 28800, rate: 6.4 },
      { min: 28800, max: 38400, rate: 6.8 },
      { min: 38400, max: 48000, rate: 7.2 },
      { min: 48000, max: 72000, rate: 7.6 },
      { min: 72000, max: 96000, rate: 7.9 },
      { min: 96000, max: 300000, rate: 8.25 },
      { min: 300000, max: 350000, rate: 9 },
      { min: 350000, max: 400000, rate: 10 },
      { min: 400000, max: INFINITY, rate: 11 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 2400, rate: 1.4 },
      { min: 2400, max: 4800, rate: 3.2 },
      { min: 4800, max: 9600, rate: 5.5 },
      { min: 9600, max: 14400, rate: 6.4 },
      { min: 14400, max: 19200, rate: 6.8 },
      { min: 19200, max: 24000, rate: 7.2 },
      { min: 24000, max: 36000, rate: 7.6 },
      { min: 36000, max: 48000, rate: 7.9 },
      { min: 48000, max: 150000, rate: 8.25 },
      { min: 150000, max: 175000, rate: 9 },
      { min: 175000, max: 200000, rate: 10 },
      { min: 200000, max: INFINITY, rate: 11 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 3600, rate: 1.4 },
      { min: 3600, max: 7200, rate: 3.2 },
      { min: 7200, max: 14400, rate: 5.5 },
      { min: 14400, max: 21600, rate: 6.4 },
      { min: 21600, max: 28800, rate: 6.8 },
      { min: 28800, max: 36000, rate: 7.2 },
      { min: 36000, max: 54000, rate: 7.6 },
      { min: 54000, max: 72000, rate: 7.9 },
      { min: 72000, max: 225000, rate: 8.25 },
      { min: 225000, max: 262500, rate: 9 },
      { min: 262500, max: 300000, rate: 10 },
      { min: 300000, max: INFINITY, rate: 11 },
    ],
  },
} as TaxData;
