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

// Verified 2026-09-08. Corrected, then rebuilt as a two-schedule model.
//
// Standard deduction — CORRECTED $2,410 -> $2,470 ($4,820 -> $4,940 joint). The
// whole file was a year stale, holding 2024's figures. AR1000F/AR1000NR
// instructions print the full status table and "NOTE: The $2,470 Standard
// Deduction does not apply to taxpayer's dependent(s)":
// https://www.dfa.arkansas.gov/wp-content/uploads/2025_AR1000F_and_AR1000NR_Instructions.pdf
// This is the pair detect-suspect-figures flagged as "2024 and 2025 identical
// while other years move". The flag was right, and four wrong bracket
// boundaries sat beside it in the same file.
//
// Top rate — VERIFIED 3.9%. Same instructions, What's New: "Individual Income
// Tax Rate Reduction (Act 1 of the Second Extraordinary Session of 2024).
// Marginal Income Tax rates for 2025 are 3.9%, as amended in 2024."
//
// ARKANSAS HAS TWO RATE SCHEDULES, and both are now modelled. Ark. Code
// 26-51-201(a) gives a standard table for net income at or below a threshold,
// an "upper income table" charged on the WHOLE of a larger income, and a
// bracket-adjustment amount that bridges the two by stepping down $10 per $100
// of income. A single marginal ladder cannot express that, and the file
// previously held only the standard table, undercharging every filer above the
// threshold by about $329.
//
// The schedule below uses `base_amount` — the field added for Ohio's flat
// charge — because that is exactly the shape needed: each row carries the tax
// owed at its own floor and a rate on the excess above it. The first five rows
// are the standard table, written with cumulative bases so they reproduce the
// marginal ladder exactly. The next 31 rows are the bracket-adjustment table,
// one row per $100 band. The last row is the upper income table with the
// adjustment spent.
//
// CONSTANTS, and how each was pinned:
//
//  * Standard table boundaries 5,600 / 11,200 / 16,000 / 26,400 and threshold
//    $94,700, from DFA's 2025 Regular Income Tax Table (Rev 09/29/2025):
//    https://www.dfa.arkansas.gov/wp-content/uploads/2025_TaxTables.pdf
//    Note these are NOT the amounts printed in the statute. Ark. Code
//    26-51-201(a)(5) requires the tables to "be adjusted annually", so the
//    statutory figures are an un-indexed base — the trap that caught Nebraska
//    and Idaho. The file's old boundaries were that base, one indexing cycle
//    behind.
//
//  * Upper income table residual $89.30. The upper table is 2% on a first band
//    and 3.9% above it, so above the phase-out the tax is a straight
//    3.9% x income - R. Each published row in that flat region pins R to within
//    50 cents of the exact value, and 19 rows intersect to R in
//    [$89.289, $89.389]. R must be a multiple of 10 cents, because the first
//    band is a whole number of hundreds of dollars and R = 1.9% of it. Exactly
//    one such value lies in the interval: $89.30, i.e. a first band of $4,700.
//    Re-derived as a reproduction test rather than an interval: of the 21
//    candidate residuals on the 10-cent grid, $89.30 is the unique one that
//    reproduces the published table.
//
//  * Bracket adjustment $310 at $94,701 falling $10 per $100 band to $10 at
//    $97,701, then $0 from $97,801. Read off the published table row by row
//    (adjustment = 3.9% x midpoint - $89.30 - printed tax); every one of the 31
//    values lands within 50 cents of a multiple of $10, and the ramp is
//    perfectly uniform. Its shape matches the statutory base table for this
//    subsection exactly — 31 bands starting at $310 — with only the income
//    range indexed, which is what the amounts being un-indexed tax dollars
//    rather than income thresholds would predict.
//
// RECONCILIATION: evaluated at each row's midpoint, this schedule reproduces
// 928 of the 948 rows DFA prints, across the whole table from $5,100 to
// $100,000 — including every row of the phase-out region, where the previous
// marginal-only model missed all of them. The 20 misses are $1 apart and all
// fall on DFA's own off-by-one row starts ($75,501, $76,501, ...), i.e. table
// rounding inside a band of constant rate.
//
// THE $3,809 TRAP, at $100,000 of net taxable income. DFA's table carries a
// note reading "For $100,001 and over, your tax is $3,809 + 3.9% of the excess
// over $100,000", while this schedule gives 3.9% x $100,000 - $89.30 =
// $3,810.70. Read as a statement of the tax at $100,000, that note implies a
// residual of $3,900 - $3,809 = $91.00 rather than $89.30, and it looks like it
// should win: a directly stated figure beating a constant fitted from table
// rows. It is not one, and this is worth spelling out because it will be
// re-litigated by the next person who reads the note.
//
// $3,809 is the table's own last row. The row [$99,901, $100,001) prints
// $3,809, and the note repeats that number verbatim as the base of a closed
// form starting at $100,000. It is the same figure printed twice, and a table
// row is the formula evaluated at the row's MIDPOINT -- $99,951, not $100,000.
// The same thing happens in all three years DFA published this note: the last
// row prints $4,544 in 2023 and the note says $4,544; the last row prints
// $3,811 in 2024 and the note says $3,811.
//
// The $91.00 residual is refuted twice over:
//   it misses all 19 published rows in the flat region (at [98,101, 98,201) it
//     gives $3,737 against the printed $3,739), where $89.30 reproduces all 19;
//   and it does not even reproduce the row the $3,809 came from -- at the
//     midpoint $99,951 it gives $3,807.089, printing $3,807, not $3,809.
//     $89.30 gives $3,808.789, printing exactly $3,809.
// A residual derived from a figure cannot fail to reproduce that figure, so
// $91.00 is not a reading of this table at all. The 2023 control is cleaner
// still: the note's $4,544 implies $156.00, which misses all 40 flat rows,
// where the $153.70 pinned the same way reproduces all 40.
//
// Contrast Oklahoma, which does publish a real worksheet for this. Its packet
// prints $4,560 for the last table row [99,950, 100,000) and $4,562 in the
// "Calculating Tax on Taxable Income of $100,000 or more" worksheet -- two
// different numbers, because the worksheet is evaluated at $100,000 and the row
// at its midpoint. Arkansas prints one number for both, and its instructions
// contain no such worksheet (only Student Loan Interest, Self-Employed Health
// Insurance and Additional Tax Credit ones). So the $1.70 gap is DFA's, built
// into the note by reusing a midpoint value as an endpoint.
//
// Against the old marginal ladder's $3,480.00, either figure is about $330
// higher, which is the correction that matters.
//
// Note the schedule steps UP by $20.70 at $94,700 rather than being continuous:
// a filer at $94,700 owes $3,273.30 and one at $94,701 owes $3,294.04. That
// discontinuity is in the statute, not in this transcription — the bracket
// adjustment is a round $10 grid laid over an exact bridge, so it cannot meet
// the standard table exactly.
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2470,
    [MARRIED]: 4940,
    [MARRIED_SEPARATELY]: 2470,
    [HEAD_OF_HOUSEHOLD]: 2470,
  },
  [STATE_INCOME]: {
    // Arkansas's rate table does not vary by filing status.
    [ALL]: [
      { min: 0, max: 5600, rate: 0, base_amount: 0 },
      { min: 5600, max: 11200, rate: 2, base_amount: 0 },
      { min: 11200, max: 16000, rate: 3, base_amount: 112 },
      { min: 16000, max: 26400, rate: 3.4, base_amount: 256 },
      { min: 26400, max: 94700, rate: 3.9, base_amount: 609.6 },
      { min: 94700, max: 94800, rate: 3.9, base_amount: 3294 },
      { min: 94800, max: 94900, rate: 3.9, base_amount: 3307.9 },
      { min: 94900, max: 95000, rate: 3.9, base_amount: 3321.8 },
      { min: 95000, max: 95100, rate: 3.9, base_amount: 3335.7 },
      { min: 95100, max: 95200, rate: 3.9, base_amount: 3349.6 },
      { min: 95200, max: 95300, rate: 3.9, base_amount: 3363.5 },
      { min: 95300, max: 95400, rate: 3.9, base_amount: 3377.4 },
      { min: 95400, max: 95500, rate: 3.9, base_amount: 3391.3 },
      { min: 95500, max: 95600, rate: 3.9, base_amount: 3405.2 },
      { min: 95600, max: 95700, rate: 3.9, base_amount: 3419.1 },
      { min: 95700, max: 95800, rate: 3.9, base_amount: 3433 },
      { min: 95800, max: 95900, rate: 3.9, base_amount: 3446.9 },
      { min: 95900, max: 96000, rate: 3.9, base_amount: 3460.8 },
      { min: 96000, max: 96100, rate: 3.9, base_amount: 3474.7 },
      { min: 96100, max: 96200, rate: 3.9, base_amount: 3488.6 },
      { min: 96200, max: 96300, rate: 3.9, base_amount: 3502.5 },
      { min: 96300, max: 96400, rate: 3.9, base_amount: 3516.4 },
      { min: 96400, max: 96500, rate: 3.9, base_amount: 3530.3 },
      { min: 96500, max: 96600, rate: 3.9, base_amount: 3544.2 },
      { min: 96600, max: 96700, rate: 3.9, base_amount: 3558.1 },
      { min: 96700, max: 96800, rate: 3.9, base_amount: 3572 },
      { min: 96800, max: 96900, rate: 3.9, base_amount: 3585.9 },
      { min: 96900, max: 97000, rate: 3.9, base_amount: 3599.8 },
      { min: 97000, max: 97100, rate: 3.9, base_amount: 3613.7 },
      { min: 97100, max: 97200, rate: 3.9, base_amount: 3627.6 },
      { min: 97200, max: 97300, rate: 3.9, base_amount: 3641.5 },
      { min: 97300, max: 97400, rate: 3.9, base_amount: 3655.4 },
      { min: 97400, max: 97500, rate: 3.9, base_amount: 3669.3 },
      { min: 97500, max: 97600, rate: 3.9, base_amount: 3683.2 },
      { min: 97600, max: 97700, rate: 3.9, base_amount: 3697.1 },
      { min: 97700, max: 97800, rate: 3.9, base_amount: 3711 },
      { min: 97800, max: INFINITY, rate: 3.9, base_amount: 3724.9 },
    ],
  },
} as TaxData;
