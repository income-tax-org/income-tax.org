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
  // PROVISIONAL, checked 2026-09-08 and left as it stands. These are the
  // federal TY2026 amounts (IRS Rev. Proc. 2025-32). ADOR has not published
  // an Arizona 2026 figure yet: the 2026 Form 140ES booklet tells filers to
  // estimate using "your total allowable 2025 standard deduction", and the
  // Arizona amount is only announced in the TY2026 Form 140 booklet, due
  // January 2027.
  //
  // Kept because Arizona's published amount has equalled the federal one
  // exactly in every year that has been published -- 2023, 2024 and 2025,
  // the last of those including the OBBBA increase -- so the federal figure
  // is the best-grounded stand-in rather than a guess. Re-check when the
  // TY2026 booklet appears.
  // Sources: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2026_140ESBooklet.pdf
  //          https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
  },
  // Verified 2026-09-08 against ADOR's 2026 Form 140ES booklet: "For tax year
  // 2026 estimated tax payments, the tax rate for estimating your tax
  // liability is 2.5%", and worksheet line 19 "Multiply line 18 by 2.5%
  // (.025)". Unlike the deduction above, the 2026 rate is published.
  // Source: https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2026_140ESBooklet.pdf
  [STATE_INCOME]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 2.5 }],
  },
} as TaxData;
