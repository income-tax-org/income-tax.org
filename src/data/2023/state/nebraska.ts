import { INFINITY } from "@/constants";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  PERSONAL_EXEMPTION_CREDIT,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07: all four correct.
  // Source: Form 1040N line 6, which spells all four amounts out in one
  // sentence, and the "Nebraska Standard Deduction Chart" on the facing
  // page (the chart's extra rows are the age-65/blind add-ons, not base
  // amounts).
  // https://revenue.nebraska.gov/sites/revenue.nebraska.gov/files/doc/tax-forms/2023/incometax/f_1040n_booklet_2023_Final.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 7900,
    [MARRIED]: 15800,
    [MARRIED_SEPARATELY]: 7900,
    [HEAD_OF_HOUSEHOLD]: 11600,
  },
  // Verified 2026-09-07: all four schedules correct, boundaries and rates.
  // Reconciled against the 2023 Nebraska Tax Table's over-the-top worksheet,
  // which gives the tax at $71,560 as $3,798 single / $2,844 joint / $3,283
  // head of household; these brackets reproduce all three to the dollar.
  // Boundaries are the indexed figures from DOR's "History of Individual
  // Income Tax Rates by Brackets"; rates from Neb. Rev. Stat. 77-2715.03,
  // which fixes rate three and rate four year by year.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/history_ind_inc_tax_brackets.pdf
  // https://nebraskalegislature.gov/laws/statutes.php?statute=77-2715.03
  // https://revenue.nebraska.gov/sites/revenue.nebraska.gov/files/doc/tax-forms/2023/incometax/2023_Nebraska_Tax_Tables_final.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3700, rate: 2.46 },
      { min: 3700, max: 22170, rate: 3.51 },
      { min: 22170, max: 35730, rate: 5.01 },
      { min: 35730, max: INFINITY, rate: 6.64 },
    ],
    [MARRIED]: [
      { min: 0, max: 7390, rate: 2.46 },
      { min: 7390, max: 44350, rate: 3.51 },
      { min: 44350, max: 71460, rate: 5.01 },
      { min: 71460, max: INFINITY, rate: 6.64 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3700, rate: 2.46 },
      { min: 3700, max: 22170, rate: 3.51 },
      { min: 22170, max: 35730, rate: 5.01 },
      { min: 35730, max: INFINITY, rate: 6.64 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 6900, rate: 2.46 },
      { min: 6900, max: 35480, rate: 3.51 },
      { min: 35480, max: 52980, rate: 5.01 },
      { min: 52980, max: INFINITY, rate: 6.64 },
    ],
  },
  // Personal exemption credit, Form 1040N line 18: "$157 times the number on
  // line 4". DOR's Tax Rate Chronology (Table 1) prints the same $157 for 2023.
  // Line 4 counts yourself (4a), a spouse on a joint return (4b) and
  // dependents (4c). Dependents are not modelled, so this is one exemption,
  // or two filing jointly -- Neb. Rev. Stat. 77-2716.01(1)(b): "plus two for
  // a married filing jointly return or plus one for any other return".
  // Nonrefundable, off Nebraska tax only; the form floors tax after
  // nonrefundable credits at zero. No AGI limit: the Chronology notes the
  // credit "was phased out as federal AGI increased for higher income
  // taxpayers through tax year 2005", and neither 77-2716.01(1)(b) nor the
  // form carries any limit now.
  // Source: https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2023/incometax/f_1040N_2023_Final.pdf
  //         https://nebraskalegislature.gov/laws/statutes.php?statute=77-2716.01
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: 157,
    [MARRIED]: 314,
    [MARRIED_SEPARATELY]: 157,
    [HEAD_OF_HOUSEHOLD]: 157,
  },
} as TaxData;
