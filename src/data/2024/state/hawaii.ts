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
  // VERIFIED 2026-09-08. Act 46, SLH 2024 doubled the standard deduction for
  // tax year 2024; DOTAX Announcement 2024-03 prints $8,800 joint / $6,424 head
  // of household / $4,400 single or married filing separate, and the 2024 N-11
  // instructions repeat it. Correct as stored.
  // https://files.hawaii.gov/tax/news/announce/ann24-03.pdf
  // https://files.hawaii.gov/tax/forms/2024/n11ins.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 4400,
    [MARRIED]: 8800,
    [MARRIED_SEPARATELY]: 4400,
    [HEAD_OF_HOUSEHOLD]: 6424,
  },
  // Single, joint and married-filing-separately VERIFIED 2026-09-08 against the
  // 2024 N-11 Tax Rate Schedules (page 48), which are identical to 2023 --
  // Act 46 moved the brackets only from 2025. Correct as stored. See the
  // head-of-household note below for the one schedule that was not.
  // https://files.hawaii.gov/tax/forms/2024/n11ins.pdf
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
    // CORRECTED 2026-09-08: this slot held the tax year *2025* head-of-household
    // ladder (floors 14400 / 21600 / ... / 487500). Act 46, SLH 2024 widened the
    // brackets from 2025, not 2024 -- DOTAX Announcement 2024-03 says of 2024
    // outright, "The income tax brackets will be the same as in tax year 2023."
    // Single, joint and separate were all still on the 2023 ladder in this file;
    // only head of household had been advanced a year. Below is N-11 Schedule
    // III as printed for 2024, identical to 2023.
    // Reconciles against the booklet's own cumulative column: 3600 x 1.4% = $50;
    // + 3600 x 3.2% = $166; + 7200 x 5.5% = $562; + 7200 x 6.4% = $1,022;
    // + 7200 x 6.8% = $1,512; + 7200 x 7.2% = $2,030; + 18000 x 7.6% = $3,398;
    // + 18000 x 7.9% = $4,820; + 153000 x 8.25% = $17,443 -- every figure
    // matching the printed "$X plus Y% over" column, which it does not do for
    // the 2025 boundaries.
    // https://files.hawaii.gov/tax/forms/2024/n11ins.pdf (2024 Tax Rate
    // Schedules, page 48)
    // https://files.hawaii.gov/tax/news/announce/ann24-03.pdf
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
  // VERIFIED 2026-09-08. Employee share is half the premium, capped by
  // HRS sec. 392-43 at 0.5% of the maximum weekly wage base of $1,374.78
  // (2024) -- a $6.87 weekly maximum, i.e. $71,488 a year. Correct as stored.
  // Source: DLIR Disability Compensation Division, "2024 Maximum Weekly Wage
  // Base and Maximum Weekly Benefit Amount", dated 2023-12-01.
  // https://web.archive.org/web/20240304093724if_/https://labor.hawaii.gov/dcd/files/2019/11/newWBA.pdf
  [HI_TEMPORARY_DISABILITY_INSURANCE]: {
    [ALL]: [
      { min: 0, max: 71488, rate: 0.5 },
      { min: 71488, max: INFINITY, rate: 0 },
    ],
  },
} as TaxData;
