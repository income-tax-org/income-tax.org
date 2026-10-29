import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  FEDERAL_INCOME,
  MAX_401K_CONTRIBUTION,
  MEDICARE,
  SOCIAL_SECURITY,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [MAX_401K_CONTRIBUTION]: 23500,
  // The One Big Beautiful Bill Act (P.L. 119-21, signed 2025-07-04) raised the
  // tax-year-2025 standard deduction from 15,000 / 30,000 / 22,500.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED_SEPARATELY]: 15750,
    [MARRIED]: 31500,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  [FEDERAL_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 11925, rate: 10 },
      { min: 11925, max: 48475, rate: 12 },
      { min: 48475, max: 103350, rate: 22 },
      { min: 103350, max: 197300, rate: 24 },
      { min: 197300, max: 250525, rate: 32 },
      { min: 250525, max: 626350, rate: 35 },
      { min: 626350, max: INFINITY, rate: 37 },
    ],
    [MARRIED]: [
      { min: 0, max: 23850, rate: 10 },
      { min: 23850, max: 96950, rate: 12 },
      { min: 96950, max: 206700, rate: 22 },
      { min: 206700, max: 394600, rate: 24 },
      { min: 394600, max: 501050, rate: 32 },
      { min: 501050, max: 751600, rate: 35 },
      { min: 751600, max: INFINITY, rate: 37 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 11925, rate: 10 },
      { min: 11925, max: 48475, rate: 12 },
      { min: 48475, max: 103350, rate: 22 },
      { min: 103350, max: 197300, rate: 24 },
      { min: 197300, max: 250525, rate: 32 },
      { min: 250525, max: 375800, rate: 35 },
      { min: 375800, max: INFINITY, rate: 37 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 17000, rate: 10 },
      { min: 17000, max: 64850, rate: 12 },
      { min: 64850, max: 103350, rate: 22 },
      { min: 103350, max: 197300, rate: 24 },
      { min: 197300, max: 250500, rate: 32 },
      { min: 250500, max: 626350, rate: 35 },
      { min: 626350, max: INFINITY, rate: 37 },
    ],
  },
  [SOCIAL_SECURITY]: {
    [ALL]: [{ min: 0, max: 176100, rate: 6.2 }],
  },
  [MEDICARE]: {
    [SINGLE]: [
      { min: 0, max: 200000, rate: 1.45 },
      { min: 200000, max: INFINITY, rate: 2.35 },
    ],
    [MARRIED]: [
      { min: 0, max: 250000, rate: 1.45 },
      { min: 250000, max: INFINITY, rate: 2.35 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 125000, rate: 1.45 },
      { min: 125000, max: INFINITY, rate: 2.35 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 200000, rate: 1.45 },
      { min: 200000, max: INFINITY, rate: 2.35 },
    ],
  },
} as TaxData;
