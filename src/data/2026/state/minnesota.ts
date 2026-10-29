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
// "Tax Year 2026 Inflation-Adjusted Amounts In Minnesota Statutes" (Tax
// Research Division, 12/1/2025), required by M.S. 270C.22 subd. 2, which lists
// every 290.06 subd. 2c threshold:
// https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf
// Cross-checked against the Department's live rates page:
// https://www.revenue.state.mn.us/minnesota-income-tax-rates-and-brackets
//
// Married filing separate really is exactly half of married joint here, which
// is normally a smell. In Minnesota it is the law: M.S. 290.06 subd. 2c sets
// the separate brackets at one-half the joint amounts, and the Department
// publishes them as their own indexed line.
//
// Standard deduction — the maxima are VERIFIED $15,300 single and married
// separate / $30,600 joint / $23,000 head of household, and they are now a
// SCHEDULE rather than one number, because Minnesota shrinks the deduction as
// income rises. M.S. 290.0123 subd. 5 reduces it by 3% of AGI over a first
// threshold, plus a further 10% of AGI over a second, and caps the whole
// reduction at 80% of the deduction.
//
// Thresholds for this year, from "Tax Year 2026 Inflation-Adjusted Amounts In Minnesota Statutes", under
// "290.0123, Subd. 5 Standard Deduction Limitation":
// https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf
//   first  $244,400 ($122,200 married filing separately)
//   second $337,800 ($168,900 married filing separately)
//
// Three bands express it exactly:
//   below the first threshold, the full amount;
//   between the two, `reduce_rate: 3` measured from the band's own min;
//   above the second, `reduce_rate: 10` measured from *its* own min, over an
//     `amount` already reduced by the first stage — 3% x $93,400 = $2,802.00
//     (3% x $46,700 = $1,401.00 separate).
// Minnesota measures each stage from its own threshold, so unlike Wisconsin's
// head-of-household band this needs no `reduce_from`; the pre-reduced `amount`
// carries the first stage forward.
//
// The 80% cap is the `floor` at 20% of the deduction, not a fourth band and not
// a separate reduction: once 3% + 10% exceeds 80% of the deduction the band
// clamps and stays there, which is the same thing the statute says and removes
// the need for a band above the point where the cap binds. For a single filer
// this year the cap starts binding at $432,180 of AGI, and the floor holds the
// deduction flat from there up. Minnesota separately tells a filer at or above
// $1,107,750 to skip the arithmetic and take the flat 80% (Worksheet B); that
// is the same number this floor is already giving well below it.
//
// The floor is written on the middle band too. It cannot bind there — 3% of the
// gap between the thresholds is $2,802.00 against a cap of $12,240.00 for a
// single filer — but the statutory cap applies across the whole phase-out, and
// writing it once per reducing band keeps the file readable as the rule.
//
// This state belongs with Alabama, Connecticut, Maine, Montana-2023, Wisconsin
// and South Carolina; it was simply missed when those were banded.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 244400, amount: 15300 },
      { min: 244400, max: 337800, amount: 15300, reduce_rate: 3, floor: 3060 },
      {
        min: 337800,
        max: INFINITY,
        amount: 12498,
        reduce_rate: 10,
        floor: 3060,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 244400, amount: 30600 },
      { min: 244400, max: 337800, amount: 30600, reduce_rate: 3, floor: 6120 },
      {
        min: 337800,
        max: INFINITY,
        amount: 27798,
        reduce_rate: 10,
        floor: 6120,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 122200, amount: 15300 },
      { min: 122200, max: 168900, amount: 15300, reduce_rate: 3, floor: 3060 },
      {
        min: 168900,
        max: INFINITY,
        amount: 13899,
        reduce_rate: 10,
        floor: 3060,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 244400, amount: 23000 },
      { min: 244400, max: 337800, amount: 23000, reduce_rate: 3, floor: 4600 },
      {
        min: 337800,
        max: INFINITY,
        amount: 20198,
        reduce_rate: 10,
        floor: 4600,
      },
    ],
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 33310, rate: 5.35 },
      { min: 33310, max: 109430, rate: 6.8 },
      { min: 109430, max: 203150, rate: 7.85 },
      { min: 203150, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED]: [
      { min: 0, max: 48700, rate: 5.35 },
      { min: 48700, max: 193480, rate: 6.8 },
      { min: 193480, max: 337930, rate: 7.85 },
      { min: 337930, max: INFINITY, rate: 9.85 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 24350, rate: 5.35 },
      { min: 24350, max: 96740, rate: 6.8 },
      { min: 96740, max: 168965, rate: 7.85 },
      { min: 168965, max: INFINITY, rate: 9.85 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 41010, rate: 5.35 },
      { min: 41010, max: 164800, rate: 6.8 },
      { min: 164800, max: 270060, rate: 7.85 },
      { min: 270060, max: INFINITY, rate: 9.85 },
    ],
  },
} as TaxData;
