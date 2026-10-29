import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // The 2026 cut to a flat 4.99% also raised the standard deduction to
  // $15,000 for single, head of household and married filing separately, and
  // $30,000 for married filing jointly. Head of household matching single is
  // Georgia's grouping of the two statuses, not a duplicated single figure.
  // Source: Georgia DOR, "Important Tax Updates", 2026 Income Tax Changes.
  // Amounts re-verified 2026-09-08 against the Georgia DOR "Important Tax
  // Updates" page: "The Georgia standard deduction has been increased to
  // $15,000 for single taxpayers, heads of households, and married taxpayers
  // filing separately, or $30,000 for married taxpayers filing jointly."
  // Source: https://dor.georgia.gov/important-tax-updates
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15000,
    [MARRIED]: 30000,
    [MARRIED_SEPARATELY]: 15000,
    [HEAD_OF_HOUSEHOLD]: 15000,
  },
  // Verified 2026-09-08 against the Georgia DOR "Important Tax Updates" page,
  // 2026 Income Tax Changes: "The Georgia income tax rate has been reduced to
  // a flat rate of 4.99%." Note this skips the 5.09% step the earlier
  // phase-down schedule implied -- the cut went straight from 5.19% to 4.99%,
  // so 2026 must be read off the state's own announcement rather than
  // extrapolated as another 0.10 reduction.
  // Source: https://dor.georgia.gov/important-tax-updates
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.99 }],
  },
} as TaxData;
