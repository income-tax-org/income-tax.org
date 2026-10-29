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
  // Verified 2026-09-07: all four correct.
  // MARRIED_SEPARATELY being exactly half of MARRIED is real, not a
  // derivation: K.S.A. 79-32,119(d) fixes the separate-return deduction
  // "on the basis that separate federal returns were filed", and the
  // booklet prints the exact half.
  // Source: 2025 K-40 booklet, "Kansas Standard Deduction" (line 4).
  // Kansas does not index these; K.S.A. 79-32,119(c)(2) sets 3,605 /
  // 8,240 / 6,180 for "tax year 2024, and all tax years thereafter".
  // https://www.ksrevenue.gov/pdf/ip25.pdf
  // https://www.ksrevisor.gov/statutes/chapters/ch79/079_032_0119.html
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 3605,
    [MARRIED]: 8240,
    [MARRIED_SEPARATELY]: 4120,
    [HEAD_OF_HOUSEHOLD]: 6180,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 23000, rate: 5.2 },
      { min: 23000, max: INFINITY, rate: 5.58 },
    ],
    [MARRIED]: [
      { min: 0, max: 46000, rate: 5.2 },
      { min: 46000, max: INFINITY, rate: 5.58 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 23000, rate: 5.2 },
      { min: 23000, max: INFINITY, rate: 5.58 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 23000, rate: 5.2 },
      { min: 23000, max: INFINITY, rate: 5.58 },
    ],
  },
} as TaxData;
