import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Montana's own pre-SB-399 deduction, and the one state here whose schedule
  // runs the other way: it RISES with income to a cap rather than phasing
  // out. The 5,540 / 11,080 this file used to carry alone are the caps, which
  // a filer only reaches at 27,700 / 55,400 of Montana AGI; beneath that the
  // deduction is 20% of AGI, and beneath 12,300 / 24,600 it is the statutory
  // minimum. That is what `percent_of_income` is for, with `floor` the
  // minimum and `amount` the cap.
  //
  // Head of household is grouped with married filing jointly here, not with
  // single. That is deliberate, not a copy of MARRIED: the worksheet says
  // "married filing jointly or head of household" on both its cap and its
  // minimum lines.
  //
  // The whole rule is the 2023 Form 2, page 7, Standard Deduction Worksheet,
  // in its own six lines:
  //
  //   1 Enter your Montana Adjusted Gross Income from page 1, line 14
  //   2 Multiply the amount on line 1 by 20% (0.20)
  //   3 If you are single or married filing separately, enter $5,540. If you
  //     are married filing jointly or head of household, enter $11,080.
  //   4 Enter the amount from line 2 or line 3, whichever is smaller
  //   5 If you are single or married filing separately, enter $2,460. If you
  //     are married filing jointly or head of household, enter $4,920.
  //   6 Enter the amount from line 4 or line 5, whichever is larger
  //
  // The first band is that worksheet entire; the second is the range where
  // line 3 always wins, so it is written as the flat cap.
  //
  // Cross-checked against the worksheet. Single on 20,000 of AGI: line 2 =
  // 4,000, line 3 = 5,540, line 4 = 4,000, line 5 = 2,460, line 6 = $4,000.
  // Single on 10,000: line 2 = 2,000, line 4 = 2,000, line 6 = $2,460, the
  // minimum. Single on 27,700: line 2 = 5,540, which is line 3 exactly - the
  // boundary between the two bands, and the deduction is $5,540 from either
  // side. Joint on 40,000: line 2 = 8,000, under the 11,080 cap and over the
  // 4,920 minimum, so $8,000.
  //
  // The worksheet keys on Montana AGI (Form 2, line 14); the calculator picks
  // the band with income after retirement contributions, its AGI proxy.
  //
  // This is 2023 only. SB 399 moved Montana's base to federal taxable income
  // from tax year 2024 (15-30-2120, MCA), so the federal standard deduction
  // flows through and there is nothing left to phase; the 2024, 2025 and 2026
  // files carry the federal figures as flat numbers.
  //
  // Source: 2023 Montana Form 2, page 7, "Standard Deduction Worksheet".
  // https://mtrevenue.gov/files/Forms/Montana-Individual-Income-Tax-Return-Form-2/2023_Montana_Individual_Income_Tax_Return_Form_2.pdf
  // The 2023 Form 2 instructions state the same rule for prior years -
  // "Multiply the amount on the worksheet, line 13 by 20 percent (0.20)...
  // but not more than the maximum amount or less than the minimum amount".
  // https://mtrevenue.gov/files/forms/Montana-Individual-Income-Tax-Return-Form-2-Instructions/2023_Montana_Individual_Income_Tax_Return_Form_2_Instructions.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      {
        min: 0,
        max: 27700,
        amount: 5540,
        percent_of_income: 20,
        floor: 2460,
      },
      { min: 27700, max: INFINITY, amount: 5540 },
    ],
    [MARRIED]: [
      {
        min: 0,
        max: 55400,
        amount: 11080,
        percent_of_income: 20,
        floor: 4920,
      },
      { min: 55400, max: INFINITY, amount: 11080 },
    ],
    [MARRIED_SEPARATELY]: [
      {
        min: 0,
        max: 27700,
        amount: 5540,
        percent_of_income: 20,
        floor: 2460,
      },
      { min: 27700, max: INFINITY, amount: 5540 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      {
        min: 0,
        max: 55400,
        amount: 11080,
        percent_of_income: 20,
        floor: 4920,
      },
      { min: 55400, max: INFINITY, amount: 11080 },
    ],
  },
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 3600, rate: 1 },
      { min: 3600, max: 6300, rate: 2 },
      { min: 6300, max: 9700, rate: 3 },
      { min: 9700, max: 13000, rate: 4 },
      { min: 13000, max: 16800, rate: 5 },
      { min: 16800, max: 21600, rate: 6 },
      { min: 21600, max: INFINITY, rate: 6.75 },
    ],
  },
} as TaxData;
