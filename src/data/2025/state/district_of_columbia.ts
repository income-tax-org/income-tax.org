import { INFINITY } from "@/constants";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  DC_PAID_FAMILY_LEAVE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // DC decoupled from the federal standard deduction for tax years
  // beginning on or after 2025-01-01 and set its own amounts, so these are
  // deliberately NOT the higher post-OBBBA federal figures.
  // Source: OTR 2025 D-40 booklet, "DC Basic Standard Deduction".
  // VERIFIED 2026-09-08. The booklet's "New for 2025 Income Tax Returns" says
  // "The District has established its own basic standard deduction amounts. For
  // tax year 2025, those amounts are: $15,000 for single filers, dependent
  // filers and married/registered domestic partner filers filing separately;
  // $22,500 for head of household filers; and $30,000 for married/registered
  // domestic partners filing jointly and qualifying widow(er) with dependent
  // child filers." Correct as stored, and correctly NOT the post-OBBBA federal
  // figures ($15,750 / $31,500 / $23,625).
  // https://otr.cfo.dc.gov/publication/2025-d-40-booklet
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 15000,
    [MARRIED]: 30000,
    [MARRIED_SEPARATELY]: 15000,
    [HEAD_OF_HOUSEHOLD]: 22500,
  },
  // VERIFIED 2026-09-08. DC's rate table is not indexed and does not vary by
  // filing status -- the booklet prints a single seven-band table with no
  // status columns -- and it has stood unchanged across all four years in this
  // repo. Correct as stored.
  // Cross-checked against OTR's own cumulative column, which reconciles only
  // with these boundaries:
  //    10,000 x 4%     = $400.00     -> $400      at the $10,000 floor
  //    30,000 x 6%     = $1,800.00   -> $2,200    at the $40,000 floor
  //    20,000 x 6.5%   = $1,300.00   -> $3,500    at the $60,000 floor
  //   190,000 x 8.5%   = $16,150.00  -> $19,650   at the $250,000 floor
  //   250,000 x 9.25%  = $23,125.00  -> $42,775   at the $500,000 floor
  //   500,000 x 9.75%  = $48,750.00  -> $91,525   at the $1,000,000 floor
  // every figure matching the printed "$X, plus Y% of the excess" column.
  // https://otr.cfo.dc.gov/publication/2025-d-40-booklet (2025 D-40 booklet,
  // Tax Rate Table)
  [STATE_INCOME]: {
    [ALL]: [
      { min: 0, max: 10000, rate: 4 },
      { min: 10000, max: 40000, rate: 6 },
      { min: 40000, max: 60000, rate: 6.5 },
      { min: 60000, max: 250000, rate: 8.5 },
      { min: 250000, max: 500000, rate: 9.25 },
      { min: 500000, max: 1000000, rate: 9.75 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
  },
  // VERIFIED 2026-09-08 -- rate and (absence of) cap are both right, but see
  // the incidence warning below.
  //
  // Rate: 0.75%. D.C. Code sec. 32-541.03(a) states it outright, and the Office
  // of Paid Family Leave's published quarterly rate table carries 0.75% for
  // every quarter of 2025 and 2026. It rose from 0.26% on 2024-07-01 (D.C. Act
  // 25-499), so 2023 sat at 0.26% all year and 2024 was split 0.26/0.26/0.75/
  // 0.75 by quarter -- which is why neither of those files carries this tax.
  //
  // Cap: none. The statute charges the rate against "the wages of each of its
  // covered employees" with no wage base, so max INFINITY is correct here --
  // unlike Hawaii's TDI in this same audit, this one really is uncapped.
  //
  // *** FLAGGED: THE EMPLOYEE DOES NOT PAY THIS. *** sec. 32-541.03(a) reads
  // "A covered employer shall contribute an amount equal to 0.75% of the wages
  // of each of its covered employees to the District", and the programme's own
  // site says DC Paid Family Leave "is only available to private-sector
  // employees whose employer pays the PFL tax". Nothing is withheld from the
  // worker. This is the Newark payroll-tax defect from the 2026-09-07 audit,
  // in a second place: charging it costs a DC filer $750/yr at $100,000.
  // The fix is to list DC_PAID_FAMILY_LEAVE in NON_WAGE_TAX_TYPES
  // (src/constants/tax-types.ts) so the tax tables still document it and the
  // calculator stops charging it. That file is outside this task's ownership,
  // so the change has been reported rather than made -- do not "fix" this by
  // deleting the entry, which would lose a real DC programme from the tables.
  // https://code.dccouncil.gov/us/dc/council/code/sections/32-541.03
  // https://dcpaidfamilyleave.dc.gov/employer-information/
  [DC_PAID_FAMILY_LEAVE]: {
    [ALL]: [{ min: 0, max: INFINITY, rate: 0.75 }],
  },
} as TaxData;
