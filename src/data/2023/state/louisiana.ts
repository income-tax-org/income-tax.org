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
  // Before 2025 this is Louisiana's "combined personal exemption-standard
  // deduction" (La. R.S. 47:294 as it then read), not a standard deduction:
  // $4,500 for single and married filing separately, $9,000 for married
  // filing jointly, qualifying surviving spouse and head of household.
  // Head of household is grouped with JOINT, not with single. Louisiana
  // publishes a separate "2023 Louisiana Tax Table - Head of Household
  // (Filing Status Box 4)" whose headnote reads $9,000, so a sweep that
  // expects head of household to track the single amount is wrong here.
  // (The dependent step does differ: HoH adds $1,000 for each exemption
  // over one, joint for each over two. Only the base figure lives here.)
  // Source: 2023 Louisiana Tax Table (IT-540), table headnotes, and Revenue
  // Information Bulletin 25-012 (2025-03-07), "4. Standard Deduction".
  // https://dam.ldr.la.gov/taxforms/IT540(2023)%20TT.pdf
  // https://dam.ldr.la.gov/lawspolicies/RIB-25-012-Louisiana-Individual-Income-Tax-Reform-1.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 4500,
    [MARRIED]: 9000,
    [MARRIED_SEPARATELY]: 4500,
    [HEAD_OF_HOUSEHOLD]: 9000,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 12500, rate: 1.85 },
      { min: 12500, max: 50000, rate: 3.5 },
      { min: 50000, max: INFINITY, rate: 4.25 },
    ],
    [MARRIED]: [
      { min: 0, max: 25000, rate: 1.85 },
      { min: 25000, max: 100000, rate: 3.5 },
      { min: 100000, max: INFINITY, rate: 4.25 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 12500, rate: 1.85 },
      { min: 12500, max: 50000, rate: 3.5 },
      { min: 50000, max: INFINITY, rate: 4.25 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 12500, rate: 1.85 },
      { min: 12500, max: 50000, rate: 3.5 },
      { min: 50000, max: INFINITY, rate: 4.25 },
    ],
  },
} as TaxData;
