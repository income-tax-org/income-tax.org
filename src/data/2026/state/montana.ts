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
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 47500, rate: 4.7 },
      { min: 47500, max: INFINITY, rate: 5.65 },
    ],
    [MARRIED]: [
      { min: 0, max: 95000, rate: 4.7 },
      { min: 95000, max: INFINITY, rate: 5.65 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 47500, rate: 4.7 },
      { min: 47500, max: INFINITY, rate: 5.65 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 71250, rate: 4.7 },
      { min: 71250, max: INFINITY, rate: 5.65 },
    ],
  },
} as TaxData;
