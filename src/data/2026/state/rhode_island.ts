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
  // personal and dependency exemption (RI-1040 line 6, $5,250 per exemption
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
  //   excess = modified federal AGI - $261,000; $0 if excess > $29,800
  //   steps  = excess / $7,450, "increase to the next higher whole number"
  //   chart  = 1 -> 0.8000, 2 -> 0.6000, 3 -> 0.4000, 4 -> 0.2000
  // Rounding UP is why each band's `max` sits one dollar above the printed
  // step boundary, and why the last band drops straight from 20% to zero
  // rather than tapering into it -- $290,800 allows 20%, one dollar more
  // allows nothing. Written as plain per-band amounts because a step chart is
  // exactly that; no reduce field can express a ceiling-rounded count.
  //
  // Note for anyone diffing this against an older revision: the underlying
  // 2026 deduction was ALSO wrong before today, carried from 2025 at
  // $10,900 / $21,800 / $10,900 / $16,350. ADV 2025-22 sets it at
  // $11,200 / $22,400 / $11,200 / $16,800, and that is what is summed here.
  //
  // Reconciliation: $11,200 + 1 x $5,250 = $16,450 for a single filer, and
  // 0.8/0.6/0.4/0.2 of that gives the band amounts below. The four statuses
  // share one threshold and one chart, so they differ only in that base.
  // Sources: https://tax.ri.gov/sites/g/files/xkgbur541/files/2025-11/ADV_2025_22_Inflation_Adjustments.pdf
  //          https://tax.ri.gov/sites/g/files/xkgbur541/files/2026-01/2026%20RI-1040ES_w.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 261001, amount: 16450 },
      { min: 261001, max: 268451, amount: 13160 },
      { min: 268451, max: 275901, amount: 9870 },
      { min: 275901, max: 283351, amount: 6580 },
      { min: 283351, max: 290801, amount: 3290 },
      { min: 290801, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 261001, amount: 32900 },
      { min: 261001, max: 268451, amount: 26320 },
      { min: 268451, max: 275901, amount: 19740 },
      { min: 275901, max: 283351, amount: 13160 },
      { min: 283351, max: 290801, amount: 6580 },
      { min: 290801, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 261001, amount: 16450 },
      { min: 261001, max: 268451, amount: 13160 },
      { min: 268451, max: 275901, amount: 9870 },
      { min: 275901, max: 283351, amount: 6580 },
      { min: 283351, max: 290801, amount: 3290 },
      { min: 290801, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 261001, amount: 22050 },
      { min: 261001, max: 268451, amount: 17640 },
      { min: 268451, max: 275901, amount: 13230 },
      { min: 275901, max: 283351, amount: 8820 },
      { min: 283351, max: 290801, amount: 4410 },
      { min: 290801, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-09-08 against ADV 2025-22's "Uniform tax rate schedule for
  // Tax Year 2026". RI publishes one schedule used by every filing status,
  // so the four identical ladders are correct, not a copied status. The
  // advisory's cumulative "Pay" column reconciles with these boundaries:
  //   82,050 x 3.75%                        = 3,076.88  (printed 3,076.88)
  //   3,076.88 + (186,450-82,050) x 4.75%   = 8,035.88  (printed 8,035.88)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 82050, rate: 3.75 },
      { min: 82050, max: 186450, rate: 4.75 },
      { min: 186450, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED]: [
      { min: 0, max: 82050, rate: 3.75 },
      { min: 82050, max: 186450, rate: 4.75 },
      { min: 186450, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 82050, rate: 3.75 },
      { min: 82050, max: 186450, rate: 4.75 },
      { min: 186450, max: INFINITY, rate: 5.99 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 82050, rate: 3.75 },
      { min: 82050, max: 186450, rate: 4.75 },
      { min: 186450, max: INFINITY, rate: 5.99 },
    ],
  },
  // Verified 2026-09-08 against RI DLT Employer Tax Unit, "The following
  // information is effective for calendar year 2026": TDI taxable wage base
  // $100,000 per employee, tax rate 1.1%. The cap is real and is why the
  // second band exists -- an uncapped schedule would charge $1,100 on a
  // $200,000 salary against a true maximum of $1,100 at $100,000.
  // Source: https://dlt.ri.gov/employers/employer-tax-unit
  [RI_TEMPORARY_DISABILITY_INSURANCE]: {
    [ALL]: [
      { min: 0, max: 100000, rate: 1.1 },
      { min: 100000, max: INFINITY, rate: 0 },
    ],
  },
} as TaxData;
