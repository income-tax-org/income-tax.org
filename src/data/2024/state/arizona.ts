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
  // Verified 2026-09-08 against the 2024 Arizona Form 140 booklet, "2024
  // Arizona Standard Deduction Amounts Adjusted": $14,600 single or married
  // filing separately, $29,200 married filing jointly, $21,900 head of
  // household. A.R.S. 43-1041(A)'s $12,200 / $18,350 / $24,400 is an
  // un-indexed 2019 base, not the in-force figure.
  // Source: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2024_140Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 14600,
    [MARRIED]: 29200,
    [MARRIED_SEPARATELY]: 14600,
    [HEAD_OF_HOUSEHOLD]: 21900,
  },
  // Verified 2026-09-08: 2024 Form 140 booklet, "2024 New Tax Rate of 2.5%
  // for All Income Levels and Filing Status"; return line 46 "Multiply line
  // 45 by 2.5% (.025)".
  // Source: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2024_140Booklet.pdf
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
  },
} as TaxData;
