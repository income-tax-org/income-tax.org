import { INFINITY } from "@/constants";
import {
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
  // personal and dependency exemption (RI-1040 line 6, $4,950 per exemption
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
  //   excess = modified federal AGI - $246,450; $0 if excess > $28,200
  //   steps  = excess / $7,050, "increase to the next higher whole number"
  //   chart  = 1 -> 0.8000, 2 -> 0.6000, 3 -> 0.4000, 4 -> 0.2000
  // Rounding UP is why each band's `max` sits one dollar above the printed
  // step boundary, and why the last band drops straight from 20% to zero
  // rather than tapering into it -- $274,650 allows 20%, one dollar more
  // allows nothing. Written as plain per-band amounts because a step chart is
  // exactly that; no reduce field can express a ceiling-rounded count.
  //
  // Reconciliation: $10,550 + 1 x $4,950 = $15,500 for a single filer, and
  // 0.8/0.6/0.4/0.2 of that gives the band amounts below. The four statuses
  // share one threshold and one chart, so they differ only in that base.
  // Sources: https://tax.ri.gov/sites/g/files/xkgbur541/files/2024-10/ADV_2024_26_Inflation_Adjustments.pdf
  //          https://tax.ri.gov/sites/g/files/xkgbur541/files/2023-12/2024%20RI-1040ES_w.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 246451, amount: 15500 },
      { min: 246451, max: 253501, amount: 12400 },
      { min: 253501, max: 260551, amount: 9300 },
      { min: 260551, max: 267601, amount: 6200 },
      { min: 267601, max: 274651, amount: 3100 },
      { min: 274651, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 246451, amount: 31050 },
      { min: 246451, max: 253501, amount: 24840 },
      { min: 253501, max: 260551, amount: 18630 },
      { min: 260551, max: 267601, amount: 12420 },
      { min: 267601, max: 274651, amount: 6210 },
      { min: 274651, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 246451, amount: 15525 },
      { min: 246451, max: 253501, amount: 12420 },
      { min: 253501, max: 260551, amount: 9315 },
      { min: 260551, max: 267601, amount: 6210 },
      { min: 267601, max: 274651, amount: 3105 },
      { min: 274651, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 246451, amount: 20800 },
      { min: 246451, max: 253501, amount: 16640 },
      { min: 253501, max: 260551, amount: 12480 },
      { min: 260551, max: 267601, amount: 8320 },
      { min: 267601, max: 274651, amount: 4160 },
      { min: 274651, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-09-08 against ADV 2024-01's and ADV 2024-26's "Uniform tax
  // rate schedule for Tax Year 2024" (both print it). RI publishes ONE
  // schedule used by every filing status, so the four identical ladders are
  // correct. The cumulative "Pay" column reconciles with these boundaries:
  //   77,450 x 3.75%                        = 2,904.38  (printed 2,904.38)
  //   2,904.38 + (176,050-77,450) x 4.75%   = 7,587.88  (printed 7,587.88)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 77450, rate: 3.75 },
      { min: 77450, max: 176050, rate: 4.75 },
      { min: 176050, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED]: [
      { min: 0, max: 77450, rate: 3.75 },
      { min: 77450, max: 176050, rate: 4.75 },
      { min: 176050, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 77450, rate: 3.75 },
      { min: 77450, max: 176050, rate: 4.75 },
      { min: 176050, max: INFINITY, rate: 5.99 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 77450, rate: 3.75 },
      { min: 77450, max: 176050, rate: 4.75 },
      { min: 176050, max: INFINITY, rate: 5.99 },
    ],
  },
  // Verified 2026-09-08 against RI DLT Employer Tax Unit as archived for
  // calendar year 2024: TDI taxable wage base $87,000 per employee, tax rate
  // 1.2%. Source (Wayback, 2024-05-28):
  // https://web.archive.org/web/20240528232952/https://dlt.ri.gov/employers/employer-tax-unit
  [RI_TEMPORARY_DISABILITY_INSURANCE]: {
    [SINGLE]: [
      { min: 0, max: 87000, rate: 1.2 },
      { min: 87000, max: INFINITY, rate: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 87000, rate: 1.2 },
      { min: 87000, max: INFINITY, rate: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 87000, rate: 1.2 },
      { min: 87000, max: INFINITY, rate: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 87000, rate: 1.2 },
      { min: 87000, max: INFINITY, rate: 0 },
    ],
  },
} as TaxData;
