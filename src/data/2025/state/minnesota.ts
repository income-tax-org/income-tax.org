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
// "Tax Year 2025 Inflation-Adjusted Amounts In Minnesota Statutes", the
// Department's Tax Research Division publication required by M.S. 270C.22
// subd. 2, which lists every 290.06 subd. 2c threshold:
// https://www.revenue.state.mn.us/sites/default/files/2024-12/inflation-adjusted-amounts-2025.pdf
// Cross-checked against the Department's live rates page:
// https://www.revenue.state.mn.us/minnesota-income-tax-rates-and-brackets
//
// Married filing separate really is exactly half of married joint here, which
// is normally a smell. In Minnesota it is the law: M.S. 290.06 subd. 2c sets
// the separate brackets at one-half the joint amounts, and the Department
// publishes them as their own indexed line.
//
// Standard deduction — the maxima are VERIFIED $14,950 single and married
// separate / $29,900 joint / $22,500 head of household, and they are now a
// SCHEDULE rather than one number, because Minnesota shrinks the deduction as
// income rises. M.S. 290.0123 subd. 5 reduces it by 3% of AGI over a first
// threshold, plus a further 10% of AGI over a second, and caps the whole
// reduction at 80% of the deduction.
//
// Thresholds for this year, from "Tax Year 2025 Inflation-Adjusted Amounts In Minnesota Statutes", under
// "290.0123, Subd. 5 Standard Deduction Limitation":
// https://www.revenue.state.mn.us/sites/default/files/2024-12/inflation-adjusted-amounts-2025.pdf
//   first  $238,950 ($119,475 married filing separately)
//   second $330,300 ($165,150 married filing separately)
//
// Three bands express it exactly:
//   below the first threshold, the full amount;
//   between the two, `reduce_rate: 3` measured from the band's own min;
//   above the second, `reduce_rate: 10` measured from *its* own min, over an
//     `amount` already reduced by the first stage — 3% x $91,350 = $2,740.50
//     (3% x $45,675 = $1,370.25 separate).
// Minnesota measures each stage from its own threshold, so unlike Wisconsin's
// head-of-household band this needs no `reduce_from`; the pre-reduced `amount`
// carries the first stage forward.
//
// The 80% cap is the `floor` at 20% of the deduction, not a fourth band and not
// a separate reduction: once 3% + 10% exceeds 80% of the deduction the band
// clamps and stays there, which is the same thing the statute says and removes
// the need for a band above the point where the cap binds. For a single filer
// this year the cap starts binding at $422,495 of AGI, and the floor holds the
// deduction flat from there up. Minnesota separately tells a filer at or above
// $1,083,150 to skip the arithmetic and take the flat 80% (Worksheet B); that
// is the same number this floor is already giving well below it.
//
// The floor is written on the middle band too. It cannot bind there — 3% of the
// gap between the thresholds is $2,740.50 against a cap of $11,960.00 for a
// single filer — but the statutory cap applies across the whole phase-out, and
// writing it once per reducing band keeps the file readable as the rule.
//
// This state belongs with Alabama, Connecticut, Maine, Montana-2023, Wisconsin
// and South Carolina; it was simply missed when those were banded.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 238950, amount: 14950 },
      { min: 238950, max: 330300, amount: 14950, reduce_rate: 3, floor: 2990 },
      {
        min: 330300,
        max: INFINITY,
        amount: 12209.5,
        reduce_rate: 10,
        floor: 2990,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 238950, amount: 29900 },
      { min: 238950, max: 330300, amount: 29900, reduce_rate: 3, floor: 5980 },
      {
        min: 330300,
        max: INFINITY,
        amount: 27159.5,
        reduce_rate: 10,
        floor: 5980,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 119475, amount: 14950 },
      { min: 119475, max: 165150, amount: 14950, reduce_rate: 3, floor: 2990 },
      {
        min: 165150,
        max: INFINITY,
        amount: 13579.75,
        reduce_rate: 10,
        floor: 2990,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 238950, amount: 22500 },
      { min: 238950, max: 330300, amount: 22500, reduce_rate: 3, floor: 4500 },
      {
        min: 330300,
        max: INFINITY,
        amount: 19759.5,
        reduce_rate: 10,
        floor: 4500,
      },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 32570, rate: 5.35 },
      { min: 32570, max: 106990, rate: 6.8 },
      { min: 106990, max: 198630, rate: 7.85 },
      { min: 198630, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED]: [
      { min: 0, max: 47620, rate: 5.35 },
      { min: 47620, max: 189180, rate: 6.8 },
      { min: 189180, max: 330410, rate: 7.85 },
      { min: 330410, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 23810, rate: 5.35 },
      { min: 23810, max: 94590, rate: 6.8 },
      { min: 94590, max: 165205, rate: 7.85 },
      { min: 165205, max: INFINITY, rate: 9.85 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 40100, rate: 5.35 },
      { min: 40100, max: 161130, rate: 6.8 },
      { min: 161130, max: 264050, rate: 7.85 },
      { min: 264050, max: INFINITY, rate: 9.85 },
    ],
  },
} as TaxData;
