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
  // Verified 2026-09-08: the SC1040 Instructions for 2024 state SC "conforms
  // to the Internal Revenue Code as amended through December 31, 2023", so
  // the federal TY2024 amounts flow through unchanged.
  // Source: https://dor.sc.gov/forms-site/Forms/SC1040Instr_2024.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  // CORRECTED 2026-09-08: second boundary 17,330 -> 17,350. 17,330 is the
  // figure in WH-1603F_2024.pdf, the *withholding* formula, which SCDOR
  // published in November 2023 (it also still carries the superseded 6.4%
  // rate). The rate here was already right.
  //
  // SC publishes ONE schedule used by every filing status, so the four
  // identical ladders are correct rather than a status copied over another.
  //
  // Reconciliation -- SC1041's "2024 Tax Computation Schedule for Estates and
  // Trusts" prints "3% times the amount minus $104" and "6.2% times the
  // amount minus $659":
  //   3% x 3,460                       = $103.80 -> printed $104
  //   continuity at T2: 0.062*T2 - 659 = 0.03*T2 - 103.80
  //                                    -> 0.032*T2 = 555.20 -> T2 = 17,350
  // exactly. The same schedule's "But less than" column reads 17,330, which
  // would give $658.36 -> $658, not the $659 printed beside it.
  // Independently, SC1040TT_2024 (the 1,070-row official tax table) is
  // reproduced exactly, all 1,070 rows, by 3,460/17,350 at 6.2%; the figures
  // previously stored here missed 578 of them.
  // Top rate 6.2% per SCDOR: "0 to a top rate of 6.2% for tax year 2024".
  // Sources: https://dor.sc.gov/forms-site/Forms/SC1041_2024.pdf
  //          https://dor.sc.gov/forms-site/Forms/SC1040TT_2024.pdf
  //          https://dor.sc.gov/tax/individual-income
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17350, rate: 3 },
      { min: 17350, max: INFINITY, rate: 6.2 },
    ],
    [MARRIED]: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17350, rate: 3 },
      { min: 17350, max: INFINITY, rate: 6.2 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17350, rate: 3 },
      { min: 17350, max: INFINITY, rate: 6.2 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 3460, rate: 0 },
      { min: 3460, max: 17350, rate: 3 },
      { min: 17350, max: INFINITY, rate: 6.2 },
    ],
  },
} as TaxData;
