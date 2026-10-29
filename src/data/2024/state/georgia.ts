import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STATE_INCOME, STANDARD_DEDUCTION } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // HB 1437's flat tax took effect in 2024 and set one $12,000 deduction for
  // every status except married filing jointly. Single and married filing
  // separately previously carried the pre-flat-tax $7,100. Head of household
  // matching single is Georgia's long-standing grouping, not a copy.
  // Source: 2024 IT-511 booklet, Form 500 instructions, Line 11.
  // Amounts re-verified 2026-09-08 against the 2024 IT-511 booklet, which
  // states them twice: in "2024 Income Tax Changes" ("Georgia standard
  // deductions have increased to $24,000 for Married filing jointly returns
  // and $12,000 for Single, Head of household, and Married filing separately
  // returns") and in the filing-requirement table.
  // Source: https://dor.georgia.gov/document/document/2024-it-511-individual-income-tax-booklet/download
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12000,
    [MARRIED]: 24000,
    [MARRIED_SEPARATELY]: 12000,
    [HEAD_OF_HOUSEHOLD]: 12000,
  },
  // Verified 2026-09-08 against the 2024 IT-511 booklet: "2024 Income Tax
  // Changes: Effective January 1, 2024, the income tax rate is 5.39%", and
  // Form 500 line 16, "Multiply Line 15c by 5.39%". HB 1437's flat tax
  // replaced the six-bracket ladder, so [ALL] is correct from this year.
  // Source: https://dor.georgia.gov/document/document/2024-it-511-individual-income-tax-booklet/download
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 5.39 }],
  },
} as TaxData;
