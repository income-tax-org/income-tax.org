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
  // Verified 2026-09-07: all four correct. The apparent head-of-household
  // decrease from 2024 was 2024 being wrong, not this year.
  // Source: Form 1040N line 6, which spells all four amounts out in one
  // sentence, and the "Nebraska Standard Deduction Chart" on the facing
  // page (the chart's extra rows are the age-65/blind add-ons, not base
  // amounts).
  // https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_Individual_Income_Tax_Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8600,
    [MARRIED]: 17200,
    [MARRIED_SEPARATELY]: 8600,
    [HEAD_OF_HOUSEHOLD]: 12600,
  },
  // Corrected 2026-09-07: every boundary in all four schedules was wrong, and
  // wrong in two different ways, both wearing an off-by-one.
  // Single and separate held 2023's boundaries (3700 / 22170 / 35730) written
  // one dollar low as an inclusive max; joint was that doubled the same way.
  // Head of household held the un-indexed statutory base from Neb. Rev. Stat.
  // 77-2715.03(2)(a) (5,600 / 28,800 / 43,000), also one dollar low - which is
  // why it read as a $1 fall from 2024 rather than as a wrong year.
  // Note the repo's convention: one bracket's max IS the next one's min, so a
  // boundary is never written as the statute's inclusive "$0-5,599".
  // Reconciliation: the 2025 Nebraska Tax Table's over-the-top worksheet puts
  // the tax at $77,760 at $3,566 single / $3,088 joint / $3,276 head of
  // household. The old brackets returned $3,604.26, $3,164.97 and $3,471.05.
  // These reproduce all four to the dollar. Rates were already right.
  // Boundaries are the indexed figures from DOR's "History of Individual
  // Income Tax Rates by Brackets"; rates from Neb. Rev. Stat. 77-2715.03,
  // which fixes rate three and rate four year by year.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/history_ind_inc_tax_brackets.pdf
  // https://nebraskalegislature.gov/laws/statutes.php?statute=77-2715.03
  // https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/2025_Tax_Tables.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 4030, rate: 2.46 },
      { min: 4030, max: 24120, rate: 3.51 },
      { min: 24120, max: 38870, rate: 5.01 },
      { min: 38870, max: INFINITY, rate: 5.2 },
    ],
    [MARRIED]: [
      { min: 0, max: 8040, rate: 2.46 },
      { min: 8040, max: 48250, rate: 3.51 },
      { min: 48250, max: 77730, rate: 5.01 },
      { min: 77730, max: INFINITY, rate: 5.2 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 4030, rate: 2.46 },
      { min: 4030, max: 24120, rate: 3.51 },
      { min: 24120, max: 38870, rate: 5.01 },
      { min: 38870, max: INFINITY, rate: 5.2 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 7510, rate: 2.46 },
      { min: 7510, max: 38590, rate: 3.51 },
      { min: 38590, max: 57630, rate: 5.01 },
      { min: 57630, max: INFINITY, rate: 5.2 },
    ],
  },
  // Personal exemption credit, Form 1040N line 18: "$171 times the number on
  // line 4". DOR's Tax Rate Chronology (Table 1) prints the same $171 for 2025.
  // Line 4 counts yourself (4a), a spouse on a joint return (4b) and
  // dependents (4c). Dependents are not modelled, so this is one exemption,
  // or two filing jointly -- Neb. Rev. Stat. 77-2716.01(1)(b): "plus two for
  // a married filing jointly return or plus one for any other return".
  // Nonrefundable, off Nebraska tax only; the form floors tax after
  // nonrefundable credits at zero. No AGI limit: the Chronology notes the
  // credit "was phased out as federal AGI increased for higher income
  // taxpayers through tax year 2005", and neither 77-2716.01(1)(b) nor the
  // form carries any limit now.
  // Source: https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N.pdf
  //         https://nebraskalegislature.gov/laws/statutes.php?statute=77-2716.01
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: 171,
    [MARRIED]: 342,
    [MARRIED_SEPARATELY]: 171,
    [HEAD_OF_HOUSEHOLD]: 171,
  },
} as TaxData;
