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
  // Corrected 2026-09-07: every figure was wrong - 8380 / 16760 / 8380 /
  // 12620, none of which Nebraska ever published. The head-of-household
  // error is what surfaced this: 12620 made 2025 look like a $20 decrease
  // in a state that indexes annually, and 2025 turned out to be the right
  // year. Single and joint are corroborated by DOR's own Tax Rate
  // Chronology (Table 1, Rev. 2-2026), which lists 8,350 / 16,700 for 2024:
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/4-607table1.pdf
  // Source: Form 1040N line 6, which spells all four amounts out in one
  // sentence, and the "Nebraska Standard Deduction Chart" on the facing
  // page (the chart's extra rows are the age-65/blind add-ons, not base
  // amounts).
  // https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2024/f_Individual_Income_Tax_Booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8350,
    [MARRIED]: 16700,
    [MARRIED_SEPARATELY]: 8350,
    [HEAD_OF_HOUSEHOLD]: 12250,
  },
  // Corrected 2026-09-07: every boundary in all four schedules was wrong.
  // The old values - 3000 / 18000 / 29000 single, 6000 / 36000 / 58000 joint,
  // 5600 / 28800 / 43000 head of household - are the UN-INDEXED STATUTORY
  // BASE from Neb. Rev. Stat. 77-2715.03(2)(a), not the brackets in force.
  // Subsection (3)(a) is explicit that those base amounts "shall be adjusted
  // for inflation" and rounded to the nearest ten dollars, so the statute's
  // own table is never the figure a return uses. Rates were already right.
  // Caught by reconciliation: the 2024 Nebraska Tax Table's over-the-top
  // worksheet puts the tax at $75,360 at $3,697 single / $2,993 joint /
  // $3,300 head of household. The old brackets returned $3,858.82, $3,316.62
  // and $3,553.32 - over by $162, $324 and $253. These reproduce all four to
  // the dollar.
  // Boundaries are the indexed figures from DOR's "History of Individual
  // Income Tax Rates by Brackets"; rates from Neb. Rev. Stat. 77-2715.03,
  // which fixes rate three and rate four year by year.
  // https://revenue.nebraska.gov/sites/default/files/doc/research/chronology/history_ind_inc_tax_brackets.pdf
  // https://nebraskalegislature.gov/laws/statutes.php?statute=77-2715.03
  // https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2024/2024_Tax_Tables.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 3900, rate: 2.46 },
      { min: 3900, max: 23370, rate: 3.51 },
      { min: 23370, max: 37670, rate: 5.01 },
      { min: 37670, max: INFINITY, rate: 5.84 },
    ],
    [MARRIED]: [
      { min: 0, max: 7790, rate: 2.46 },
      { min: 7790, max: 46760, rate: 3.51 },
      { min: 46760, max: 75340, rate: 5.01 },
      { min: 75340, max: INFINITY, rate: 5.84 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 3900, rate: 2.46 },
      { min: 3900, max: 23370, rate: 3.51 },
      { min: 23370, max: 37670, rate: 5.01 },
      { min: 37670, max: INFINITY, rate: 5.84 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 7270, rate: 2.46 },
      { min: 7270, max: 37400, rate: 3.51 },
      { min: 37400, max: 55850, rate: 5.01 },
      { min: 55850, max: INFINITY, rate: 5.84 },
    ],
  },
} as TaxData;
