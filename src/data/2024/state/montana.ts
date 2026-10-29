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
  // SB 399 moved Montana's base to federal taxable income starting with tax
  // year 2024 (15-30-2120, MCA), so the federal standard deduction flows
  // through; Montana no longer has a specific standard deduction of its own.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 20500, rate: 4.7 },
      { min: 20500, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 41000, rate: 4.7 },
      { min: 41000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 20500, rate: 4.7 },
      { min: 20500, max: INFINITY, rate: 5.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 30750, rate: 4.7 },
      { min: 30750, max: INFINITY, rate: 5.9 },
    ],
  },
} as TaxData;
