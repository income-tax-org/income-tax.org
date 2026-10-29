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
  // SC begins from federal taxable income and conforms to the IRC only "as
  // amended through December 31, 2024", so the OBBBA increase does not flow
  // through and these are the pre-OBBBA TY2025 federal amounts.
  // Verified 2026-09-08 against SC Information Letter #26-4 (Revised),
  // 2026-01-30: OBBBA passed after the 2025 session adjourned, "South
  // Carolina has not had an opportunity to consider these federal changes",
  // and taxpayers must adjust their return for the standard deduction, which
  // OBBBA "increased by $750 for Single and Married Filing Separately, $1,125
  // for Head of Household, and $1,500 for Married Filing Jointly".
  // Source: https://dor.sc.gov/sites/dor/files/policies/IL26-4.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15000,
    [MARRIED]: 30000,
    [MARRIED_SEPARATELY]: 15000,
    [HEAD_OF_HOUSEHOLD]: 22500,
  },
  // CORRECTED 2026-09-08: was 0 / 3,460 / 17,330 at a 6.2% top rate, which is
  // TY2024's schedule. Both boundaries and the rate were wrong.
  //
  // Boundaries $3,560 and $17,830 are printed outright in WH-1603F (2025),
  // rev. 11/12/24. That document's *rate* is stale -- it says 6.2%, because
  // it went out before the reduction to 6% took effect -- so the rate comes
  // from SCDOR's own rate history instead: "0 to a top rate of 6% for tax
  // year 2025".
  //
  // Reconciliation: SC1040TT_2025, the 1,070-row official tax table, is
  // reproduced exactly, every row, by 3,560/17,830 at 6.0%. The withholding
  // document's 6.2% misses 821 rows and the figures previously stored here
  // missed 1,000 of 1,070. At $21,000 of taxable income the table says $615;
  // this schedule gives $615.30 and the old one gave $640.54.
  // Sources: https://dor.sc.gov/forms-site/Forms/WH1603F_2025.pdf
  //          https://dor.sc.gov/forms-site/Forms/SC1040TT_2025.pdf
  //          https://dor.sc.gov/tax/individual-income
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 3560, rate: 0 },
      { min: 3560, max: 17830, rate: 3 },
      { min: 17830, max: INFINITY, rate: 6 },
    ],
  },
} as TaxData;
