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
  // Verified 2026-09-08 against NCDOR's standard deduction page as it stood
  // for tax year 2024: $12,750 / $25,500 / $12,750 / $19,125, unchanged.
  // NC does not index this figure; G.S. 105-153.5(a)(1) states one table
  // with no year rows.
  // Source: https://web.archive.org/web/20250401000000/https://www.ncdor.gov/taxes-forms/individual-income-tax/north-carolina-standard-deduction-or-north-carolina-itemized-deductions
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12750,
    [MARRIED]: 25500,
    [MARRIED_SEPARATELY]: 12750,
    [HEAD_OF_HOUSEHOLD]: 19125,
  },
  // Verified 2026-09-08: G.S. 105-153.7(a) "In 2024 4.5%", and NCDOR's Tax
  // Rate Schedules page, "For Tax Year 2024, the North Carolina individual
  // income tax rate is 4.50% (0.0450)."
  // Sources: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.7.html
  //          https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules
  [STATE_INCOME]: {
    [SINGLE]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.5,
      },
    ],
    [MARRIED]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.5,
      },
    ],
    [MARRIED_SEPARATELY]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.5,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.5,
      },
    ],
  },
} as TaxData;
