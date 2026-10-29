import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  FEDERAL_INCOME,
  MAX_401K_CONTRIBUTION,
  MEDICARE,
  SOCIAL_SECURITY,
  STANDARD_DEDUCTION,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [MAX_401K_CONTRIBUTION]: 23000,
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED_SEPARATELY]: 14600,
    [MARRIED]: 29200,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  [FEDERAL_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 11600, rate: 10 },
      { min: 11600, max: 47150, rate: 12 },
      { min: 47150, max: 100525, rate: 22 },
      { min: 100525, max: 191950, rate: 24 },
      { min: 191950, max: 243725, rate: 32 },
      { min: 243725, max: 609350, rate: 35 },
      { min: 609350, max: INFINITY, rate: 37 },
    ],
    [MARRIED]: [
      { min: 0, max: 23200, rate: 10 },
      { min: 23200, max: 94300, rate: 12 },
      { min: 94300, max: 201050, rate: 22 },
      { min: 201050, max: 383900, rate: 24 },
      { min: 383900, max: 487450, rate: 32 },
      { min: 487450, max: 731200, rate: 35 },
      { min: 731200, max: INFINITY, rate: 37 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 11600, rate: 10 },
      { min: 11600, max: 47150, rate: 12 },
      { min: 47150, max: 100525, rate: 22 },
      { min: 100525, max: 191950, rate: 24 },
      { min: 191950, max: 243725, rate: 32 },
      { min: 243725, max: 365600, rate: 35 },
      { min: 365600, max: INFINITY, rate: 37 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 16550, rate: 10 },
      { min: 16550, max: 63100, rate: 12 },
      { min: 63100, max: 100500, rate: 22 },
      { min: 100500, max: 191950, rate: 24 },
      { min: 191950, max: 243700, rate: 32 },
      { min: 243700, max: 609350, rate: 35 },
      { min: 609350, max: INFINITY, rate: 37 },
    ],
  },
  [SOCIAL_SECURITY]: {
    [ALL]: [{ min: 0, max: 168600, rate: 6.2 }],
  },
  [MEDICARE]: {
    [SINGLE]: [
      { min: 0, max: 200000, rate: 1.45 },
      { min: 200000, max: INFINITY, rate: 2.35 },
    ],
    [MARRIED]: [
      { min: 0, max: 250000, rate: 1.45 },
      { min: 250000, max: INFINITY, rate: 2.35 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 125000, rate: 1.45 },
      { min: 125000, max: INFINITY, rate: 2.35 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 200000, rate: 1.45 },
      { min: 200000, max: INFINITY, rate: 2.35 },
    ],
  },
} as TaxData;
