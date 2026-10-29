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
  // Employee share is half the premium, capped at 0.5% of the maximum weekly
  // wage base of $1,441.72 (2025), i.e. $74969 a year.
  // VERIFIED 2026-09-08 against the DLIR Disability Compensation Division's
  // "2025 Maximum Weekly Wage Base and Maximum Weekly Benefit Amount" (dated
  // 2024-12-02): maximum weekly wage base $1,441.72, maximum weekly deduction
  // $7.21. The cap is statutory (HRS sec. 392-43) and must not run to INFINITY.
  // https://labor.hawaii.gov/dcd/files/2023/05/2025-Max-Weekly-Wage-Base-Rev-2025.03.pdf
  [HI_TEMPORARY_DISABILITY_INSURANCE]: {
    [ALL]: [
      { min: 0, max: 74969, rate: 0.5 },
      { min: 74969, max: INFINITY, rate: 0 },
    ],
  },
  // VERIFIED 2026-09-08. Unchanged from 2024 -- Act 46's next step up is 2026.
  // 2025 N-11 instructions, "Standard Deduction"; DOTAX Announcement 2024-03,
  // "For tax year 2025, the standard deduction amounts will be the same as in
  // tax year 2024." Correct as stored.
  // https://files.hawaii.gov/tax/forms/2025/n11ins.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 4400,
    [MARRIED]: 8800,
    [MARRIED_SEPARATELY]: 4400,
    [HEAD_OF_HOUSEHOLD]: 6424,
  },
  // VERIFIED 2026-09-08 against the 2025 N-11 Tax Rate Schedules (page 48) and
  // independently against DOTAX Announcement 2024-03, which prints the Act 46
  // tax-year-2025 tables. All four statuses correct as stored.
  // Cross-checked against the printed cumulative column, which reconciles only
  // with these boundaries: single $125,000 floor = $8,391
  // (9600x1.4 + 4800x3.2 + 4800x5.5 + 4800x6.4 + 12000x6.8 + 12000x7.2 +
  // 77000x7.6 = $8,390.40) and head of household $187,500 floor = $12,587.
  // https://files.hawaii.gov/tax/forms/2025/n11ins.pdf
  // https://files.hawaii.gov/tax/news/announce/ann24-03.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 9600, rate: 1.4 },
      { min: 9600, max: 14400, rate: 3.2 },
      { min: 14400, max: 19200, rate: 5.5 },
      { min: 19200, max: 24000, rate: 6.4 },
      { min: 24000, max: 36000, rate: 6.8 },
      { min: 36000, max: 48000, rate: 7.2 },
      { min: 48000, max: 125000, rate: 7.6 },
      { min: 125000, max: 175000, rate: 7.9 },
      { min: 175000, max: 225000, rate: 8.25 },
      { min: 225000, max: 275000, rate: 9 },
      { min: 275000, max: 325000, rate: 10 },
      { min: 325000, max: INFINITY, rate: 11 },
    ],
    [MARRIED]: [
      { min: 0, max: 19200, rate: 1.4 },
      { min: 19200, max: 28800, rate: 3.2 },
      { min: 28800, max: 38400, rate: 5.5 },
      { min: 38400, max: 48000, rate: 6.4 },
      { min: 48000, max: 72000, rate: 6.8 },
      { min: 72000, max: 96000, rate: 7.2 },
      { min: 96000, max: 250000, rate: 7.6 },
      { min: 250000, max: 350000, rate: 7.9 },
      { min: 350000, max: 450000, rate: 8.25 },
      { min: 450000, max: 550000, rate: 9 },
      { min: 550000, max: 650000, rate: 10 },
      { min: 650000, max: INFINITY, rate: 11 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 9600, rate: 1.4 },
      { min: 9600, max: 14400, rate: 3.2 },
      { min: 14400, max: 19200, rate: 5.5 },
      { min: 19200, max: 24000, rate: 6.4 },
      { min: 24000, max: 36000, rate: 6.8 },
      { min: 36000, max: 48000, rate: 7.2 },
      { min: 48000, max: 125000, rate: 7.6 },
      { min: 125000, max: 175000, rate: 7.9 },
      { min: 175000, max: 225000, rate: 8.25 },
      { min: 225000, max: 275000, rate: 9 },
      { min: 275000, max: 325000, rate: 10 },
      { min: 325000, max: INFINITY, rate: 11 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 14400, rate: 1.4 },
      { min: 14400, max: 21600, rate: 3.2 },
      { min: 21600, max: 28800, rate: 5.5 },
      { min: 28800, max: 36000, rate: 6.4 },
      { min: 36000, max: 54000, rate: 6.8 },
      { min: 54000, max: 72000, rate: 7.2 },
      { min: 72000, max: 187500, rate: 7.6 },
      { min: 187500, max: 262500, rate: 7.9 },
      { min: 262500, max: 337500, rate: 8.25 },
      { min: 337500, max: 412500, rate: 9 },
      { min: 412500, max: 487500, rate: 10 },
      { min: 487500, max: INFINITY, rate: 11 },
    ],
  },
} as TaxData;
