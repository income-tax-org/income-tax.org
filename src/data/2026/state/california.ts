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

// Brackets and standard deduction verified 2026-10-30 against the FTB's own
// 2026 publications; until then this file carried the 2025 figures forward.
// California indexes both under R&TC 17041(h), by 3.4% for 2026 ("the CCPI
// ... from June 2025 to June 2026, was 3.4%").
//
// Standard deduction: FTB Tax News, October 2026, "2026 Indexing" -- "$5,706
// $5,900" for single or married filing separate, "$11,412 $11,800" for joint,
// surviving spouse, or head of household.
// https://www.ftb.ca.gov/about-ftb/newsroom/tax-news/2026/10.html
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 5900,
    [MARRIED]: 11800,
    [MARRIED_SEPARATELY]: 5900,
    [HEAD_OF_HOUSEHOLD]: 11800,
  },
  // Source: 2026 California Tax Rate Schedules (Personal Income Tax Booklet
  // 2026), Schedules X, Y and Z.
  // https://www.ftb.ca.gov/forms/2026/2026-540-tax-rate-schedules.pdf
  // Verified: the schedules' cumulative "Enter on Form 540, line 31" column
  // reconciles with these boundaries to the cent in X and Y, and in Z except
  // for one row a cent off ($53,563.49 printed against $53,563.484) -- a
  // rounding artefact, since a dollar's boundary error would move it ~10
  // cents. Each X and Z boundary is the 2025 one times 1.034, rounded to the
  // dollar; Y is exactly twice X.
  //
  // The 13.3% top band is the 12.3% statutory top rate plus the 1% surcharge
  // on taxable income over $1,000,000 (R&TC 17043), now called the Behavioral
  // Health Services Tax. It applies at $1,000,000 for *every* filing status --
  // the threshold is not doubled for a joint return. The surcharge was missing
  // from this year entirely, so every filer above $1,000,000 was undertaxed by
  // a percentage point; added 2026-09-07 to match the 2023 file. Unlike the
  // bracket boundaries the $1,000,000 threshold is statutory, not indexed.
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
      { min: 0, max: 11456, rate: 1 },
      { min: 11456, max: 27157, rate: 2 },
      { min: 27157, max: 42861, rate: 4 },
      { min: 42861, max: 59498, rate: 6 },
      { min: 59498, max: 75197, rate: 8 },
      { min: 75197, max: 384109, rate: 9.3 },
      { min: 384109, max: 460927, rate: 10.3 },
      { min: 460927, max: 768213, rate: 11.3 },
      { min: 768213, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED]: [
      { min: 0, max: 22912, rate: 1 },
      { min: 22912, max: 54314, rate: 2 },
      { min: 54314, max: 85722, rate: 4 },
      { min: 85722, max: 118996, rate: 6 },
      { min: 118996, max: 150394, rate: 8 },
      { min: 150394, max: 768218, rate: 9.3 },
      { min: 768218, max: 921854, rate: 10.3 },
      { min: 921854, max: 1000000, rate: 11.3 },
      { min: 1000000, max: 1536426, rate: 12.3 },
      { min: 1536426, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 11456, rate: 1 },
      { min: 11456, max: 27157, rate: 2 },
      { min: 27157, max: 42861, rate: 4 },
      { min: 42861, max: 59498, rate: 6 },
      { min: 59498, max: 75197, rate: 8 },
      { min: 75197, max: 384109, rate: 9.3 },
      { min: 384109, max: 460927, rate: 10.3 },
      { min: 460927, max: 768213, rate: 11.3 },
      { min: 768213, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 22927, rate: 1 },
      { min: 22927, max: 54316, rate: 2 },
      { min: 54316, max: 70018, rate: 4 },
      { min: 70018, max: 86654, rate: 6 },
      { min: 86654, max: 102356, rate: 8 },
      { min: 102356, max: 522385, rate: 9.3 },
      { min: 522385, max: 626864, rate: 10.3 },
      { min: 626864, max: 1000000, rate: 11.3 },
      { min: 1000000, max: 1044771, rate: 12.3 },
      { min: 1044771, max: INFINITY, rate: 13.3 },
    ],
  },
  // Personal exemption credit: Form 540 line 7, "X $158" per credit -- one
  // for single, separate and head of household, two for a joint return, so
  // $316 there. Nonrefundable, off California tax only (line 33: "If less
  // than zero, enter -0-").
  //
  // It tapers above a federal AGI threshold. The line 32 AGI Limitation
  // Worksheet: c = AGI - $260,778 (single, separate), $521,561 (joint) or
  // $391,173 (head of household); d = c / $2,500 ($1,250 separate), "round
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
  //   Single at $270,000: c = 9,222, d = 4 (3.69 rounded up),
  //   158 - 24 = $134; band: floor((270,000 - 260,779) / 2,500) = 3
  //   steps off 152 = $134.
  //   Joint at $550,000: c = 28,439, d = 12, 316 - 144 = $172; band:
  //   floor((550,000 - 521,562) / 2,500) = 11 steps off 304 = $172.
  //
  // The band is picked by income after retirement contributions, the AGI
  // proxy. The credit is gone long before $1,000,000, so it never offsets the
  // 1% surcharge folded into the top bracket. Not modelled: the blind,
  // senior and dependent credits (lines 8-10), limited the same way.
  //
  // Amounts: FTB Tax News, October 2026, "2026 Indexing" -- personal
  // exemption credit "$153 $158", joint "$306 $316".
  // https://www.ftb.ca.gov/about-ftb/newsroom/tax-news/2026/10.html
  // Thresholds PROVISIONAL: FTB memo "Indexing, Personal Income Tax Law,
  // 2026 Tax Year" (2026-09-03), "Reduction of Exemption Credits": $260,778
  // single and separate, $391,173 head of household, $521,561 joint, and
  // "$6 ($12 joint)" per $2,500 ($1,250 separate). The memo is FTB's own but
  // is not on ftb.ca.gov; this copy is CalTax's. Each threshold is the 2025
  // one times 1.034, rounded -- the factor Tax News publishes. Re-check
  // against the 2026 540 booklet's worksheet (FTB: "late December").
  // https://www.caltax.org/regulatory-issues/ftb/2026-PIT-Indexing-Memo.pdf
  [PERSONAL_EXEMPTION_CREDIT]: {
    [SINGLE]: [
      { min: 0, max: 260779, amount: 158 },
      {
        min: 260779,
        max: INFINITY,
        amount: 152,
        reduce_per: 2500,
        reduce_by: 6,
      },
    ],
    [MARRIED]: [
      { min: 0, max: 521562, amount: 316 },
      {
        min: 521562,
        max: INFINITY,
        amount: 304,
        reduce_per: 2500,
        reduce_by: 12,
      },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 260779, amount: 158 },
      {
        min: 260779,
        max: INFINITY,
        amount: 152,
        reduce_per: 1250,
        reduce_by: 6,
      },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 391174, amount: 158 },
      {
        min: 391174,
        max: INFINITY,
        amount: 152,
        reduce_per: 2500,
        reduce_by: 6,
      },
    ],
  },
  // Verified 2026-09-07: correct, and not carried -- this is the published
  // 2026 rate. No wage ceiling since SB 951 took effect on 2024-01-01, so the
  // schedule correctly runs to INFINITY. Source: EDD, Tax Rates, Wage Limits,
  // and Value of Meals and Lodging (DE 3395), 2026 row: DI wage base "None",
  // SDI 1.3%. https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de3395.pdf
  [CALIFORNIA_SDI]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 1.3 }],
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
