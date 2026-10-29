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
  // These are the federal 2026 amounts.
  // Source: ND Individual Income Tax Booklet, "Federal Taxable Income".
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  // Corrected: this file previously carried the 2025 boundaries. ND indexes
  // its brackets annually, so 2026 has its own set.
  // From the 2026 Forms ND-1 and ND-EZ Tax Rate Schedules printed on Form
  // ND-1ES, SFN 28709 (12-2025), page 3. The published subtraction amounts
  // reconcile with the boundaries: single $3,916.09 = 1.95% x ($250,400 -
  // $49,575); joint $4,329.98 = 1.95% x ($304,850 - $82,800); separate
  // $2,164.99 = 1.95% x ($152,425 - $41,400); head of household $4,118.40 =
  // 1.95% x ($277,600 - $66,400).
  // https://www.tax.nd.gov/sites/www/files/documents/forms/individual/2025-iit/28709-form-nd-1es-2026.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 49575, rate: 0 },
      { min: 49575, max: 250400, rate: 1.95 },
      { min: 250400, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 82800, rate: 0 },
      { min: 82800, max: 304850, rate: 1.95 },
      { min: 304850, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 41400, rate: 0 },
      { min: 41400, max: 152425, rate: 1.95 },
      { min: 152425, max: INFINITY, rate: 2.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 66400, rate: 0 },
      { min: 66400, max: 277600, rate: 1.95 },
      { min: 277600, max: INFINITY, rate: 2.5 },
    ],
  },
} as TaxData;
