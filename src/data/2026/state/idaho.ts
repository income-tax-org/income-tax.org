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
  // Idaho conforms to the IRC as of 2026-01-01 (Idaho Code 63-3004, as
  // amended by HB 559 (2026)) and uses the federal standard deduction.
  // Source: IRS Rev. Proc. 2025-32 federal 2026 amounts.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  // Idaho publishes two rate schedules, not four: single and married filing
  // separately share one; MFJ, head of household and qualifying surviving
  // spouse share the doubled one, so head_of_household equals married here
  // by design.
  // CARRIED FROM 2025 — Idaho indexes the zero-rate bracket top annually and
  // has not published 2026 yet: its rate schedule page still ends at 2025 and
  // the 2026 withholding tables encode only the standard deduction. The 5.3%
  // rate IS confirmed for 2026 (EPB00744, rev. 2026-07-23). Revisit when the
  // 2026 Form 40 is released.
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
