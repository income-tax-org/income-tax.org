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
  [MAX_401K_CONTRIBUTION]: 22500,
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED_SEPARATELY]: 13850,
    [MARRIED]: 27700,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  [FEDERAL_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: INFINITY, rate: 37 },
    ],
    [MARRIED]: [
      { min: 0, max: 22000, rate: 10 },
      { min: 22000, max: 89450, rate: 12 },
      { min: 89450, max: 190750, rate: 22 },
      { min: 190750, max: 364200, rate: 24 },
      { min: 364200, max: 462500, rate: 32 },
      { min: 462500, max: 693750, rate: 35 },
      { min: 693750, max: INFINITY, rate: 37 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 346875, rate: 35 },
      { min: 346875, max: INFINITY, rate: 37 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 15700, rate: 10 },
      { min: 15700, max: 59850, rate: 12 },
      { min: 59850, max: 95350, rate: 22 },
      { min: 95350, max: 182100, rate: 24 },
      { min: 182100, max: 231250, rate: 32 },
      { min: 231250, max: 578100, rate: 35 },
      { min: 578100, max: INFINITY, rate: 37 },
    ],
  },
  [SOCIAL_SECURITY]: {
    [ALL]: [{ min: 0, max: 160200, rate: 6.2 }],
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
