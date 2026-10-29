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
  // HB 559 (2026) moved Idaho's IRC conformity date to 2026-01-01,
  // retroactive to 2025-01-01 (Idaho Code 63-3004), and did not decouple
  // from the OBBBA standard-deduction increase, so Idaho picks it up.
  // Source: 2025 Form 40 instructions, Standard Deduction Worksheet.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  // Idaho publishes two rate schedules, not four: single and married filing
  // separately share one; MFJ, head of household and qualifying surviving
  // spouse share the doubled one, so head_of_household equals married here
  // by design.
  // Verified against the 2025 Form 40 worksheet and the Tax Commission's
  // Individual Income Tax Rate Schedule page.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4811, rate: 0 },
      { min: 4811, max: INFINITY, rate: 5.3 },
    ],
    [MARRIED]: [
      { min: 0, max: 9622, rate: 0 },
      { min: 9622, max: INFINITY, rate: 5.3 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4811, rate: 0 },
      { min: 4811, max: INFINITY, rate: 5.3 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 9622, rate: 0 },
      { min: 9622, max: INFINITY, rate: 5.3 },
    ],
  },
} as TaxData;
