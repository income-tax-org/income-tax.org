import { INFINITY } from "@/constants";
import { ALL } from "@/constants/filing-status";
import {
  CAPITAL_GAINS,
  NONE,
  STATE_INCOME,
  WASHINGTON_CARES_FUND,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STATE_INCOME]: NONE,
  [WASHINGTON_CARES_FUND]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 0.58 }],
  },
  [CAPITAL_GAINS]: {
    // Standard deduction $278,000 (DOR, indexed annually). The 9.9% tier is
    // the 2.9-point surcharge SB 5813 added on Washington capital gains above
    // $1,000,000, i.e. $278,000 + $1,000,000 of gains.
    [ALL]: [
      { min: 0, max: 278000, rate: 0 },
      { min: 278000, max: 1278000, rate: 7 },
      { min: 1278000, max: INFINITY, rate: 9.9 },
    ],
  },
} as TaxData;
