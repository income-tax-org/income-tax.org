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
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  // Verified correct, and identical to 2023 on purpose. NMSA 1978 Section 7-2-7
  // as rewritten by HB 6 (Laws 2019, ch. 270, Section 12) fixed this table "for
  // any taxable year beginning on or after January 1, 2021" with no inflation
  // adjustment; nothing amended it until HB 252 replaced it for 2025. New
  // Mexico does not index its brackets, so 2021 through 2024 all share this
  // schedule.
  // The 2024 PIT-TRT look-up table confirms it independently: at the
  // $99,900-$100,000 row (midpoint $99,950) the tax is $4,618 single, $4,490
  // joint and head of household, $4,694 separate, all reproduced here to the
  // dollar. Its top-bracket bases ($10,008 single, $15,025 joint, $7,512
  // separate) are unchanged from 2023, confirming the schedule did not move.
  // Head of household shares the joint schedule per Section 7-2-7(B).
  // https://www.nmlegis.gov/Sessions/19%20Regular/final/HB0006.pdf
  // https://klvg4oyd4j.execute-api.us-west-2.amazonaws.com/prod/PublicFiles/34821a9573ca43e7b06dfad20f5183fd/8c12623f-2127-489a-886f-6efb1cd55d0e/2024pit-trt.pdf
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
