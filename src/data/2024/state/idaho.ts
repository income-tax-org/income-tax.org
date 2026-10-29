import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STATE_INCOME, STANDARD_DEDUCTION } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Idaho conforms to the IRC as of 2024-01-01 (Idaho Code 63-3004) and
  // uses the federal standard deduction.
  // Source: 2024 Form 40 instructions, Standard Deduction Worksheet.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  // Idaho publishes two rate schedules, not four: single and married filing
  // separately share one; MFJ, head of household and qualifying surviving
  // spouse share the doubled one, so head_of_household equals married here
  // by design.
  // Verified against the 2024 Form 40 instructions (EIN00046) worksheet.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4673, rate: 0 },
      { min: 4673, max: INFINITY, rate: 5.695 },
    ],
    [MARRIED]: [
      { min: 0, max: 9346, rate: 0 },
      { min: 9346, max: INFINITY, rate: 5.695 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4673, rate: 0 },
      { min: 4673, max: INFINITY, rate: 5.695 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 9346, rate: 0 },
      { min: 9346, max: INFINITY, rate: 5.695 },
    ],
  },
} as TaxData;
