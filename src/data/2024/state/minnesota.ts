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
// "Tax Year 2024 Inflation-Adjusted Amounts In Minnesota Statutes", the
// Department's Tax Research Division publication required by M.S. 270C.22
// subd. 2, which lists every 290.06 subd. 2c threshold:
// https://www.revenue.state.mn.us/sites/default/files/2023-12/inflation-adjusted-amounts-ty-2024.pdf
// Cross-checked against the Department's live rates page, which keeps prior
// years: https://www.revenue.state.mn.us/minnesota-income-tax-rates-and-brackets
//
// Married filing separate really is exactly half of married joint here, which
// is normally a smell. In Minnesota it is the law: M.S. 290.06 subd. 2c sets
// the separate brackets at one-half the joint amounts, and the Department
// publishes them as their own indexed line.
//
// Standard deduction — the maxima are VERIFIED $14,575 single and married
// separate / $29,150 joint / $21,900 head of household, and they are now a
// SCHEDULE rather than one number, because Minnesota shrinks the deduction as
// income rises. M.S. 290.0123 subd. 5 reduces it by 3% of AGI over a first
// threshold, plus a further 10% of AGI over a second, and caps the whole
// reduction at 80% of the deduction.
//
// Thresholds for this year, from "Tax Year 2024 Inflation-Adjusted Amounts In Minnesota Statutes", under
// "290.0123, Subd. 5 Standard Deduction Limitation":
// https://www.revenue.state.mn.us/sites/default/files/2023-12/inflation-adjusted-amounts-ty-2024.pdf
//   first  $232,500 ($116,250 married filing separately)
//   second $321,350 ($160,675 married filing separately)
//
// Three bands express it exactly:
//   below the first threshold, the full amount;
//   between the two, `reduce_rate: 3` measured from the band's own min;
//   above the second, `reduce_rate: 10` measured from *its* own min, over an
//     `amount` already reduced by the first stage — 3% x $88,850 = $2,665.50
//     (3% x $44,425 = $1,332.75 separate).
// Minnesota measures each stage from its own threshold, so unlike Wisconsin's
// head-of-household band this needs no `reduce_from`; the pre-reduced `amount`
// carries the first stage forward.
//
// The 80% cap is the `floor` at 20% of the deduction, not a fourth band and not
// a separate reduction: once 3% + 10% exceeds 80% of the deduction the band
// clamps and stays there, which is the same thing the statute says and removes
// the need for a band above the point where the cap binds. For a single filer
// this year the cap starts binding at $411,295 of AGI, and the floor holds the
// deduction flat from there up. Minnesota separately tells a filer at or above
// $1,053,750 to skip the arithmetic and take the flat 80% (Worksheet B); that
// is the same number this floor is already giving well below it.
//
// The floor is written on the middle band too. It cannot bind there — 3% of the
// gap between the thresholds is $2,665.50 against a cap of $11,660.00 for a
// single filer — but the statutory cap applies across the whole phase-out, and
// writing it once per reducing band keeps the file readable as the rule.
//
// This state belongs with Alabama, Connecticut, Maine, Montana-2023, Wisconsin
// and South Carolina; it was simply missed when those were banded.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 232500, amount: 14575 },
      { min: 232500, max: 321350, amount: 14575, reduce_rate: 3, floor: 2915 },
      {
        min: 321350,
        max: INFINITY,
        amount: 11909.5,
        reduce_rate: 10,
        floor: 2915,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 232500, amount: 29150 },
      { min: 232500, max: 321350, amount: 29150, reduce_rate: 3, floor: 5830 },
      {
        min: 321350,
        max: INFINITY,
        amount: 26484.5,
        reduce_rate: 10,
        floor: 5830,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 116250, amount: 14575 },
      { min: 116250, max: 160675, amount: 14575, reduce_rate: 3, floor: 2915 },
      {
        min: 160675,
        max: INFINITY,
        amount: 13242.25,
        reduce_rate: 10,
        floor: 2915,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 232500, amount: 21900 },
      { min: 232500, max: 321350, amount: 21900, reduce_rate: 3, floor: 4380 },
      {
        min: 321350,
        max: INFINITY,
        amount: 19234.5,
        reduce_rate: 10,
        floor: 4380,
      },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 31690, rate: 5.35 },
      { min: 31690, max: 104090, rate: 6.8 },
      { min: 104090, max: 193240, rate: 7.85 },
      { min: 193240, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED]: [
      { min: 0, max: 46330, rate: 5.35 },
      { min: 46330, max: 184040, rate: 6.8 },
      { min: 184040, max: 321450, rate: 7.85 },
      { min: 321450, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 23165, rate: 5.35 },
      { min: 23165, max: 92020, rate: 6.8 },
      { min: 92020, max: 160725, rate: 7.85 },
      { min: 160725, max: INFINITY, rate: 9.85 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 39010, rate: 5.35 },
      { min: 39010, max: 156760, rate: 6.8 },
      { min: 156760, max: 256880, rate: 7.85 },
      { min: 256880, max: INFINITY, rate: 9.85 },
    ],
  },
} as TaxData;
