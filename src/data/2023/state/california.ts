import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  CALIFORNIA_SDI,
  PERSONAL_EXEMPTION_CREDIT,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Verified 2026-09-07: correct.
  // Source: 2023 Form 540 booklet, "California Standard Deduction Chart for
  // Most People" ($5,363 single / married filing separately, $10,726 married
  // filing jointly, qualifying surviving spouse, or head of household).
  // https://www.ftb.ca.gov/forms/2023/2023-540-booklet.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 5363,
    [MARRIED]: 10726,
    [MARRIED_SEPARATELY]: 5363,
    [HEAD_OF_HOUSEHOLD]: 10726,
  },
  // Verified 2026-09-07 against the 2023 California Tax Rate Schedules
  // (Schedule X / Y / Z, page 75 of the 540 booklet, link above). Every
  // boundary is confirmed twice over: the schedule's own cumulative "enter on
  // Form 540, line 31" column only reconciles with these thresholds. E.g.
  // Schedule Y at $1,396,542 reads $135,752.98, which is the $72,628.92 owed
  // at $837,922 plus 11.3% of the $558,620 in between.
  //
  // The 13.3% top band is the 12.3% statutory top rate plus the 1% Mental
  // Health Services Tax (R&TC 17043). The 540 booklet's line 62 worksheet
  // applies that 1% to taxable income over $1,000,000 for *every* filing
  // status -- the threshold is not doubled for a joint return. The married
  // schedule here previously started the surcharge at $2,000,000, which
  // undertaxed joint filers between $1,000,000 and $1,396,542 by a full
  // percentage point; corrected 2026-09-07.
  //
  // Read this band as what it is: a 1% surcharge on taxable income above
  // $1,000,000, levied separately on Form 540 line 62. It is not a statutory
  // rate bracket -- California's rate schedule tops out at 12.3% -- and it is
  // folded into the top band here only because a marginal bracket list is the
  // one shape this data model has. Do not carry 13.3% into anything that
  // means to quote the FTB rate schedule.
  //
  // California's exemption credits (Form 540 line 32) are dollar credits
  // against tax, not brackets; see PERSONAL_EXEMPTION_CREDIT below.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10412, rate: 1 },
      { min: 10412, max: 24684, rate: 2 },
      { min: 24684, max: 38959, rate: 4 },
      { min: 38959, max: 54081, rate: 6 },
      { min: 54081, max: 68350, rate: 8 },
      { min: 68350, max: 349137, rate: 9.3 },
      { min: 349137, max: 418961, rate: 10.3 },
      { min: 418961, max: 698271, rate: 11.3 },
      { min: 698271, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED]: [
      { min: 0, max: 20824, rate: 1 },
      { min: 20824, max: 49368, rate: 2 },
      { min: 49368, max: 77918, rate: 4 },
      { min: 77918, max: 108162, rate: 6 },
      { min: 108162, max: 136700, rate: 8 },
      { min: 136700, max: 698274, rate: 9.3 },
      { min: 698274, max: 837922, rate: 10.3 },
      { min: 837922, max: 1000000, rate: 11.3 },
      { min: 1000000, max: 1396542, rate: 12.3 },
      { min: 1396542, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 10412, rate: 1 },
      { min: 10412, max: 24684, rate: 2 },
      { min: 24684, max: 38959, rate: 4 },
      { min: 38959, max: 54081, rate: 6 },
      { min: 54081, max: 68350, rate: 8 },
      { min: 68350, max: 349137, rate: 9.3 },
      { min: 349137, max: 418961, rate: 10.3 },
      { min: 418961, max: 698271, rate: 11.3 },
      { min: 698271, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 20839, rate: 1 },
      { min: 20839, max: 49371, rate: 2 },
      { min: 49371, max: 63644, rate: 4 },
      { min: 63644, max: 78765, rate: 6 },
      { min: 78765, max: 93037, rate: 8 },
      { min: 93037, max: 474824, rate: 9.3 },
      { min: 474824, max: 569790, rate: 10.3 },
      { min: 569790, max: 949649, rate: 11.3 },
      { min: 949649, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
  },
  // Personal exemption credit: Form 540 line 7, "X $144" per credit -- one
  // for single, separate and head of household, two for a joint return, so
  // $288 there. Nonrefundable, off California tax only (line 33: "If less
  // than zero, enter -0-").
  //
  // It tapers above a federal AGI threshold. The line 32 AGI Limitation
  // Worksheet: c = AGI - $237,035 (single, separate), $474,075 (joint) or
  // $355,558 (head of household); d = c / $2,500 ($1,250 separate), "round
  // it to the next higher whole number"; e = d x $6; g = e x the number of
  // credits on lines 7-9; i = credits - g, "If zero or less, enter -0-".
  // Line g is why a joint return loses $12 a step and every other return $6.
  //
  // Rounding up is the Connecticut problem (2026/state/connecticut.ts):
  // `reduce_per` counts whole steps down. So each taper band starts one
  // dollar above the threshold with one step already taken off. It runs to
  // INFINITY and the default floor of 0 ends the credit; there is no zero
  // band, which the app would read as an AGI cliff. Checked against the
  // worksheet at every dollar through each phase-out.
  //   Single at $250,000: c = 12,965, d = 6 (5.19 rounded up),
  //   144 - 36 = $108; band: floor((250,000 - 237,036) / 2,500) = 5
  //   steps off 138 = $108.
  //   Joint at $500,000: c = 25,925, d = 11, 288 - 132 = $156; band:
  //   floor((500,000 - 474,076) / 2,500) = 10 steps off 276 = $156.
  //
  // The band is picked by income after retirement contributions, the AGI
  // proxy. The credit is gone long before $1,000,000, so it never offsets the
  // 1% surcharge folded into the top bracket. Not modelled: the blind,
  // senior and dependent credits (lines 8-10), limited the same way.
  // Source: 2023 Form 540 booklet, line 32 instructions and AGI Limitation
  // Worksheet; Form 540 line 7.
  // https://www.ftb.ca.gov/forms/2023/2023-540-booklet.pdf
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: [
      { min: 0, max: 237036, amount: 144 },
      {
        min: 237036,
        max: INFINITY,
        amount: 138,
        reduce_per: 2500,
        reduce_by: 6,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 474076, amount: 288 },
      {
        min: 474076,
        max: INFINITY,
        amount: 276,
        reduce_per: 2500,
        reduce_by: 12,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 237036, amount: 144 },
      {
        min: 237036,
        max: INFINITY,
        amount: 138,
        reduce_per: 1250,
        reduce_by: 6,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 355559, amount: 144 },
      {
        min: 355559,
        max: INFINITY,
        amount: 138,
        reduce_per: 2500,
        reduce_by: 6,
      },
    ],
  },
  // Verified 2026-09-07: correct. 2023 is the last year with an SDI wage
  // ceiling -- SB 951 removed it effective 2024-01-01 -- so the schedule
  // stops at the $153,164 taxable wage limit instead of running to INFINITY.
  // Source: EDD, Tax Rates, Wage Limits, and Value of Meals and Lodging
  // (DE 3395), 2023 row: DI wage base $153,164, SDI 0.9%.
  // https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de3395.pdf
  [CALIFORNIA_SDI]: {
    [ALL]: [{ min: 0, max: 153164, rate: 0.9 }],
  },
  // No [CITIES] key, and that is a finding rather than a gap: California law
  // preempts local income taxes outright. Verified 2026-09-11 against R&TC
  // 17041.5, which provides that "no city, county, city and county ... shall
  // levy or collect or cause to be levied or collected any tax upon the
  // income, or any part thereof, of any person," carving out only an
  // "otherwise authorized license tax upon a business measured by or
  // according to gross receipts."
  // https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17041.5
  //
  // San Francisco is the counterexample people reach for, and it lands
  // squarely inside that carve-out. Its Gross Receipts Tax, Homelessness
  // Gross Receipts Tax, Commercial Rents Tax, and Overpaid Executive Gross
  // Receipts Tax are all owed by the business and none are withheld from a
  // paycheck. The Payroll Expense Tax that stale sources -- including
  // Wikipedia's state-income-tax article, which still lists "San Francisco
  // (payroll only)" -- keep citing was the same species: a business license
  // tax measured by payroll, not a tax on an employee's income. Prop E (2012)
  // phased its rate to zero as the Gross Receipts Tax phased in.
  //
  // So a California wage earner's only sub-federal taxes are the two above,
  // state income tax and SDI. This holds for every California city and every
  // year; do not open this question again without a change to 17041.5.
} as TaxData;
