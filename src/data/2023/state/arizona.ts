import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import { STANDARD_DEDUCTION, STATE_INCOME } from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-08 against the 2023 Arizona Form 140 booklet, "2023
  // Arizona Standard Deduction Amounts Adjusted": $13,850 single or married
  // filing separately, $27,700 married filing jointly, $20,800 head of
  // household. Also printed on the return's own "Your Standard Deduction"
  // table (page 21).
  //
  // Do NOT re-derive these from A.R.S. 43-1041(A), which still reads
  // $12,200 / $18,350 / $24,400. Those are a 2019 base that subsection (H)
  // requires the department to index forward "in the same manner in which
  // the federal basic standard deduction is adjusted for inflation" -- the
  // statutory number is not the in-force number.
  // Source: https://azdor.gov/sites/default/files/2023-12/FORMS_INDIVIDUAL_2023_140Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  // Verified 2026-09-08: "2023 New Tax Rate of 2.5% for All Income Levels and
  // Filing Status", 2023 Form 140 booklet; the return's line 46 reads
  // "Multiply line 45 by 2.5% (.025)". The Optional Tax Table and the X and Y
  // Tax Table became obsolete this year, which is why one rate covers every
  // status. Source: https://azdor.gov/sites/default/files/2023-12/FORMS_INDIVIDUAL_2023_140Booklet.pdf
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.5 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.5 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.5 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.5 }],
  },
} as TaxData;
