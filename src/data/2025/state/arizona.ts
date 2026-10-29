import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STATE_INCOME, STANDARD_DEDUCTION } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against the 2025 Arizona Form 140 booklet, "2025
  // Arizona Standard Deduction Amounts Adjusted": $15,750 single or married
  // filing separately, $31,500 married filing jointly, $23,625 head of
  // household.
  //
  // Worth stating because it is not obvious: Arizona DOES carry the OBBBA
  // increase for 2025, unlike South Carolina, whose conformity date froze it
  // at the pre-OBBBA $15,000 / $30,000 / $22,500. Reading A.R.S. 43-1041(H)
  // alone suggests otherwise -- it indexes a 2019 base "in the same manner"
  // as the federal deduction, which sounds like inflation only -- but ADOR's
  // published figures match the post-OBBBA federal amounts exactly. The
  // department's own booklet is what settles it, not the statute.
  // Source: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15750,
    [MARRIED]: 31500,
    [MARRIED_SEPARATELY]: 15750,
    [HEAD_OF_HOUSEHOLD]: 23625,
  },
  // Verified 2026-09-08: 2025 Form 140 booklet, "2025 New Tax Rate of 2.5%
  // for All Income Levels and Filing Status"; line 46 instruction "Multiply
  // line 45 by 2.5% (.025)".
  // Source: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140Booklet.pdf
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
  },
} as TaxData;
