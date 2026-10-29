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
  // Georgia groups head of household with single, not with married filing
  // jointly: the booklet prints one "Single/Head of Household/Qualifying
  // Surviving Spouse" line at $5,400. Head of household matching single is
  // correct here, not a duplicated single figure.
  // Source: 2023 IT-511 booklet, Form 500 instructions, Line 11a.
  // Amounts re-verified 2026-09-08 against the 2023 IT-511 booklet's Line 11a
  // instruction: Single/Head of Household/Qualifying Surviving Spouse $5,400,
  // Married Filing Joint $7,100, Married Filing Separate $3,550.
  // Source: https://dor.georgia.gov/document/document/2023-it-511-individual-income-tax-booklet/download
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 5400,
    [MARRIED]: 7100,
    [MARRIED_SEPARATELY]: 3550,
    [HEAD_OF_HOUSEHOLD]: 5400,
  },
  // Verified 2026-09-08 against the 2023 IT-511 booklet's "Georgia Tax Rate
  // Schedule" (page 59). Georgia prints THREE columns, not four, and the
  // middle one is headed "Married Filing Joint or Head of Household" -- so
  // head of household shares the joint ladder here while sharing the SINGLE
  // standard deduction above. That split is Georgia's, not a mistake in this
  // file, and it is the reason the two statuses must not be assumed to move
  // together.
  //
  // The schedule's cumulative Column C reconciles with these boundaries:
  //   single: 750 x 1% = 7.50 -> printed $8; 8 + 1,500 x 2% = $38;
  //           38 + 1,500 x 3% = $83; 83 + 1,500 x 4% = $143;
  //           143 + 1,750 x 5% = 230.50 -> printed $230
  //   joint:  10 + 2,000 x 2% = $50; 50 + 2,000 x 3% = $110;
  //           110 + 2,000 x 4% = $190; 190 + 3,000 x 5% = $340
  // Married filing separately is exactly half the joint ladder, but Georgia
  // prints that column in full, so it is the state's figure and not derived.
  // Source: https://dor.georgia.gov/document/document/2023-it-511-individual-income-tax-booklet/download
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 750, rate: 1 },
      { min: 750, max: 2250, rate: 2 },
      { min: 2250, max: 3750, rate: 3 },
      { min: 3750, max: 5250, rate: 4 },
      { min: 5250, max: 7000, rate: 5 },
      { min: 7000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 1000, rate: 1 },
      { min: 1000, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 7000, rate: 4 },
      { min: 7000, max: 10000, rate: 5 },
      { min: 10000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 500, rate: 1 },
      { min: 500, max: 1500, rate: 2 },
      { min: 1500, max: 2500, rate: 3 },
      { min: 2500, max: 3500, rate: 4 },
      { min: 3500, max: 5000, rate: 5 },
      { min: 5000, max: INFINITY, rate: 5.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 1000, rate: 1 },
      { min: 1000, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 7000, rate: 4 },
      { min: 7000, max: 10000, rate: 5 },
      { min: 10000, max: INFINITY, rate: 5.75 },
    ],
  },
} as TaxData;
