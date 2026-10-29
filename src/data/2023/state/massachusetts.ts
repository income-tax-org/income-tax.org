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
  // ADDED 2026-09-08. Massachusetts has no standard deduction, so this slot
  // holds what it does subtract: the personal exemption, Form 1 line 2a.
  // "If you file a Massachusetts tax return, you're entitled to a personal
  // exemption regardless of whether you can claim a personal exemption on
  // your federal return or not." Single $4,400, married filing separate
  // $4,400, head of household $6,800, married filing joint $8,800. Same
  // treatment the audit gave Connecticut's personal exemption and the
  // Illinois, New Jersey and Ohio exemption allowances: the slot holds
  // whatever a state subtracts before applying its rate.
  //
  // Flat, with no phase-out and no indexation -- the four figures are
  // unchanged across DOR's page as revised 2022-12-30, 2024-12-05 and
  // 2026-01-06, which is what covers all four years in this repo.
  // Head of household's $6,800 is Massachusetts' own published figure for the
  // status, not a dependants assumption.
  //
  // Two further Form 1 subtractions are deliberately NOT here, both modelling
  // the no-dependants case: the $1,000 dependent exemption (line 2b), and the
  // deduction of up to $2,000 per taxpayer of Social Security and Medicare
  // tax actually paid (line 11), which nearly every W-2 filer maxes out but
  // which is computed from another tax rather than from income and has no
  // field in this schema. The second is worth about $100 of tax and leaves
  // Massachusetts modestly overstated.
  // Source (updated 2022-12-30): https://web.archive.org/web/20240106022042/https://www.mass.gov/info-details/view-massachusetts-personal-income-tax-exemptions
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 4400,
    [MARRIED]: 8800,
    [MARRIED_SEPARATELY]: 4400,
    [HEAD_OF_HOUSEHOLD]: 6800,
  },
  // Verified 2026-09-08. Massachusetts levies a flat 5% on Part B income and
  // the Article XLIV "millionaire" surtax adds 4 percentage points above the
  // threshold, which is why the top band reads 9% rather than a separate tax:
  // the surtax IS modelled, as 5% + 4%. TY2023 threshold $1,000,000 -- the
  // constitutional amendment's own starting figure, before the first annual
  // indexation. DOR: "Note: For tax year 2023, for income exceeding
  // $1,000,000, there is an additional surtax of 4%."
  // Source (Wayback, 2024-02-02): https://web.archive.org/web/20240202070529/https://www.mass.gov/info-details/massachusetts-tax-rates
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 1000000, rate: 5 },
      { min: 1000000, max: INFINITY, rate: 9 },
    ],
  },
} as TaxData;
