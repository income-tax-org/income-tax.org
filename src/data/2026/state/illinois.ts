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

export default {
  // Verified 2026-09-07: correct. Illinois has levied a flat 4.95% on all
  // filing statuses since 2017-07-01 (35 ILCS 5/201(b)(5.4)).
  // Source: 2026 Booklet IL-700-T -- "Effective January 1, 2026", "Tax
  // rate 4.95%", "the exemption allowance is $2,925".
  // https://tax.illinois.gov/content/dam/soi/en/web/tax/forms/withholding/documents/currentyear/il-700-t.pdf
  // Illinois has no standard deduction. It allows a personal exemption
  // allowance instead, subtracted on IL-1040 line 10 before the flat 4.95%
  // rate, so it does exactly what this slot models -- see "What the slot
  // actually holds" in src/data/README.md.
  //
  // $2,925 per exemption for 2026. A joint return claims two (the filer and
  // the spouse), which is why MARRIED is double; the instructions group
  // married-filing-separately, head of household and widowed together with
  // single, so those three claim one each.
  //
  // The cliff is the reason this needs bands rather than a number. The
  // Income Exceptions box is absolute: above $250,000 of federal AGI
  // ($500,000 filing jointly) "you are not entitled to an exemption allowance
  // on Line 10. Enter 'zero' on Line 10." No taper. Written half-open, so the
  // zero band starts one dollar above the printed threshold.
  //
  // MODELLED: the no-dependants case, and no additional allowances. Line 10a
  // only. Lines 10b and 10c add $1,000 each for being 65 or over and for
  // blindness, and line 10d adds the dependant allowances from Schedule
  // IL-E/EITC; the calculator collects none of those. Same treatment as
  // Michigan's $600 exemption.
  //
  // Source: 2026 Form IL-1040 Instructions, Step 4 line 10a chart and the
  // "Income Exceptions" box.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: [
      { min: 0, max: 250001, amount: 2925 },
      { min: 250001, max: INFINITY, amount: 0 },
    ],
    [MARRIED]: [
      { min: 0, max: 500001, amount: 5850 },
      { min: 500001, max: INFINITY, amount: 0 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 250001, amount: 2925 },
      { min: 250001, max: INFINITY, amount: 0 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 250001, amount: 2925 },
      { min: 250001, max: INFINITY, amount: 0 },
    ],
  },
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 4.95 }],
  },
} as TaxData;
