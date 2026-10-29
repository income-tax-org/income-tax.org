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
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

// CARRIED FROM 2025 -- brackets and standard deduction only.
//
// California indexes both for inflation under R&TC 17041(h), but as of
// 2026-09-07 the FTB has not published the 2026 figures: there is no 2026 Form
// 540 booklet, and FTB Tax News carries no indexing announcement. The FTB's
// own 2026 Form 540-ES worksheet tells taxpayers to estimate 2026 tax with the
// 2025 standard deduction ($5,706 / $11,412) and the 2025 tax table, which is
// exactly what this file does.
// https://www.ftb.ca.gov/forms/2026/2026-540-es-instructions.pdf
//
// Revisit once the 2026 540 booklet is posted (typically December).
export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 5706,
    [MARRIED]: 11412,
    [MARRIED_SEPARATELY]: 5706,
    [HEAD_OF_HOUSEHOLD]: 11412,
  },
  // Bracket boundaries are the verified 2025 ones (see the 2025 file for the
  // Schedule X / Y / Z cross-check against the cumulative tax column).
  //
  // The 13.3% top band is the 12.3% statutory top rate plus the 1% surcharge
  // on taxable income over $1,000,000 (R&TC 17043), now called the Behavioral
  // Health Services Tax. It applies at $1,000,000 for *every* filing status --
  // the threshold is not doubled for a joint return. The surcharge was missing
  // from this year entirely, so every filer above $1,000,000 was undertaxed by
  // a percentage point; added 2026-09-07 to match the 2023 file. Unlike the
  // bracket boundaries the $1,000,000 threshold is statutory, not indexed, so
  // it is not provisional.
  //
  // Read this band as what it is: a 1% surcharge on taxable income above
  // $1,000,000, levied separately on Form 540 line 62. It is not a statutory
  // rate bracket -- California's rate schedule tops out at 12.3% -- and it is
  // folded into the top band here only because a marginal bracket list is the
  // one shape this data model has. Do not carry 13.3% into anything that
  // means to quote the FTB rate schedule.
  //
  // Not modelled: California's exemption credits (Form 540 line 32), which
  // are per-taxpayer dollar credits against tax rather than a deduction, and
  // so cannot be expressed as brackets.
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 11079, rate: 1 },
      { min: 11079, max: 26264, rate: 2 },
      { min: 26264, max: 41452, rate: 4 },
      { min: 41452, max: 57542, rate: 6 },
      { min: 57542, max: 72724, rate: 8 },
      { min: 72724, max: 371479, rate: 9.3 },
      { min: 371479, max: 445771, rate: 10.3 },
      { min: 445771, max: 742953, rate: 11.3 },
      { min: 742953, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED]: [
      { min: 0, max: 22158, rate: 1 },
      { min: 22158, max: 52528, rate: 2 },
      { min: 52528, max: 82904, rate: 4 },
      { min: 82904, max: 115084, rate: 6 },
      { min: 115084, max: 145448, rate: 8 },
      { min: 145448, max: 742958, rate: 9.3 },
      { min: 742958, max: 891542, rate: 10.3 },
      { min: 891542, max: 1000000, rate: 11.3 },
      { min: 1000000, max: 1485906, rate: 12.3 },
      { min: 1485906, max: INFINITY, rate: 13.3 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 11079, rate: 1 },
      { min: 11079, max: 26264, rate: 2 },
      { min: 26264, max: 41452, rate: 4 },
      { min: 41452, max: 57542, rate: 6 },
      { min: 57542, max: 72724, rate: 8 },
      { min: 72724, max: 371479, rate: 9.3 },
      { min: 371479, max: 445771, rate: 10.3 },
      { min: 445771, max: 742953, rate: 11.3 },
      { min: 742953, max: 1000000, rate: 12.3 },
      { min: 1000000, max: INFINITY, rate: 13.3 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 22173, rate: 1 },
      { min: 22173, max: 52530, rate: 2 },
      { min: 52530, max: 67716, rate: 4 },
      { min: 67716, max: 83805, rate: 6 },
      { min: 83805, max: 98990, rate: 8 },
      { min: 98990, max: 505208, rate: 9.3 },
      { min: 505208, max: 606251, rate: 10.3 },
      { min: 606251, max: 1000000, rate: 11.3 },
      { min: 1000000, max: 1010417, rate: 12.3 },
      { min: 1010417, max: INFINITY, rate: 13.3 },
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
