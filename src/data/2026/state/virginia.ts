import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-08 against the Virginia Department of Taxation's Form 760
// instructions for 2025, which speak for 2026 as well:
// https://www.tax.virginia.gov/sites/default/files/vatax-pdf/2025-760-instructions.pdf
//
// Standard deduction — VERIFIED $8,750 single / $17,500 joint / $8,750 married
// separate, unchanged from 2025. What's new states the span outright: the 2025
// session "increased the standard deduction for Taxable Years 2025 and 2026
// from $8,500 to $8,750 for single filers and from $17,000 to $17,500 for
// married filers filing jointly."
//
// Watch item for 2027: the same paragraph says "The increase in the standard
// deduction is scheduled to sunset after Taxable Year 2026 and revert to the
// standard deduction amounts that" preceded it. Unless the General Assembly
// extends it again — as it has each time so far — TY2027 falls back to
// $3,000 / $6,000 under Va. Code 58.1-322.03.
//
// Rate schedule — VERIFIED unchanged: "Not over $3,000, your tax is 2%", then
// $3,000-$5,000 "$60 + 3%", $5,000-$17,000 "$120 + 5%", over $17,000
// "$720 + 5.75%". The cumulative column reconciles only with these boundaries:
// 3,000 x 2% = $60, + 2,000 x 3% = $120, + 12,000 x 5% = $720. Virginia's rates
// have not moved since 1990 (Va. Code 58.1-320) and no 2026 legislation touches
// them, so all four schedules below are identical by design.
//
// Head of household is not a separate Virginia filing status — a head of
// household files under Filing Status 1 (single), which is why that slot
// carries the single amount. Married filing separately also takes the full
// single amount, not half of joint.
//
// No payroll, disability or paid-leave tax: Virginia levies none on employees.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8750,
    [MARRIED]: 17500,
    [MARRIED_SEPARATELY]: 8750,
    [HEAD_OF_HOUSEHOLD]: 8750,
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
