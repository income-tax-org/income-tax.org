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
  // New Mexico uses the federal standard deduction amounts.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  // Verified correct. New Mexico did not index or otherwise change its brackets
  // between 2021 and 2024: NMSA 1978 Section 7-2-7, as rewritten by HB 6 (Laws
  // 2019, ch. 270, Section 12), fixed this table "for any taxable year
  // beginning on or after January 1, 2021" with no inflation adjustment, and it
  // stood until HB 252 replaced it for 2025. So 2023 and 2024 holding the same
  // schedule is the published position, not a stale copy.
  // Section 7-2-7's printed cumulative figures pin the boundaries: single
  // $93.50 = 1.7% x $5,500; $269.50 = $93.50 + 3.2% x $5,500; $504.50 =
  // $269.50 + 4.7% x $5,000; $10,010.50 = $504.50 + 4.9% x $194,000. Joint:
  // $136 / $392 / $768 / $15,027. Separate: $68 / $196 / $384 / $7,513.50.
  // The 2023 PIT-TRT look-up table agrees independently -- its tax at the
  // $95,900-$96,000 row (midpoint $95,950) is $4,422 single, $4,294 joint and
  // head of household, $4,498 separate, all reproduced here to the dollar.
  // Head of household shares the joint schedule (Section 7-2-7(B) covers
  // "heads of household, surviving spouses and married individuals filing
  // joint returns").
  // https://www.nmlegis.gov/Sessions/19%20Regular/final/HB0006.pdf
  // https://klvg4oyd4j.execute-api.us-west-2.amazonaws.com/prod/PublicFiles/34821a9573ca43e7b06dfad20f5183fd/2625dee3-89f5-47da-8e1d-1447a5b9882d/2023trt.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 5500, rate: 1.7 },
      { min: 5500, max: 11000, rate: 3.2 },
      { min: 11000, max: 16000, rate: 4.7 },
      { min: 16000, max: 210000, rate: 4.9 },
      { min: 210000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 8000, rate: 1.7 },
      { min: 8000, max: 16000, rate: 3.2 },
      { min: 16000, max: 24000, rate: 4.7 },
      { min: 24000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4000, rate: 1.7 },
      { min: 4000, max: 8000, rate: 3.2 },
      { min: 8000, max: 12000, rate: 4.7 },
      { min: 12000, max: 157500, rate: 4.9 },
      { min: 157500, max: INFINITY, rate: 5.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 8000, rate: 1.7 },
      { min: 8000, max: 16000, rate: 3.2 },
      { min: 16000, max: 24000, rate: 4.7 },
      { min: 24000, max: 315000, rate: 4.9 },
      { min: 315000, max: INFINITY, rate: 5.9 },
    ],
  },
} as TaxData;
