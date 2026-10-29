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
  // Mississippi does not index its standard deduction: the amounts are fixed
  // in statute and the same table repeats every year. The DOR printed this
  // identical table in the TY2023, TY2024 and TY2025 booklets, each one
  // explicitly labelled for its own year, and the HB 531 (2022) / HB 1 (2025)
  // phase-downs changed rates only. A repeat across years is correct here,
  // not a stale copy.
  //
  // The groupings are easy to get backwards, so to be explicit:
  //   married filing jointly    $4,600
  //   married filing separately $2,300 -- exactly half the joint amount, per
  //     the DOR: "Married Filing Separate $2,300 (exactly 1/2 of the
  //     $4,600)". It equals the single amount only by coincidence.
  //   head of household         $3,400 -- MS calls this "head of family". It
  //     has its own amount and is NOT the single amount.
  //   single                    $2,300
  // Source: the DOR's "Deductions" chart, which lists the amounts with no
  // tax-year qualifier alongside a rate table that is year-qualified. The
  // TY2026 booklet is not published yet; revisit when it is.
  // https://www.dor.ms.gov/general-information
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2300,
    [MARRIED]: 4600,
    [MARRIED_SEPARATELY]: 2300,
    [HEAD_OF_HOUSEHOLD]: 3400,
  },
  // 4% on taxable income over $10,000 is the last step of the HB 531 (2022
  // session) phase-down; HB 1 (2025 session) leaves 2026 alone and picks up
  // at 3.75% in 2027. Verified against the DOR's own rate listing, "Tax Year
  // 2026 Excess of $10,000 of Taxable Income is taxed @ 4%", and against the
  // same table printed in the TY2023, TY2024 and TY2025 instruction booklets.
  // https://www.dor.ms.gov/general-information
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: INFINITY, rate: 4 },
    ],
    [MARRIED]: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: INFINITY, rate: 4 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: INFINITY, rate: 4 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: INFINITY, rate: 4 },
    ],
  },
} as TaxData;
