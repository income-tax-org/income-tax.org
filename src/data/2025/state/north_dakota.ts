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
  // North Dakota starts from federal taxable income and perpetually conforms
  // to it, so the federal standard deduction flows through; ND has none of
  // its own.
  // The OBBBA standard-deduction increase therefore flows straight through
  // to 2025. Source: ND 2025 Individual Income Tax Booklet, "Federal
  // Taxable Income — One Big Beautiful Bill Act (OBBBA)".
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  // Corrected: this file previously carried the 2024 boundaries. ND indexes
  // its brackets annually, so 2025 has its own set.
  // From the 2025 Tax Rate Schedules, page 28 of the Form ND-1 booklet. The
  // published subtraction amounts reconcile with the boundaries: single
  // $3,828.83 = 1.95% x ($244,825 - $48,475); joint $4,233.45 = 1.95% x
  // ($298,075 - $80,975); separate $2,116.73 = 1.95% x ($149,025 - $40,475);
  // head of household $4,026.75 = 1.95% x ($271,450 - $64,950).
  // https://www.tax.nd.gov/sites/www/files/documents/forms/individual/2025-iit/2025-individual-income-tax-booklet.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 48475, rate: 0 },
      { min: 48475, max: 244825, rate: 1.95 },
      { min: 244825, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 80975, rate: 0 },
      { min: 80975, max: 298075, rate: 1.95 },
      { min: 298075, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 40475, rate: 0 },
      { min: 40475, max: 149025, rate: 1.95 },
      { min: 149025, max: INFINITY, rate: 2.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 64950, rate: 0 },
      { min: 64950, max: 271450, rate: 1.95 },
      { min: 271450, max: INFINITY, rate: 2.5 },
    ],
  },
} as TaxData;
