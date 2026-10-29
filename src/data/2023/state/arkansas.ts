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

// Verified 2026-09-08.
//
// Standard deduction — VERIFIED $2,340 (so $4,680 on a joint return, $2,340
// each). AR1000F/AR1000NR instructions, "NOTE: The $2,340 Standard Deduction
// does not apply to taxpayer's dependent(s)":
// https://www.dfa.arkansas.gov/wp-content/uploads/2023_AR1000F_and_AR1000NR_Instructions.pdf
// DFA's What's New page ties it to Act 1 of the 2nd Extraordinary Session of
// 2021, which made the deduction CPI-indexed:
// https://www.dfa.arkansas.gov/office/taxes/income-tax-administration/individual-income-tax/whats-new/
//
// Top rate — VERIFIED 4.7%. Same instructions, What's New: "Individual Income
// Tax Rate Reduction (Act 532 of the General Session of 2023): Marginal Income
// Tax rates for 2023 have been amended and the top rate will be reduced to
// 4.7%."
//
// Brackets — CORRECTED 2026-09-08. All four boundaries were wrong; the file
// held 5100/10300/14700/24300, which are pre-indexing amounts, not the in-force
// 2023 figures. Arkansas indexes these annually (Ark. Code 26-51-201(a)(5):
// "The tables ... shall be adjusted annually in accordance with the method set
// forth in subsection (d)"), so the amounts printed in the statute are a base,
// never the figure to use — the same trap that caught Nebraska and Idaho. Act
// 532 of 2023 prints exactly the old 5,100/10,300/14,700/24,300, which is how
// they got here.
//
// The in-force boundaries were recovered from DFA's own 2023 Regular Income Tax
// Table (Rev 09/21/2023), which prints tax at every $100 step:
// https://www.dfa.arkansas.gov/wp-content/uploads/2023_TaxTables.pdf
// Evaluating the schedule below at each row's midpoint reproduces 779 of the
// 788 published rows from $5,100 to $84,000 exactly; the 9 misses are $1 apart
// and all fall on DFA's own off-by-one row starts ($75,501, $76,501, ...).
// The file's previous boundaries missed all 788.
//
// Worked check, first printed rows: row [5,300, 5,400) prints $1. Midpoint
// 5,350; (5,350 - 5,300) x 2% = $1.00. Row [5,400, 5,500) prints $3;
// (5,450 - 5,300) x 2% = $3.00. A zero band ending at $5,100 would print $5
// and $7 for those rows.
//
// Confirmed independently by legislation: Act 1 of the Second Extraordinary
// Session of 2024 rewrote this subsection, and its redline shows the *new* base
// as 5,300/10,600/15,100/25,000 — the legislature writing the then-in-force
// (2023-indexed) amounts into the statute, which is exactly the schedule below.
// https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FACTS%2F2024S2%2FPublic%2FACT1.pdf
//
// WHY THIS YEAR IS NOT MODELLED AS TWO SCHEDULES, when 2025 and 2026 are.
//
// The 2026 file has the whole rule from the statute, and 2025's bracket
// adjustment could be recovered from DFA's published table because it is a
// perfectly uniform ramp: 31 printed $100 rows for 31 steps of $10. This year
// it is not uniform. Indexing moves the adjustment table's income range but the
// $10 amounts stay put, so the indexed bands are slightly wider than $100 — and
// DFA's table is printed on a $100 grid, rounded to whole dollars. The ramp
// therefore appears to pause: three of its 43 steps span two printed rows instead of one, so 46 rows
// carry 43 distinct amounts.
// Reading that back, there is no way to tell which printed row is the real band
// boundary, and a boundary is exactly what the schedule would have to state.
//
// What IS pinned, for whoever finishes this:
//   threshold $89,600 — the standard table's top, above which the upper income
//     table applies to the whole income
//   upper income table residual $153.70 — above the phase-out the tax is
//     4.7% x income - $153.70. 40 published rows in that flat region each pin it
//     to within 50 cents, and they intersect to [$153.697, $153.797]; the residual must
//     be a multiple of 10 cents, and exactly one such value lies inside.
//   the adjustment runs $430 at $89,601 down to $10 at $94,101, and $0 from $94,201
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
// KNOWN UNDERSTATEMENT, therefore, above $89,600 of net taxable income:
// $443.70 flat, and exactly zero below it. At $100,000 the upper income table
// charges 4.7% x $100,000 - $153.70 = $4,546.30, against $4,102.60 from the
// ladder below.
//
// Do NOT take that $443.70 from the note DFA prints under its table ("For
// $100,001 and over, your tax is $4,544 + 4.7% of the excess over $100,000").
// That $4,544 is the table's own last row, [$99,901, $100,001), repeated
// verbatim as a closed-form base — a value evaluated at the row's midpoint of
// $99,951, not at $100,000. Using it implies a residual of $156.00, which
// misses all 40 published rows in the flat region and does not even reproduce
// the $4,544 it came from. The 2025 file works this trap through in full.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2340,
    [MARRIED]: 4680,
    [MARRIED_SEPARATELY]: 2340,
    [HEAD_OF_HOUSEHOLD]: 2340,
  },
  [STATE_INCOME]: {
    // Arkansas's rate table does not vary by filing status.
    [ALL]: [
      { min: 0, max: 5300, rate: 0 },
      { min: 5300, max: 10600, rate: 2 },
      { min: 10600, max: 15100, rate: 3 },
      { min: 15100, max: 25000, rate: 3.4 },
      { min: 25000, max: INFINITY, rate: 4.7 },
    ],
  },
} as TaxData;
