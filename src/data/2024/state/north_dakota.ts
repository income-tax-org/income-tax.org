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
  // These are the federal 2024 amounts.
  // Source: ND Individual Income Tax Booklet, "Federal Taxable Income".
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  // Verified against the 2024 Tax Rate Schedules, page 28 of the Form ND-1
  // booklet. The published subtraction amounts reconcile with the boundaries:
  // single $3,725.48 = 1.95% x ($238,200 - $47,150); joint $4,118.40 = 1.95%
  // x ($289,975 - $78,775); separate $2,059.20 = 1.95% x ($144,975 -
  // $39,375); head of household $3,918.04 = 1.95% x ($264,100 - $63,175).
  // https://www.tax.nd.gov/sites/www/files/documents/forms/individual/2024-iit/2024-individual-income-tax-booklet.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 47150, rate: 0 },
      { min: 47150, max: 238200, rate: 1.95 },
      { min: 238200, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 78775, rate: 0 },
      { min: 78775, max: 289975, rate: 1.95 },
      { min: 289975, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 39375, rate: 0 },
      { min: 39375, max: 144975, rate: 1.95 },
      { min: 144975, max: INFINITY, rate: 2.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 63175, rate: 0 },
      { min: 63175, max: 264100, rate: 1.95 },
      { min: 264100, max: INFINITY, rate: 2.5 },
    ],
  },
} as TaxData;
