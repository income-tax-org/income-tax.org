import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-08 against the Virginia Department of Taxation's own Form
// 760 resident instructions for this year:
// https://www.tax.virginia.gov/sites/default/files/vatax-pdf/2023-760-instructions.pdf
//
// Rate schedule — VERIFIED. The instructions print it in full: "Not over
// $3,000, your tax is 2% of your Virginia taxable income", then $3,000-$5,000
// "$60 + 3%", $5,000-$17,000 "$120 + 5%", over $17,000 "$720 + 5.75%".
// The cumulative column reconciles only with these boundaries: 3,000 x 2% = $60
// at $3,000, + 2,000 x 3% = $120 at $5,000, + 12,000 x 5% = $720 at $17,000.
// Virginia's rates and boundaries are the same for every filing status and have
// not moved since 1990 (Va. Code 58.1-320), so all four schedules below are
// identical by design, not by a copy-paste slip.
//
// Standard deduction — VERIFIED $8,000 single / $16,000 joint / $8,000 married
// separate. Line 11 instructions: "Filing Status 1 Enter $8,000 / Filing
// Status 2 Enter $16,000 / Filing Status 3 Enter $8,000". What's new records
// the rise "from $4,500 to $8,000 for single filers and from $9,000 to
// $16,000 for married filers filing jointly".
//
// Head of household is not a separate Virginia filing status: the return offers
// Filing Status 1 (single), 2 (joint), 3 (married filing separately) and 4
// (married filing separately on a combined return). A head of household files
// under Status 1, which is why the head-of-household slot carries the single
// amount rather than something larger. Married filing separately also takes the
// full single amount, not half of joint — the instructions say "Filing Status 3
// Enter $8,000".
//
// No payroll, disability or paid-leave tax: Virginia levies none on employees.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8000,
    [MARRIED]: 16000,
    [MARRIED_SEPARATELY]: 8000,
    [HEAD_OF_HOUSEHOLD]: 8000,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 17000, rate: 5 },
      { min: 17000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 17000, rate: 5 },
      { min: 17000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 17000, rate: 5 },
      { min: 17000, max: INFINITY, rate: 5.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 3000, rate: 2 },
      { min: 3000, max: 5000, rate: 3 },
      { min: 5000, max: 17000, rate: 5 },
      { min: 17000, max: INFINITY, rate: 5.75 },
    ],
  },
} as TaxData;
