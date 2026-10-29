import { INFINITY } from "@/constants";
import {
  BOWLING_GREEN,
  CITIES,
  COVINGTON,
  ELIZABETHTOWN,
  FLORENCE,
  FRANKFORT,
  HENDERSON,
  LEXINGTON,
  LOUISVILLE,
  NEWPORT,
  OWENSBORO,
  PADUCAH,
  RICHMOND,
} from "@/constants/cities";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  OCCUPATIONAL_TAX,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Corrected 2026-09-07: MARRIED was 6720, double SINGLE. Kentucky
  // publishes ONE standard deduction that every filing status uses, and it
  // is not doubled on a joint return. Form 740, Line 10: "Nonitemizers, enter
  // the standard deduction of $3,360. If married filing separately on a combined
  // return, enter $3,360 in both Columns A and B. If filing a joint return, only
  // one $3,360 standard deduction is allowed." The per-spouse doubling belongs to
  // KY Filing Status 2, married filing separately on a combined return, which
  // this schema has no slot for; MARRIED models Filing Status 3, the joint
  // return, so it is deliberately NOT 2x SINGLE. Kentucky has no head-of-
  // household status either - those filers use single - so HEAD_OF_HOUSEHOLD
  // matching SINGLE is the rule, not a duplicated figure.
  // Source: DOR's 2026 standard deduction announcement (2025-09-04), "the
  // standard deduction for 2026 is $3,360, an increase of $90". The 2026
  // Form 740 packet is not published yet; the rule above is unchanged in
  // every packet from 2023 on.
  // https://revenue.ky.gov/News/pages/kentucky-dor-announces-2026-standard-deduction.aspx
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 3360,
    [MARRIED]: 3360,
    [MARRIED_SEPARATELY]: 3360,
    [HEAD_OF_HOUSEHOLD]: 3360,
  },
  // Kentucky is a flat tax: one rate on all taxable income, identical for
  // every filing status.
  // Verified 2026-09-07. Source: 2026 Kentucky Withholding Tax Formula,
  // 42A003 (TCF)(10-2025) - "2026 Kentucky Tax Rate: 3.5% of taxable
  // income". The HB 1 rate-reduction trigger did fire; that same sheet
  // independently confirms the $3,360 standard deduction above.
  // https://revenue.ky.gov/Forms/2026%20Withholding%20Formula.pdf
  [STATE_INCOME]: {
    [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.5 }],
    [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.5 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.5 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.5 }],
  },
  [CITIES]: {
    // Verified 2026-09-07. RESIDENT TOTAL, and it is already a combined
    // figure - three components collected as one by the Louisville Metro
    // Revenue Commission:
    //   1.25%  Louisville Metro Government
    //   0.20%  Transit Authority of River City (TARC)
    //   0.75%  Jefferson County / Anchorage school board
    //   -----
    //   2.20%
    // Do not split this back out into the 1.25% Metro share. Non-residents
    // pay 1.45% - the same total less the school board portion - and this
    // file models the resident, which is what selecting a city in a
    // take-home calculator means.
    // Source: Kentucky Secretary of State's occupational tax register (KRS
    // 67.766), Louisville Metro entry, ordinance 110 Series 2008 - "2.2%
    // (Resident inc. School board)/1.45% (Non-resident)".
    // https://web.sos.ky.gov/occupationaltax/
    [LOUISVILLE]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.2 }],
      },
    },
    // Corrected 2026-09-07: was 2.25, the LFUCG component alone. RESIDENT
    // TOTAL, two components levied and collected separately:
    //   2.25%  Lexington-Fayette Urban County Government
    //   0.50%  Fayette County Board of Education (KRS 160.605)
    //   -----
    //   2.75%
    // No single page shows 2.75, so do not "correct" this back to the 2.25
    // the city publishes - that figure is real but partial, and Louisville
    // above is stored school-inclusive, so a partial Lexington makes the two
    // cities incomparable on the very page that ranks them.
    // This models a RESIDENT: the school levy falls on "individuals who are
    // Fayette County residents for activities performed or rendered in
    // Fayette County", and selecting a city in a take-home calculator means
    // living and working there - the same premise the repo uses for NYC and
    // Yonkers.
    // Watch item: the board voted 2025-05-27 to seek 0.75% under KRS
    // 160.607(2), but Attorney General opinion 25-07 found the vote
    // improperly noticed and the increase was paused. FCPS still publishes
    // one-half of 1 percent as of 2026-09-07.
    // Sources:
    // https://www.lexingtonky.gov/working/business-licensing-taxes/occupational-license-fee-rates-current-forms
    // https://www.fcps.net/community/tax-collection-office
    [LEXINGTON]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.75 }],
      },
    },
    // Corrected 2026-09-07: was 2.0, the city component alone. RESIDENT
    // TOTAL, two components levied and collected separately:
    //   2.00%  City of Bowling Green (effective 2024-01-01, up from 1.85%)
    //   0.50%  Warren County Board of Education (KRS 160.605)
    //   -----
    //   2.50%
    // Warren County's own 1% is NOT a third component and must not be added
    // on top. The county's Local Taxes sheet is explicit both ways: the
    // county and city fees "cannot be charged on the same dollar earned,
    // you pay either/or based on where the work is being performed", while
    // the school levy "can be withheld in addition to either the County or
    // City taxes".
    // This models a RESIDENT: the school levy requires the employee to
    // "1st live in the WC School District and 2nd work within BG/WC", and
    // selecting a city in a take-home calculator means living and working
    // there - the same premise the repo uses for NYC and Yonkers.
    // Sources: https://www.bgky.org/finance/occupational-taxes-increase
    // https://www.warrencountyky.gov/wp-content/uploads/2024/03/Local-Taxes.pdf
    // https://www.warrencountyschools.org/departments/occupational-tax-office-1
    [BOWLING_GREEN]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.5 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.5 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.5 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.5 }],
      },
    },
    // Corrected 2026-09-07: was 2.5, which is Covington's NET PROFITS rate,
    // not the payroll rate. The city's Finance page states both: "Employers in
    // Covington are required to withhold 2.45% on all compensation paid to
    // their employees", while "The Occupational License Tax is assessed at
    // 2.5% of the net profits". 2.45% is unchanged in snapshots from 2023-06
    // and 2025-06 and on the live page today, so there is no rate change to
    // model - the wrong one of the two published figures was picked up.
    // Source: https://www.covingtonky.gov/government/departments/finance
    // UNRESOLVED: Covington may cap the base like its Northern Kentucky
    // neighbours - Newport and Florence cap at the Social Security wage base,
    // and Campbell County's and the City of Walton's published tables cap at
    // "the annual FICA wage limit of $184,500 for 2026". The city's Finance
    // page states no cap, and the Kentucky Secretary of State's register
    // carries an "$80,000" cap for Covington that no source found today
    // explains - it matches neither a wage base nor 2.45% of anything
    // obvious. Left uncapped rather than guessed at.
    [COVINGTON]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.45 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.45 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.45 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.45 }],
      },
    },
    // Verified 2026-09-07: "The Payroll Tax Rate is 2.5% of Gross wages
    // earned in the City of Newport."
    // Corrected 2026-09-07: the schedule ran to INFINITY. The same page adds
    // "The City does recognize the FICA limit", so wages above the Social
    // Security wage base ($184,500 for 2026) are not taxed - the trailing 0%
    // bracket. Campbell County's published 2026 rate table caps its own
    // levies at $184,500 the same way.
    // Source: https://www.newportky.gov/193/Taxes
    [NEWPORT]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [
          { min: 0, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0 },
        ],
        [MARRIED]: [
          { min: 0, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0 },
        ],
      },
    },
    // Corrected 2026-09-07: was 1.33, the city's rate for 2014. The City of
    // Owensboro has charged 1.78% on every period ending 6/30/18 and after.
    // Source: City of Owensboro Employer's Return of License Fee Withheld -
    // "4A. City of Owensboro (1.78% of Line 3A)"; Table A of the NP-1
    // instructions and the year-by-year table in the RU-1 instructions agree.
    // Daviess County's separate 1.0% applies to work done in the county
    // OUTSIDE the city limits, so it does not stack here.
    // https://cms2.revize.com/revize/owensboroky/Documents/Departments/Finance/Occupational%20Net%20Profit%20License%20Fee%20Forms/Net-Profit-Instructions-7-1-2024.pdf
    [OWENSBORO]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 1.78 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 1.78 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 1.78 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 1.78 }],
      },
    },
    // Verified 2026-09-07: "The City of Paducah levies an Occupational License
    // Fee (employee payroll withholding tax, also known as payroll tax) of 2.0
    // percent ... of gross salaries, wages, commissions and other compensation
    // that is earned within the City limits."
    // Source: https://paducahky.gov/departments/finance/business-license-and-payroll-tax
    [PADUCAH]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    // Corrected 2026-09-07: was a flat 2.0%, the City of Florence component
    // alone. That understated a resident on $50,000 by 68% - $1,000 against
    // the $1,675 actually withheld. (Not 3.45% of $50,000: the mental health
    // levy has already capped out by then, which is the point of the schedule
    // below.) RESIDENT TOTAL, four levies on the same wages:
    //
    //   2.00%  City of Florence, ord. 0-27-07, capped at the Social Security
    //          wage base ($184,500 for 2026)
    //   0.80%  Boone County Fiscal Court, ord. 07-27, capped at $79,494
    //          of wages for 2026 (maximum payment $635.95)
    //   0.15%  Boone County Mental Health, ord. 07-26, capped at $16,666
    //          (maximum payment $25.00)
    //   0.50%  Boone County Board of Education, no maximum
    //   -----
    //   3.45%  combined, at income below the first cap
    //
    // The four caps sit at different thresholds, so the schedule genuinely
    // steps DOWN three times. The declining rates are deliberate, not a
    // mangled bracket table - each step is one levy capping out:
    //   3.45% to   $16,666   all four levies
    //   3.30% to   $79,494   mental health has capped out
    //   2.50% to  $184,500   the county fiscal court fee has too
    //   0.50% above these    school board only, the one uncapped levy
    //
    // BOONE COUNTY STACKS. Its own FAQ asks "Are both city and county taxes
    // withheld?" and answers "Yes... These taxes are independent of each
    // other, and both must be withheld as applicable." That is the OPPOSITE
    // of the rule one county west, where Warren County's sheet says its fee
    // and Bowling Green's "cannot be charged on the same dollar earned, you
    // pay either/or based on where the work is being performed". Two
    // neighbouring counties, opposite rules: do not carry Bowling Green's
    // reasoning over to here, or this file's back to there. Florence's own
    // ordinance offers no credit against the county fee either - its only
    // credit clauses are for overpayments.
    //
    // This models a RESIDENT: the school board levy falls on residents of the
    // district, and selecting a city in a take-home calculator means living
    // and working there - the same premise the repo uses for NYC and Yonkers.
    //
    // Boone County's other two occupational-tax cities are deliberately NOT
    // modelled: Union's rate is 2% under ord. 2022-09 but its 2023 is split
    // exactly in half by a declared payroll tax holiday (Q1-Q2 at 0%), and
    // Walton's new 2% (from 2026-01-01) appears only on the county's site,
    // never the city's, and Walton straddles Boone and Kenton counties whose
    // county levies differ. Neither is a clean four-year read.
    //
    // Sources:
    // City rate and cap - https://web.sos.ky.gov/occupationaltax/ (Florence,
    //   ord. 0-27-07): "The amount of the license fee ... shall be equal to
    //   two percent (2.00%) of ... Compensation", and "The maximum
    //   Compensation upon which a person ... shall pay ... shall be ... the
    //   maximum income upon which Federal Social Security Tax is imposed".
    //   (The 0.1% some lists carry is Florence's separate gross-receipts
    //   business licence tax, minimum $40 / maximum $10,000.)
    // County levies, ordinance numbers and per-year caps -
    //   https://boonecountyky.org/services/occupational_licensing/tax_rates/index.php
    // Stacking rule -
    //   https://boonecountyky.org/services/occupational_licensing/about_us/city_of_walton_payroll_tax.php
    [FLORENCE]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [
          { min: 0, max: 16666, rate: 3.45 },
          { min: 16666, max: 79494, rate: 3.3 },
          { min: 79494, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0.5 },
        ],
        [MARRIED]: [
          { min: 0, max: 16666, rate: 3.45 },
          { min: 16666, max: 79494, rate: 3.3 },
          { min: 79494, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0.5 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 16666, rate: 3.45 },
          { min: 16666, max: 79494, rate: 3.3 },
          { min: 79494, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0.5 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 16666, rate: 3.45 },
          { min: 16666, max: 79494, rate: 3.3 },
          { min: 79494, max: 184500, rate: 2.5 },
          { min: 184500, max: INFINITY, rate: 0.5 },
        ],
      },
    },
    // Verified 2026-09-07: "For tax periods prior to January 1, 2023, the tax
    // is 1.49% of the gross compensation ... the tax is 1.65% of the gross
    // compensation paid." 1.65% is right for every year in this data set.
    // Source: https://www.hendersonky.gov/174/Occupational-License-Tax
    [HENDERSON]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 1.65 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 1.65 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 1.65 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 1.65 }],
      },
    },
    // Corrected 2026-09-07: was 1.75, a rate the city has not charged in any
    // year of this data set. "An Occupational License Fee is imposed on the
    // wages of those employees working within the city limits at the rate of
    // 1.95% of all salaries, wages, commissions and other compensation." The
    // figure is identical in Wayback snapshots of this page from 2023-02,
    // 2023-11 and 2025-03, so there is no mid-set change to model.
    // Source: https://www.frankfort.ky.gov/253/Licensing-Fees
    [FRANKFORT]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 1.95 }],
      },
    },
    // Verified 2026-09-07: 2%. Richmond's own finance pages were returning
    // 504s, so this is the Kentucky Secretary of State's occupational tax
    // register (KRS 67.766), Richmond entry, ordinance No. 12-30, which is
    // itself a filing by the city.
    // https://web.sos.ky.gov/occupationaltax/
    [RICHMOND]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.0 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.0 }],
      },
    },
    // Corrected 2026-09-07: was 1.35, the pre-2024 rate. Ordinance
    // No. 13-2023 raised it to 1.95% effective 2024-01-01 and it has not
    // changed since - the 2024 file already carried 1.95, so this year had
    // simply not been brought forward.
    // Source: https://www.elizabethtownky.org/government/departments/finance/business_licenses.php
    [ELIZABETHTOWN]: {
      [OCCUPATIONAL_TAX]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 1.95 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 1.95 }],
      },
    },
  },
} as TaxData;
