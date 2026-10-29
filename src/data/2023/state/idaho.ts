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
  // Idaho starts from federal taxable income and conforms to the IRC
  // (Idaho Code 63-3004), so the federal standard deduction flows through.
  // Source: 2023 Form 40 instructions, Standard Deduction Worksheet.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  // Idaho publishes two rate schedules, not four: single and married filing
  // separately share one; MFJ, head of household and qualifying surviving
  // spouse share the doubled one, so head_of_household equals married here
  // by design.
  // Verified against the 2023 Form 40 tax computation worksheet.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4489, rate: 0 },
      { min: 4489, max: INFINITY, rate: 5.8 },
    ],
    [MARRIED]: [
      { min: 0, max: 8978, rate: 0 },
      { min: 8978, max: INFINITY, rate: 5.8 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4489, rate: 0 },
      { min: 4489, max: INFINITY, rate: 5.8 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 8978, rate: 0 },
      { min: 8978, max: INFINITY, rate: 5.8 },
    ],
  },
} as TaxData;
