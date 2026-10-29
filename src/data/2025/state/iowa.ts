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
  // tax year 2022. Source: 2025 IA 1040 Expanded Instructions, "Federal
  // Taxable Income" (line 2) and "Conformity with the Internal Revenue Code".
  // https://revenue.iowa.gov/taxes/tax-guidance/individual-income-tax/1040-expanded-instructions/iowa-taxable-income
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.8 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.8 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.8 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.8 }],
  },
} as TaxData;
