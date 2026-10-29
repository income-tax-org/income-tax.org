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

// Verified 2026-09-08. Every figure below was already correct.
//
// Standard deduction — VERIFIED $2,410 ($4,820 on a joint return, $2,410 each).
// AR1000F/AR1000NR instructions, "NOTE: The $2,410 Standard Deduction does not
// apply to taxpayer's dependent(s)":
// https://www.dfa.arkansas.gov/wp-content/uploads/2024_AR1000F_and_AR1000NR_Instructions.pdf
//
// Top rate — VERIFIED 3.9%. Same instructions, What's New: "Individual Income
// Tax Rate Reduction (Act 1 of the Second Extraordinary Session of 2024).
// Marginal Income Tax rates for 2024 have been amended, and the top rate will
// be reduced to 3.9%."
//
// Brackets — VERIFIED against DFA's 2024 Regular Income Tax Table:
// https://www.dfa.arkansas.gov/wp-content/uploads/2024_TaxTables.pdf
// Evaluating the schedule below at each row's midpoint reproduces 815 of the
// 828 published rows from $5,100 to $88,000 exactly; the 13 misses are $1 apart
// and all sit on DFA's own off-by-one row starts ($75,601, $76,601, ...).
//
// CHANGED 2026-09-08: the 3.9% band used to be written as two bands split at
// $92,300, both at 3.9% — and the four filing statuses each carried an
// identical copy of the whole ladder, so the state's schedule was written out
// four times. Both are now one [ALL] schedule, which is what Arkansas actually
// has.
//
// That $92,300 split is worth keeping in mind. It was not a wrong number: it is
// exactly this year's threshold, the income above which Arkansas switches to a
// second rate schedule (see below). Someone found the right figure, encoded it
// as a bracket boundary with the same rate on both sides, and so encoded
// nothing at all. The tax tables page rendered a bracket floor there, which is
// the only way it showed up. A near-right number doing nothing is harder to
// spot than a wrong one — a wrong rate would have been caught by any
// reconciliation, and this survived every check the repo had.
//
// WHY THIS YEAR IS NOT MODELLED AS TWO SCHEDULES, when 2025 and 2026 are.
//
// The 2026 file has the whole rule from the statute, and 2025's bracket
// adjustment could be recovered from DFA's published table because it is a
// perfectly uniform ramp: 31 printed $100 rows for 31 steps of $10. This year
// it is not uniform. Indexing moves the adjustment table's income range but the
// $10 amounts stay put, so the indexed bands are slightly wider than $100 — and
// DFA's table is printed on a $100 grid, rounded to whole dollars. The ramp
// therefore appears to pause: one of its 31 steps spans two printed rows instead of one, so 32 rows
// carry 31 distinct amounts.
// Reading that back, there is no way to tell which printed row is the real band
// boundary, and a boundary is exactly what the schedule would have to state.
//
// What IS pinned, for whoever finishes this:
//   threshold $92,300 — the standard table's top, above which the upper income
//     table applies to the whole income
//   upper income table residual $87.40 — above the phase-out the tax is
//     3.9% x income - $87.40. 35 published rows in that flat region each pin it
//     to within 50 cents, and they intersect to [$87.389, $87.489]; the residual must
//     be a multiple of 10 cents, and exactly one such value lies inside.
//   the adjustment runs $310 at $92,301 down to $10 at $95,401, and $0 from $95,501
// Only the band boundaries between those endpoints are missing.
//
// Sources that would settle it, both checked 2026-09-08 and unavailable:
// DFA's Withholding Tax Formula publishes the adjustment table exactly (the
// 2026 edition does), but the URL is overwritten each year and the Internet
// Archive holds no snapshot of it. The statutory tables in the Acts are
// un-indexed bases — Act 532 of 2023 prints $87,001-$91,300 and Act 1 of the
// Second Extraordinary Session of 2024 prints $89,601-$92,700, neither of which
// is the range actually in force in its own year.
//
// KNOWN UNDERSTATEMENT, therefore, above $92,300 of net taxable income:
// $322.50 flat, and exactly zero below it. At $100,000 the upper income table
// charges 3.9% x $100,000 - $87.40 = $3,812.60, against $3,490.10 from the
// ladder below.
//
// Do NOT take that $322.50 from the note DFA prints under its table ("For
// $100,001 and over, your tax is $3,811 + 3.9% of the excess over $100,000").
// That $3,811 is the table's own last row, [$99,901, $100,001), repeated
// verbatim as a closed-form base — a value evaluated at the row's midpoint of
// $99,951, not at $100,000. Using it implies a residual of $87.00, which misses
// 12 of the 35 published rows in the flat region. The 2025 file works this trap
// through in full.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2410,
    [MARRIED]: 4820,
    [MARRIED_SEPARATELY]: 2410,
    [HEAD_OF_HOUSEHOLD]: 2410,
  },
  [STATE_INCOME]: {
    // Arkansas's rate table does not vary by filing status.
    [ALL]: [
      { min: 0, max: 5500, rate: 0 },
      { min: 5500, max: 10900, rate: 2 },
      { min: 10900, max: 15600, rate: 3 },
      { min: 15600, max: 25700, rate: 3.4 },
      { min: 25700, max: INFINITY, rate: 3.9 },
    ],
  },
} as TaxData;
