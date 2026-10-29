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
    [ALL]: [
      { min: 0, max: 270000, rate: 0 },
      { min: 270000, max: INFINITY, rate: 7 },
    ],
  },
} as TaxData;
