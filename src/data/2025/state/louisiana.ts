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
  // Act 11 of the 2024 Third Extraordinary Session replaced the old combined
  // personal exemption-standard deduction with a real standard deduction of
  // $12,500 for single and married filing separately, and double that for
  // married filing jointly, qualifying surviving spouse AND head of
  // household - so head of household matching the married amount is correct.
  // Source: Revenue Information Bulletin 25-012 (2025-03-07), section 4.
  // https://dam.ldr.la.gov/lawspolicies/RIB-25-012-Louisiana-Individual-Income-Tax-Reform-1.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 12500,
    [MARRIED]: 25000,
    [MARRIED_SEPARATELY]: 12500,
    [HEAD_OF_HOUSEHOLD]: 25000,
  },
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 3 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 3 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3 }],
  },
} as TaxData;
