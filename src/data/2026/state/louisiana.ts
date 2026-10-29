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
  // Act 11's standard deduction, with the first annual CPI-U adjustment
  // required by La. R.S. 47:294(B). Head of household doubles the single
  // amount, as it has since 2025.
  // CAVEAT: LDR set these from CPI-U data available 2025-12-01 and says "the
  // official 2026 standard deduction amounts may be slightly different based
  // on CPI-U data released in January 2026"; its 2026-02-10 rulemaking still
  // carries $12,875 / $25,750, so they stand as the only published figures.
  // Source: Form R-1306, 2026 Louisiana Withholding Tables and Formulas,
  // "2026 Standard Deduction"; RIB 26-005, Updated Withholding Tables.
  // https://dam.ldr.la.gov/taxforms/1306-1-26.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12875,
    [MARRIED]: 25750,
    [MARRIED_SEPARATELY]: 12875,
    [HEAD_OF_HOUSEHOLD]: 25750,
  },
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 3 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 3 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3 }],
  },
} as TaxData;
