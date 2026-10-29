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
  [MAX_401K_CONTRIBUTION]: 24500,
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 16100,
    [MARRIED_SEPARATELY]: 16100,
    [MARRIED]: 32200,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  [FEDERAL_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 12400, rate: 10 },
      { min: 12400, max: 50400, rate: 12 },
      { min: 50400, max: 105700, rate: 22 },
      { min: 105700, max: 201775, rate: 24 },
      { min: 201775, max: 256225, rate: 32 },
      { min: 256225, max: 640600, rate: 35 },
      { min: 640600, max: INFINITY, rate: 37 },
    ],
    [MARRIED]: [
      { min: 0, max: 24800, rate: 10 },
      { min: 24800, max: 100800, rate: 12 },
      { min: 100800, max: 211400, rate: 22 },
      { min: 211400, max: 403550, rate: 24 },
      { min: 403550, max: 512450, rate: 32 },
      { min: 512450, max: 768700, rate: 35 },
      { min: 768700, max: INFINITY, rate: 37 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 12400, rate: 10 },
      { min: 12400, max: 50400, rate: 12 },
      { min: 50400, max: 105700, rate: 22 },
      { min: 105700, max: 201775, rate: 24 },
      { min: 201775, max: 256225, rate: 32 },
      { min: 256225, max: 384350, rate: 35 },
      { min: 384350, max: INFINITY, rate: 37 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 17700, rate: 10 },
      { min: 17700, max: 67450, rate: 12 },
      { min: 67450, max: 105700, rate: 22 },
      { min: 105700, max: 201775, rate: 24 },
      { min: 201775, max: 256200, rate: 32 },
      { min: 256200, max: 640600, rate: 35 },
      { min: 640600, max: INFINITY, rate: 37 },
    ],
  },
  [SOCIAL_SECURITY]: {
    [ALL]: [{ min: 0, max: 184500, rate: 6.2 }],
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
