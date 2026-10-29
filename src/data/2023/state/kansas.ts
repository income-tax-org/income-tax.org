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
  // Corrected 2026-09-07: MARRIED_SEPARATELY was 3500, a copy of SINGLE.
  // Kansas publishes 4000. The other three are correct.
  // MARRIED_SEPARATELY being exactly half of MARRIED is real, not a
  // derivation: K.S.A. 79-32,119(d) fixes the separate-return deduction
  // "on the basis that separate federal returns were filed", and the
  // booklet prints the exact half.
  // Source: 2023 K-40 booklet, "Kansas Standard Deduction" (line 4), and
  // K.S.A. 79-32,119(c)(1), which sets 3,500 / 8,000 / 6,000 for tax years
  // 2021 through 2023.
  // https://www.ksrevenue.gov/pdf/ip23.pdf
  // https://www.ksrevisor.gov/statutes/chapters/ch79/079_032_0119.html
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 3500,
    [MARRIED]: 8000,
    [MARRIED_SEPARATELY]: 4000,
    [HEAD_OF_HOUSEHOLD]: 6000,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 15000, rate: 3.1 },
      { min: 15000, max: 30000, rate: 5.25 },
      { min: 30000, max: INFINITY, rate: 5.7 },
    ],
    [MARRIED]: [
      { min: 0, max: 30000, rate: 3.1 },
      { min: 30000, max: 60000, rate: 5.25 },
      { min: 60000, max: INFINITY, rate: 5.7 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 15000, rate: 3.1 },
      { min: 15000, max: 30000, rate: 5.25 },
      { min: 30000, max: INFINITY, rate: 5.7 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 15000, rate: 3.1 },
      { min: 15000, max: 30000, rate: 5.25 },
      { min: 30000, max: INFINITY, rate: 5.7 },
    ],
  },
} as TaxData;
