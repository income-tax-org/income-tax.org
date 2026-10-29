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
  // Unchanged from 2024. Head of household matching single is Georgia's
  // grouping of the two statuses, not a duplicated single figure.
  // Source: 2025 IT-511 booklet, Form 500 instructions, Line 11.
  // Amounts re-verified 2026-09-08 against the 2025 IT-511 booklet's
  // filing-requirement table: married filing jointly $24,000; single,
  // married filing separately, head of household and qualifying surviving
  // spouse $12,000 each.
  // Source: https://dor.georgia.gov/document/document/2025-it-511-individual-income-tax-booklet/download
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12000,
    [MARRIED]: 24000,
    [MARRIED_SEPARATELY]: 12000,
    [HEAD_OF_HOUSEHOLD]: 12000,
  },
  // Verified 2026-09-08 against the 2025 IT-511 booklet: "2025 Income Tax
  // Changes: Effective January 1, 2025, the income tax rate is 5.19%", and
  // Form 500 line 16, "Multiply Line 15c by 5.19%".
  // Source: https://dor.georgia.gov/document/document/2025-it-511-individual-income-tax-booklet/download
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 5.19 }],
  },
} as TaxData;
