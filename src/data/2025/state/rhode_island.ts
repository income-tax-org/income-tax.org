import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  RI_TEMPORARY_DISABILITY_INSURANCE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // This slot holds the SUM of two things Rhode Island subtracts, because it
  // subtracts both: the RI standard deduction (RI-1040 line 4) and the
  // personal and dependency exemption (RI-1040 line 6, $5,100 per exemption
  // from RI Schedule E). The README's rule for a state with both is to carry
  // their sum, and RI is that state -- the earlier flat figure here was the
  // deduction alone and understated every filer by a full exemption.
  //
  // Exemption count is the NO-DEPENDANTS case, the same convention the rest
  // of the repo uses: RI Schedule E counts line 1a "Yourself" and line 1b
  // "Spouse" before any dependants, so single, married filing separately and
  // head of household take one exemption and married filing jointly takes
  // two. Head of household is the honest compromise -- that status requires a
  // qualifying person, so a real head-of-household filer has at least two
  // exemptions, but modelling one here would be the only place in the repo
  // that assumes a dependant.
  //
  // The bands are RI's phase-out, which this file previously noted and did
  // not express. It is a STEP function, not a taper, and the RI-1040ES
  // Deduction Worksheet and Exemption Worksheet apply the identical rule to
  // both components -- same threshold, same increment, same chart -- which is
  // what makes summing them before phasing correct:
  //   excess = modified federal AGI - $254,250; $0 if excess > $29,000
  //   steps  = excess / $7,250, "increase to the next higher whole number"
  //   chart  = 1 -> 0.8000, 2 -> 0.6000, 3 -> 0.4000, 4 -> 0.2000
  // Rounding UP is why each band's `max` sits one dollar above the printed
  // step boundary, and why the last band drops straight from 20% to zero
  // rather than tapering into it -- $283,250 allows 20%, one dollar more
  // allows nothing. Written as plain per-band amounts because a step chart is
  // exactly that; no reduce field can express a ceiling-rounded count.
  //
  // Reconciliation: $10,900 + 1 x $5,100 = $16,000 for a single filer, and
  // 0.8/0.6/0.4/0.2 of that gives the band amounts below. The four statuses
  // share one threshold and one chart, so they differ only in that base.
  // Sources: https://tax.ri.gov/sites/g/files/xkgbur541/files/2024-10/ADV_2024_26_Inflation_Adjustments.pdf
  //          https://tax.ri.gov/sites/g/files/xkgbur541/files/2024-12/2025%20RI-1040ES_w.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 254251, amount: 16000 },
      { min: 254251, max: 261501, amount: 12800 },
      { min: 261501, max: 268751, amount: 9600 },
      { min: 268751, max: 276001, amount: 6400 },
      { min: 276001, max: 283251, amount: 3200 },
      { min: 283251, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 254251, amount: 32000 },
      { min: 254251, max: 261501, amount: 25600 },
      { min: 261501, max: 268751, amount: 19200 },
      { min: 268751, max: 276001, amount: 12800 },
      { min: 276001, max: 283251, amount: 6400 },
      { min: 283251, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 254251, amount: 16000 },
      { min: 254251, max: 261501, amount: 12800 },
      { min: 261501, max: 268751, amount: 9600 },
      { min: 268751, max: 276001, amount: 6400 },
      { min: 276001, max: 283251, amount: 3200 },
      { min: 283251, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 254251, amount: 21450 },
      { min: 254251, max: 261501, amount: 17160 },
      { min: 261501, max: 268751, amount: 12870 },
      { min: 268751, max: 276001, amount: 8580 },
      { min: 276001, max: 283251, amount: 4290 },
      { min: 283251, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-09-08 against ADV 2024-26's and ADV 2025-22's "Uniform tax
  // rate schedule for Tax Year 2025" (both print it). RI publishes ONE
  // schedule used by every filing status, so the four identical ladders are
  // correct. The cumulative "Pay" column reconciles with these boundaries:
  //   79,900 x 3.75%                        = 2,996.25  (printed 2,996.25)
  //   2,996.25 + (181,650-79,900) x 4.75%   = 7,829.38  (printed 7,829.38)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 79900, rate: 3.75 },
      { min: 79900, max: 181650, rate: 4.75 },
      { min: 181650, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED]: [
      { min: 0, max: 79900, rate: 3.75 },
      { min: 79900, max: 181650, rate: 4.75 },
      { min: 181650, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 79900, rate: 3.75 },
      { min: 79900, max: 181650, rate: 4.75 },
      { min: 181650, max: INFINITY, rate: 5.99 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 79900, rate: 3.75 },
      { min: 79900, max: 181650, rate: 4.75 },
      { min: 181650, max: INFINITY, rate: 5.99 },
    ],
  },
  // Verified 2026-09-08 against RI DLT Employer Tax Unit as archived for
  // calendar year 2025: TDI taxable wage base $89,200 per employee, tax rate
  // 1.3%. Source (Wayback, 2025-04):
  // https://web.archive.org/web/20250401000000/https://dlt.ri.gov/employers/employer-tax-unit
  [RI_TEMPORARY_DISABILITY_INSURANCE]: {
    [ALL]: [
      { min: 0, max: 89200, rate: 1.3 },
      { min: 89200, max: INFINITY, rate: 0 },
    ],
  },
} as TaxData;
