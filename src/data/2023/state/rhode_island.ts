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
  // personal and dependency exemption (RI-1040 line 6, $4,700 per exemption
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
  //   excess = modified federal AGI - $233,750; $0 if excess > $26,800
  //   steps  = excess / $6,700, "increase to the next higher whole number"
  //   chart  = 1 -> 0.8000, 2 -> 0.6000, 3 -> 0.4000, 4 -> 0.2000
  // Rounding UP is why each band's `max` sits one dollar above the printed
  // step boundary, and why the last band drops straight from 20% to zero
  // rather than tapering into it -- $260,550 allows 20%, one dollar more
  // allows nothing. Written as plain per-band amounts because a step chart is
  // exactly that; no reduce field can express a ceiling-rounded count.
  //
  // Reconciliation: $10,000 + 1 x $4,700 = $14,700 for a single filer, and
  // 0.8/0.6/0.4/0.2 of that gives the band amounts below. The four statuses
  // share one threshold and one chart, so they differ only in that base.
  // Sources: https://tax.ri.gov/sites/g/files/xkgbur541/files/2024-01/ADV_2024_01_Inflation_Adjustments_0.pdf
  //          https://tax.ri.gov/sites/g/files/xkgbur541/files/2023-01/2023%20RI-1040ES_m.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 233751, amount: 14700 },
      { min: 233751, max: 240451, amount: 11760 },
      { min: 240451, max: 247151, amount: 8820 },
      { min: 247151, max: 253851, amount: 5880 },
      { min: 253851, max: 260551, amount: 2940 },
      { min: 260551, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 233751, amount: 29450 },
      { min: 233751, max: 240451, amount: 23560 },
      { min: 240451, max: 247151, amount: 17670 },
      { min: 247151, max: 253851, amount: 11780 },
      { min: 253851, max: 260551, amount: 5890 },
      { min: 260551, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 233751, amount: 14725 },
      { min: 233751, max: 240451, amount: 11780 },
      { min: 240451, max: 247151, amount: 8835 },
      { min: 247151, max: 253851, amount: 5890 },
      { min: 253851, max: 260551, amount: 2945 },
      { min: 260551, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 233751, amount: 19750 },
      { min: 233751, max: 240451, amount: 15800 },
      { min: 240451, max: 247151, amount: 11850 },
      { min: 247151, max: 253851, amount: 7900 },
      { min: 253851, max: 260551, amount: 3950 },
      { min: 260551, max: INFINITY, amount: 0 },
    ],
  },
  // Verified 2026-09-08 against ADV 2024-01's "Uniform tax rate schedule for
  // Tax Year 2023" (which ADV 2022-40 also prints). RI publishes ONE schedule
  // used by every filing status -- "which is used by all filers" -- so the
  // four identical ladders are correct, not a status copied over another.
  // The advisory's cumulative "Pay" column reconciles with these boundaries:
  //   73,450 x 3.75%                        = 2,754.38  (printed 2,754.38)
  //   2,754.38 + (166,950-73,450) x 4.75%   = 7,195.63  (printed 7,195.63)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 73450, rate: 3.75 },
      { min: 73450, max: 166950, rate: 4.75 },
      { min: 166950, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED]: [
      { min: 0, max: 73450, rate: 3.75 },
      { min: 73450, max: 166950, rate: 4.75 },
      { min: 166950, max: INFINITY, rate: 5.99 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 73450, rate: 3.75 },
      { min: 73450, max: 166950, rate: 4.75 },
      { min: 166950, max: INFINITY, rate: 5.99 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 73450, rate: 3.75 },
      { min: 73450, max: 166950, rate: 4.75 },
      { min: 166950, max: INFINITY, rate: 5.99 },
    ],
  },
  // Verified 2026-09-08 against RI DLT Employer Tax Unit as archived for
  // calendar year 2023: TDI taxable wage base $84,000 per employee, tax rate
  // 1.1%. The single bracket ending at $84,000 is the cap -- the calculator
  // charges only the slice up to a finite top max, so a $200,000 salary owes
  // $924, not 1.1% of everything. Source (Wayback, 2023-05-31):
  // https://web.archive.org/web/20230531202300/https://dlt.ri.gov/employers/employer-tax-unit
  [RI_TEMPORARY_DISABILITY_INSURANCE]: {
    [SINGLE]: [{ min: 0, max: 84000, rate: 1.1 }],
    [MARRIED]: [{ min: 0, max: 84000, rate: 1.1 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 84000, rate: 1.1 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 84000, rate: 1.1 }],
  },
} as TaxData;
