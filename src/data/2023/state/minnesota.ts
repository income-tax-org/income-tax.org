import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

// Verified 2026-09-08 against the Minnesota Department of Revenue's own
// figures. Every bracket boundary and every standard deduction below was
// confirmed; nothing changed.
//
// Brackets — VERIFIED for all four filing statuses:
// Form M1 instructions for 2023, Tax Rate Schedules (page 32):
// https://www.revenue.state.mn.us/sites/default/files/2025-06/m1-inst-23.pdf
// That page prints the cumulative tax at each bracket floor, which reconciles
// only with correct boundaries:
//   Single: 30,070x5.35% = $1,608.75 (printed); + 68,690x6.80% = $6,279.67 at
//     $98,760 (printed); + 84,580x7.85% = $12,919.20 at $183,340 (printed)
//   Joint: 43,950x5.35% = $2,351.33; + 130,660x6.80% = $11,236.21 at $174,610;
//     + 130,360x7.85% = $21,469.47 at $304,970 — all three printed
//   Separate: $1,175.66 / $5,618.10 / $10,734.73 — all printed
//   Head of household: $1,980.04 / $9,577.00 / $17,033.72 — all printed
//     (the last is $17,033.71 if you carry full precision; MN rounds at each
//     step, and rounding first gives exactly the printed figure)
// Cross-checked against the Department's live rates page, which keeps prior
// years: https://www.revenue.state.mn.us/minnesota-income-tax-rates-and-brackets
//
// Married filing separate really is exactly half of married joint here, which
// is normally a smell. In Minnesota it is the law: M.S. 290.06 subd. 2c sets
// the separate brackets at one-half the joint amounts, and the Department
// publishes them as their own indexed line.
//
// Standard deduction — the maxima are VERIFIED $13,825 single and married
// separate / $27,650 joint / $20,800 head of household, and they are now a
// SCHEDULE rather than one number, because Minnesota shrinks the deduction as
// income rises. M.S. 290.0123 subd. 5 reduces it by 3% of AGI over a first
// threshold, plus a further 10% of AGI over a second, and caps the whole
// reduction at 80% of the deduction.
//
// Thresholds for this year, from the Form M1 instructions for 2023, whose Worksheet A for Line 4 prints
// the whole rule, and What's new, which states the trigger: "The standard
// deduction is reduced by up to 80% if your adjusted gross income exceeds
// $220,650 ($110,325 if you are married and filing a separate return)."
// https://www.revenue.state.mn.us/sites/default/files/2025-06/m1-inst-23.pdf
//   first  $220,650 ($110,325 married filing separately)
//   second $304,970 ($152,485 married filing separately)
//
// Three bands express it exactly:
//   below the first threshold, the full amount;
//   between the two, `reduce_rate: 3` measured from the band's own min;
//   above the second, `reduce_rate: 10` measured from *its* own min, over an
//     `amount` already reduced by the first stage — 3% x $84,320 = $2,529.60
//     (3% x $42,160 = $1,264.80 separate).
// Minnesota measures each stage from its own threshold, so unlike Wisconsin's
// head-of-household band this needs no `reduce_from`; the pre-reduced `amount`
// carries the first stage forward.
//
// The 80% cap is the `floor` at 20% of the deduction, not a fourth band and not
// a separate reduction: once 3% + 10% exceeds 80% of the deduction the band
// clamps and stays there, which is the same thing the statute says and removes
// the need for a band above the point where the cap binds. For a single filer
// this year the cap starts binding at $390,274 of AGI, and the floor holds the
// deduction flat from there up. Minnesota separately tells a filer at or above
// $1,000,000 to skip the arithmetic and take the flat 80% (Worksheet B); that
// is the same number this floor is already giving well below it.
//
// The floor is written on the middle band too. It cannot bind there — 3% of the
// gap between the thresholds is $2,529.60 against a cap of $11,060.00 for a
// single filer — but the statutory cap applies across the whole phase-out, and
// writing it once per reducing band keeps the file readable as the rule.
//
// This state belongs with Alabama, Connecticut, Maine, Montana-2023, Wisconsin
// and South Carolina; it was simply missed when those were banded.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 220650, amount: 13825 },
      { min: 220650, max: 304970, amount: 13825, reduce_rate: 3, floor: 2765 },
      {
        min: 304970,
        max: INFINITY,
        amount: 11295.4,
        reduce_rate: 10,
        floor: 2765,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 220650, amount: 27650 },
      { min: 220650, max: 304970, amount: 27650, reduce_rate: 3, floor: 5530 },
      {
        min: 304970,
        max: INFINITY,
        amount: 25120.4,
        reduce_rate: 10,
        floor: 5530,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 110325, amount: 13825 },
      { min: 110325, max: 152485, amount: 13825, reduce_rate: 3, floor: 2765 },
      {
        min: 152485,
        max: INFINITY,
        amount: 12560.2,
        reduce_rate: 10,
        floor: 2765,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 220650, amount: 20800 },
      { min: 220650, max: 304970, amount: 20800, reduce_rate: 3, floor: 4160 },
      {
        min: 304970,
        max: INFINITY,
        amount: 18270.4,
        reduce_rate: 10,
        floor: 4160,
      },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 30070, rate: 5.35 },
      { min: 30070, max: 98760, rate: 6.8 },
      { min: 98760, max: 183340, rate: 7.85 },
      { min: 183340, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED]: [
      { min: 0, max: 43950, rate: 5.35 },
      { min: 43950, max: 174610, rate: 6.8 },
      { min: 174610, max: 304970, rate: 7.85 },
      { min: 304970, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 21975, rate: 5.35 },
      { min: 21975, max: 87305, rate: 6.8 },
      { min: 87305, max: 152485, rate: 7.85 },
      { min: 152485, max: INFINITY, rate: 9.85 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 37010, rate: 5.35 },
      { min: 37010, max: 148730, rate: 6.8 },
      { min: 148730, max: 243720, rate: 7.85 },
      { min: 243720, max: INFINITY, rate: 9.85 },
    ],
  },
} as TaxData;
