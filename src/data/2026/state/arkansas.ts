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
// Top rate — CORRECTED 3.9% -> 3.7%. Act 1 of the First Extraordinary Session
// of 2026 (HB 1001, approved 5/6/26) rewrote Ark. Code 26-51-201(a)(4) for "tax
// years beginning on or after January 1, 2026". Enrolled text:
// https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FACTS%2F2026S1%2FPublic%2FACT1.pdf
// Arkansas's fifth top-rate cut since 2023 (4.9 -> 4.7 -> 4.4 -> 3.9 -> 3.7),
// which is why no year of this state may be assumed from its neighbour.
//
// ARKANSAS HAS TWO RATE SCHEDULES, and for this year the statute prints both in
// full, so every constant below is transcribed rather than derived:
//
//   (a)(4)(A) standard table, net income at or below $94,700:
//     $0-$5,599 0%, $5,600-$11,199 2%, $11,200-$15,999 3%,
//     $16,000-$26,399 3.4%, $26,400-$94,700 3.7%
//   (a)(4)(B) upper income table, charged on the WHOLE of a net income above
//     $94,700: $0-$4,700 2%, $4,701 and above 3.7%
//   (a)(4)(C) bracket adjustment, subtracted from the (B) result: $290 for
//     $94,701-$94,800, stepping down $10 per $100 band to $10 for
//     $97,501-$97,600, and $0 from $97,601
//
// A single marginal ladder cannot express a second schedule charged on the
// whole income, and the file previously held only (A), undercharging every
// filer above $94,700 by $287.30.
//
// The schedule below uses `base_amount` — the field added for Ohio's flat
// charge — because that is exactly the shape needed: each row carries the tax
// owed at its own floor and a rate on the excess above it. The first five rows
// are (A), written with cumulative bases so they reproduce the marginal ladder
// exactly. The next 29 rows are (C), one per $100 band. The last row is (B)
// with the adjustment spent: 2% x $4,700 + 3.7% x (income - $4,700) is
// 3.7% x income - $79.90, so at its floor of $97,600 the tax is
// 3.7% x $97,600 - $79.90 = $3,531.30, and 3.7% applies above.
//
// RECONCILIATION against DFA's own Withholding Tax Formula Method effective
// 01/01/2026, which publishes the same rule as a "minus adjustment" column and
// so is an independent arithmetic check on every constant here:
// https://www.dfa.arkansas.gov/wp-content/uploads/Withholding-Tax-Formula.pdf
//   its 3% row subtracts $223.97, and 3% x $11,200 - $223.97 = $112.03 against
//     this file's base of $112 at $11,200
//   its 3.4% row subtracts $287.97, and 3.4% x $16,000 - $287.97 = $256.03
//     against this file's base of $256 at $16,000
//   its 3.7% row subtracts $367.16, and 3.7% x $26,400 - $367.16 = $609.64
//     against this file's base of $609.60 at $26,400
//   its first bridge row subtracts $369.90, and 3.7% x $94,700 - $369.90 =
//     $3,134.00, this file's base at $94,700
//   its final row subtracts $79.90, and 3.7% x $97,600 - $79.90 = $3,531.30,
//     this file's base at $97,600
// (DFA rounds its adjustments to the cent, which is where the 3-4 cent
// differences come from; the statute's own widths are exact.)
//
// Note the schedule steps DOWN by $2.66 at $94,700: a filer at $94,700 owes
// $3,136.70 under (A) and one at $94,701 owes $3,134.04 under (B) less the $290
// adjustment. That discontinuity is in the statute, not in this transcription —
// the adjustment table is a round $10 grid laid over an exact bridge, so it
// cannot meet the standard table exactly. The 2025 file steps the other way for
// the same reason.
//
// Standard deduction — PROVISIONAL $2,470. The TY2026 AR1000F instructions are
// not published yet (checked 2026-09-08), so the only source is the withholding
// formula above, step 2: "Subtract the Standard Deduction of $2,470". A
// withholding document is not the annual figure. In its favour: that document
// is post-Act-1 and its brackets match the enacted annual table to the cent, as
// shown above, and Arkansas did not index its bracket boundaries for 2026
// either. Against it: the deduction is CPI-indexed under Act 1 of the 2nd
// Extraordinary Session of 2021 and rose every prior year ($2,340 -> $2,410 ->
// $2,470), so an unchanged figure is exactly the shape of a stale line in a
// half-updated document. WHAT WOULD SETTLE IT: the TY2026 AR1000F/AR1000NR
// instructions, which print the deduction for every filing status and carry the
// "NOTE: The $X Standard Deduction does not apply to taxpayer's dependent(s)"
// line used to source all three prior years. DFA publishes them around
// December; re-check then.
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
      { min: 26400, max: 94700, rate: 3.7, base_amount: 609.6 },
      { min: 94700, max: 94800, rate: 3.7, base_amount: 3134 },
      { min: 94800, max: 94900, rate: 3.7, base_amount: 3147.7 },
      { min: 94900, max: 95000, rate: 3.7, base_amount: 3161.4 },
      { min: 95000, max: 95100, rate: 3.7, base_amount: 3175.1 },
      { min: 95100, max: 95200, rate: 3.7, base_amount: 3188.8 },
      { min: 95200, max: 95300, rate: 3.7, base_amount: 3202.5 },
      { min: 95300, max: 95400, rate: 3.7, base_amount: 3216.2 },
      { min: 95400, max: 95500, rate: 3.7, base_amount: 3229.9 },
      { min: 95500, max: 95600, rate: 3.7, base_amount: 3243.6 },
      { min: 95600, max: 95700, rate: 3.7, base_amount: 3257.3 },
      { min: 95700, max: 95800, rate: 3.7, base_amount: 3271 },
      { min: 95800, max: 95900, rate: 3.7, base_amount: 3284.7 },
      { min: 95900, max: 96000, rate: 3.7, base_amount: 3298.4 },
      { min: 96000, max: 96100, rate: 3.7, base_amount: 3312.1 },
      { min: 96100, max: 96200, rate: 3.7, base_amount: 3325.8 },
      { min: 96200, max: 96300, rate: 3.7, base_amount: 3339.5 },
      { min: 96300, max: 96400, rate: 3.7, base_amount: 3353.2 },
      { min: 96400, max: 96500, rate: 3.7, base_amount: 3366.9 },
      { min: 96500, max: 96600, rate: 3.7, base_amount: 3380.6 },
      { min: 96600, max: 96700, rate: 3.7, base_amount: 3394.3 },
      { min: 96700, max: 96800, rate: 3.7, base_amount: 3408 },
      { min: 96800, max: 96900, rate: 3.7, base_amount: 3421.7 },
      { min: 96900, max: 97000, rate: 3.7, base_amount: 3435.4 },
      { min: 97000, max: 97100, rate: 3.7, base_amount: 3449.1 },
      { min: 97100, max: 97200, rate: 3.7, base_amount: 3462.8 },
      { min: 97200, max: 97300, rate: 3.7, base_amount: 3476.5 },
      { min: 97300, max: 97400, rate: 3.7, base_amount: 3490.2 },
      { min: 97400, max: 97500, rate: 3.7, base_amount: 3503.9 },
      { min: 97500, max: 97600, rate: 3.7, base_amount: 3517.6 },
      { min: 97600, max: INFINITY, rate: 3.7, base_amount: 3531.3 },
    ],
  },
} as TaxData;
