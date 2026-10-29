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
  // tax year 2022. Source: 2023 IA 1040 Expanded Instructions, "Federal
  // Taxable Income" (line 2) and "Conformity with the Internal Revenue Code".
  // https://revenue.iowa.gov/sites/default/files/2024-04/2023%20Expanded%20Instructions_032924.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 6000, rate: 4.4 },
      { min: 6000, max: 30000, rate: 4.82 },
      { min: 30000, max: 75000, rate: 5.7 },
      { min: 75000, max: INFINITY, rate: 6 },
    ],
    [MARRIED]: [
      { min: 0, max: 12000, rate: 4.4 },
      { min: 12000, max: 60000, rate: 4.82 },
      { min: 60000, max: 150000, rate: 5.7 },
      { min: 150000, max: INFINITY, rate: 6 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 6000, rate: 4.4 },
      { min: 6000, max: 30000, rate: 4.82 },
      { min: 30000, max: 75000, rate: 5.7 },
      { min: 75000, max: INFINITY, rate: 6 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 6000, rate: 4.4 },
      { min: 6000, max: 30000, rate: 4.82 },
      { min: 30000, max: 75000, rate: 5.7 },
      { min: 75000, max: INFINITY, rate: 6 },
    ],
  },
} as TaxData;
