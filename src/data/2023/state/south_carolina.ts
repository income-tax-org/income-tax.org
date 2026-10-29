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
  // South Carolina begins from federal taxable income, so the federal
  // standard deduction is already reflected before SC computes tax.
  // Verified 2026-09-08: SC1040 Instructions 2024 state SC "conforms to the
  // Internal Revenue Code as amended through December 31, 2023", so the
  // federal TY2023 amounts flow through unchanged.
  // Source: https://dor.sc.gov/forms-site/Forms/SC1040Instr_2024.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  // CORRECTED 2026-09-08. Was 0 / 3,460 / 17,330, which is the schedule
  // printed in WH-1603F_2023.pdf -- but that file is the *withholding*
  // formula, and SCDOR publishes it in November of the preceding year off
  // the prior year's indexing. The TY2023 boundaries are 3,330 and 16,770.
  //
  // SC publishes ONE schedule used by every filing status, so the four
  // identical ladders are correct rather than a status copied over another.
  //
  // Reconciliation -- SC1041's "2023 Tax Computation Schedule for Estates and
  // Trusts" prints "3% times the amount minus $100" and "6.4% times the
  // amount minus $670", and only the correct boundaries reproduce those:
  //   3% x 3,330                       = $99.90  -> printed $100
  //   continuity at T2: 0.064*T2 - 670 = 0.03*T2 - 99.90
  //                                    -> 0.034*T2 = 570.10 -> T2 = 16,770
  //   check: 0.034 x 16,770 + 99.90    = $670.08 -> printed $670
  // The same schedule's "But less than" column reads 16,680, which would give
  // a constant of $667.02, not the $670 printed beside it. SC's own form
  // disagrees with itself here; the subtraction constant is the half that is
  // right. Independently, SC1040TT_2023 (the 1,070-row official tax table)
  // is reproduced by 3,330/16,770 at 6.4% for 1,069 of 1,070 rows -- the sole
  // miss being the row that straddles the bracket boundary -- against 67 of
  // 1,070 for the figures previously stored here.
  // Top rate 6.4% per SCDOR: "0 to a top rate of 6.4% for tax year 2023".
  // Sources: https://dor.sc.gov/forms-site/Forms/SC1041_2023.pdf
  //          https://dor.sc.gov/forms-site/Forms/SC1040TT_2023.pdf
  //          https://dor.sc.gov/tax/individual-income
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3330, rate: 0 },
      { min: 3330, max: 16770, rate: 3 },
      { min: 16770, max: INFINITY, rate: 6.4 },
    ],
    [MARRIED]: [
      { min: 0, max: 3330, rate: 0 },
      { min: 3330, max: 16770, rate: 3 },
      { min: 16770, max: INFINITY, rate: 6.4 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3330, rate: 0 },
      { min: 3330, max: 16770, rate: 3 },
      { min: 16770, max: INFINITY, rate: 6.4 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 3330, rate: 0 },
      { min: 3330, max: 16770, rate: 3 },
      { min: 16770, max: INFINITY, rate: 6.4 },
    ],
  },
} as TaxData;
