import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  INTEREST_AND_DIVIDENDS,
  NONE,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STATE_INCOME]: NONE,
  [INTEREST_AND_DIVIDENDS]: {
    [SINGLE]: [{ min: 2400, max: INFINITY, rate: 4 }],
    [MARRIED]: [{ min: 4800, max: INFINITY, rate: 4 }],
    [MARRIED_SEPARATELY]: [{ min: 2400, max: INFINITY, rate: 4 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 2400, max: INFINITY, rate: 4 }],
  },
} as TaxData;
