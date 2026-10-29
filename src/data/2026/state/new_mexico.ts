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
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  // Verified correct and unchanged from 2025. HB 252 (Laws 2024, ch. 67,
  // Section 5) wrote this table into NMSA 1978 Section 7-2-7 for "any taxable
  // year beginning on or after January 1, 2025" with no inflation-adjustment
  // clause, so it carries forward until amended. It has not been: the 2025
  // session touched Sections 7-2-12, 7-2-18.38 and 7-2-31.1 but not 7-2-7, and
  // the only income-tax act of the 2026 session was SB-151, corporate income
  // tax (LS-2025 and LS-2026 Legislative Summaries).
  // Corroborated by the withholding tables in force for wages paid on or after
  // January 1, 2026, which run the same 1.5/3.2/4.3/4.7/4.9/5.9 ladder over the
  // same bracket widths (FYI-104 Rev. 11/2025, monthly single: breakpoints
  // $2,046, $3,463, $6,213 and $18,171 x 12 sit a constant ~$8,054 above
  // $16,500, $33,500, $66,500 and $210,000). Those are withholding thresholds,
  // not the rate schedule -- the schedule below is Section 7-2-7 verbatim.
  // Head of household shares the joint schedule per Section 7-2-7(A).
  // https://www.nmlegis.gov/Sessions/24%20Regular/final/HB0252.pdf
  // https://realfile.tax.newmexico.gov/FYI-104.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 5500, rate: 1.5 },
      { min: 5500, max: 16500, rate: 3.2 },
      { min: 16500, max: 33500, rate: 4.3 },
      { min: 33500, max: 66500, rate: 4.7 },
      { min: 66500, max: 210000, rate: 4.9 },
      { min: 210000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 8000, rate: 1.5 },
      { min: 8000, max: 25000, rate: 3.2 },
      { min: 25000, max: 50000, rate: 4.3 },
      { min: 50000, max: 100000, rate: 4.7 },
      { min: 100000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4000, rate: 1.5 },
      { min: 4000, max: 12500, rate: 3.2 },
      { min: 12500, max: 25000, rate: 4.3 },
      { min: 25000, max: 50000, rate: 4.7 },
      { min: 50000, max: 157500, rate: 4.9 },
      { min: 157500, max: INFINITY, rate: 5.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 8000, rate: 1.5 },
      { min: 8000, max: 25000, rate: 3.2 },
      { min: 25000, max: 50000, rate: 4.3 },
      { min: 50000, max: 100000, rate: 4.7 },
      { min: 100000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
  },
} as TaxData;
