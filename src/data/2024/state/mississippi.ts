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
  // Source: TY2024 booklet, Form 80-100-24-1-1-000 (Rev. 10/24), "Filing
  // Status and Exemptions" table.
  // https://www.dor.ms.gov/sites/default/files/tax-forms/individual/80100241.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2300,
    [MARRIED]: 4600,
    [MARRIED_SEPARATELY]: 2300,
    [HEAD_OF_HOUSEHOLD]: 3400,
  },
  // Verified against the Schedule of Tax Computation on page 26 of the TY2024
  // booklet, Form 80-100-24-1-1-000 (Rev. 10/24): "First $10,000 ... x 0%",
  // "Remaining balance ... x 4.7%" (HB 531, 2022 session).
  // https://www.dor.ms.gov/sites/default/files/tax-forms/individual/80100241.pdf
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 10000, rate: 0 },
      { min: 10000, max: INFINITY, rate: 4.7 },
    ],
  },
} as TaxData;
