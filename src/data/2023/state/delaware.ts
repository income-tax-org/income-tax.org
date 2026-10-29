import { GROSS_INCOME_BASIS, INFINITY } from "@/constants";
import { WILMINGTON, CITIES } from "@/constants/cities";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  STANDARD_DEDUCTION,
  STATE_INCOME,
  CITY_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // VERIFIED 2026-09-08. Not indexed and not a form figure -- 30 Del. C.
  // sec. 1108(a)(3) fixes it in statute: "For taxable periods beginning after
  // December 31, 1999, the standard deduction of a resident individual shall be
  // $3,250, and the standard deduction of resident spouses shall be $6,500 if
  // they file a joint return and $3,250 each if they file separate returns."
  // Delaware has no separate head-of-household amount; filing status 5 (head of
  // household) takes the $3,250 resident-individual figure, which the PIT-RES
  // instructions confirm line by line. Correct as stored, all four statuses.
  // https://delcode.delaware.gov/title30/c011/sc02/index.html
  // https://revenuefiles.delaware.gov/2025/PITForms_Instructions/Instructions/PIT-RES_Instructions_2025-01.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 3250,
    [MARRIED]: 6500,
    [MARRIED_SEPARATELY]: 3250,
    [HEAD_OF_HOUSEHOLD]: 3250,
  },
  // VERIFIED 2026-09-08 against 30 Del. C. sec. 1102(a)(14), the schedule in
  // force since tax year 2014 and unamended since: 2.2% over $2,000, 3.9% over
  // $5,000, 4.8% over $10,000, 5.2% over $20,000, 5.55% over $25,000 and 6.6%
  // over $60,000, with the first $2,000 untaxed. The statute states one
  // schedule and draws no distinction by filing status, which is why every
  // status shares it.
  // Cross-checked arithmetically against the Division of Revenue's own
  // cumulative column, which reconciles only with these boundaries:
  //   3,000 x 2.2%  = $66.00    -> $66      at the $5,000 floor
  //   5,000 x 3.9%  = $195.00   -> $261     at the $10,000 floor
  //  10,000 x 4.8%  = $480.00   -> $741     at the $20,000 floor
  //   5,000 x 5.2%  = $260.00   -> $1,001   at the $25,000 floor
  //  35,000 x 5.55% = $1,942.50 -> $2,943.50 at the $60,000 floor
  // and $2,943.50 is exactly what the state income tax schedule printed at the
  // end of the tax table prints for $60,000 before the 6.60% top rate.
  // https://delcode.delaware.gov/title30/c011/sc01/index.html
  // https://revenuefiles.delaware.gov/2023/TY23_taxtable.pdf (2023 State Income
  // Tax Schedule)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 2000, rate: 0 },
      { min: 2000, max: 5000, rate: 2.2 },
      { min: 5000, max: 10000, rate: 3.9 },
      { min: 10000, max: 20000, rate: 4.8 },
      { min: 20000, max: 25000, rate: 5.2 },
      { min: 25000, max: 60000, rate: 5.55 },
      { min: 60000, max: INFINITY, rate: 6.6 },
    ],
    [MARRIED]: [
      { min: 0, max: 2000, rate: 0 },
      { min: 2000, max: 5000, rate: 2.2 },
      { min: 5000, max: 10000, rate: 3.9 },
      { min: 10000, max: 20000, rate: 4.8 },
      { min: 20000, max: 25000, rate: 5.2 },
      { min: 25000, max: 60000, rate: 5.55 },
      { min: 60000, max: INFINITY, rate: 6.6 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 2000, rate: 0 },
      { min: 2000, max: 5000, rate: 2.2 },
      { min: 5000, max: 10000, rate: 3.9 },
      { min: 10000, max: 20000, rate: 4.8 },
      { min: 20000, max: 25000, rate: 5.2 },
      { min: 25000, max: 60000, rate: 5.55 },
      { min: 60000, max: INFINITY, rate: 6.6 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 2000, rate: 0 },
      { min: 2000, max: 5000, rate: 2.2 },
      { min: 5000, max: 10000, rate: 3.9 },
      { min: 10000, max: 20000, rate: 4.8 },
      { min: 20000, max: 25000, rate: 5.2 },
      { min: 25000, max: 60000, rate: 5.55 },
      { min: 60000, max: INFINITY, rate: 6.6 },
    ],
  },
  [CITIES]: {
    [WILMINGTON]: {
      // 22 Del. C. sec. 903 defines the base as "the total income from
      // whatever source earned by any resident of such city", and the City's
      // own budget states it outright -- "WAGE TAX / Base: Individual gross
      // earned income of City residents." Delaware's $3,250 standard deduction
      // is a Title 30 personal-income-tax figure and does not reach this tax,
      // so the rate must not be charged on income after it. Same defect, and
      // same fix, as the Missouri earnings taxes.
      // Rate 1.25% is the statutory ceiling in 22 Del. C. sec. 902 and the rate
      // actually levied; unchanged FY2025 through FY2027.
      // https://delcode.delaware.gov/title22/c009/index.html
      // https://wilmdebudget.org/wp-content/uploads/2026/03/fy27-tax-rates.pdf
      [CITY_INCOME]: {
        [SINGLE]: [
          { min: 0, max: INFINITY, rate: 1.25, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED]: [
          { min: 0, max: INFINITY, rate: 1.25, basis: GROSS_INCOME_BASIS },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: INFINITY, rate: 1.25, basis: GROSS_INCOME_BASIS },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: INFINITY, rate: 1.25, basis: GROSS_INCOME_BASIS },
        ],
      },
    },
  },
} as TaxData;
