import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against NCDOR's live standard deduction page, which
  // states it "applies to individuals for tax year 2025": $12,750 / $25,500 /
  // $12,750 / $19,125.
  // Source: https://www.ncdor.gov/taxes-forms/individual-income-tax/north-carolina-standard-deduction-or-north-carolina-itemized-deductions
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12750,
    [MARRIED]: 25500,
    [MARRIED_SEPARATELY]: 12750,
    [HEAD_OF_HOUSEHOLD]: 19125,
  },
  // Verified 2026-09-08: G.S. 105-153.7(a) "In 2025 4.25%", and NCDOR, "For
  // Taxable Years beginning in 2025, the North Carolina individual income tax
  // rate is 4.25% (0.0425)" per Session Law 2023-134.
  // Sources: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.7.html
  //          https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.25 }],
  },
} as TaxData;
