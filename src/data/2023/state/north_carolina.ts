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
  // Verified 2026-09-08 against NCDOR's "North Carolina Standard Deduction or
  // North Carolina Itemized Deductions" page as it stood for tax year 2023:
  // single $12,750, married filing jointly $25,500, married filing
  // separately $12,750, head of household $19,125. Same figures as the
  // current G.S. 105-153.5(a)(1) table, which has no year-varying rows -- NC
  // does not index this, which is why 2023 through 2026 are identical rather
  // than a value copied forward.
  // Sources: https://web.archive.org/web/20240322144413/https://www.ncdor.gov/taxes-forms/individual-income-tax/north-carolina-standard-deduction-or-north-carolina-itemized-deductions
  //          https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.5.html
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12750,
    [MARRIED]: 25500,
    [MARRIED_SEPARATELY]: 12750,
    [HEAD_OF_HOUSEHOLD]: 19125,
  },
  // Verified 2026-09-08 against G.S. 105-153.7(a), which tabulates the rate
  // by year: "In 2022 4.99% / In 2023 4.75% / In 2024 4.5% / In 2025 4.25% /
  // After 2025 3.99%." NCDOR states the same for TY2023. This is a fixed
  // statutory glide path, not an indexed figure -- each year must be read
  // off the table rather than carried forward.
  // Sources: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_105/GS_105-153.7.html
  //          https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 4.75 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 4.75 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 4.75 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 4.75 }],
  },
} as TaxData;
