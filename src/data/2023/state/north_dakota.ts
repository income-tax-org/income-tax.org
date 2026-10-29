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
  // These are the federal 2023 amounts.
  // Source: ND Individual Income Tax Booklet, "Federal Taxable Income".
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  // HB 1158 (2023) replaced ND's five-bracket schedule with these three
  // brackets. The bracket boundaries are indexed for inflation every year, so
  // no two years share a schedule.
  // Verified against the 2023 Tax Rate Schedules, page 28 of the Form ND-1
  // booklet. The published subtraction amounts reconcile with the boundaries:
  // single $3,534.38 = 1.95% x ($225,975 - $44,725); joint $3,906.83 = 1.95%
  // x ($275,100 - $74,750); separate $1,953.41 = 1.95% x ($137,550 -
  // $37,375); head of household $3,716.70 = 1.95% x ($250,550 - $59,950).
  // https://www.tax.nd.gov/sites/www/files/documents/forms/individual/2023-iit/2023-individual-income-tax-booklet.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 44725, rate: 0 },
      { min: 44725, max: 225975, rate: 1.95 },
      { min: 225975, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 74750, rate: 0 },
      { min: 74750, max: 275100, rate: 1.95 },
      { min: 275100, max: INFINITY, rate: 2.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 37375, rate: 0 },
      { min: 37375, max: 137550, rate: 1.95 },
      { min: 137550, max: INFINITY, rate: 2.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 59950, rate: 0 },
      { min: 59950, max: 250550, rate: 1.95 },
      { min: 250550, max: INFINITY, rate: 2.5 },
    ],
  },
} as TaxData;
