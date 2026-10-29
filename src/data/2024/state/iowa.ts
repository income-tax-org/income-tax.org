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
  // Iowa starts from federal taxable income (IA 1040 line 2 is federal Form
  // 1040 line 15), so the federal standard deduction flows through and Iowa
  // has none of its own. Its separate $2,210 / $5,450 deduction ended with
  // tax year 2022. Source: 2024 IA 1040 Expanded Instructions, "Federal
  // Taxable Income" (line 2) and "Conformity with the Internal Revenue Code".
  // https://revenue.iowa.gov/media/4152/download?inline=
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 6210, rate: 4.4 },
      { min: 6210, max: 31050, rate: 4.82 },
      { min: 31050, max: INFINITY, rate: 5.7 },
    ],
    [MARRIED]: [
      { min: 0, max: 12420, rate: 4.4 },
      { min: 12420, max: 62100, rate: 4.82 },
      { min: 62100, max: INFINITY, rate: 5.7 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 6210, rate: 4.4 },
      { min: 6210, max: 31050, rate: 4.82 },
      { min: 31050, max: INFINITY, rate: 5.7 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 6210, rate: 4.4 },
      { min: 6210, max: 31050, rate: 4.82 },
      { min: 31050, max: INFINITY, rate: 5.7 },
    ],
  },
} as TaxData;
