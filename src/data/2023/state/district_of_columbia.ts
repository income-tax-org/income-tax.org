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
  // DC used the federal standard deduction through tax year 2024; it
  // decoupled only from 2025 on. These are the federal 2023 amounts.
  // Source: OTR 2023 D-40 booklet.
  // VERIFIED 2026-09-08 twice over: the 2023 D-40ES worksheet Line 2b prints
  // "$13,850 if single, married/registered domestic partners filing separately
  // or a dependent ... $20,800 if head of household ... $27,700 if
  // married/registered domestic partner filing jointly", and the 2024 booklet
  // records the change as "from $13,850 to $14,600 ... $20,800 to $21,900 ...
  // $27,700 to $29,200". Correct as stored.
  // https://otr.cfo.dc.gov/sites/default/files/dc/sites/otr/publication/attachments/2023_D-40ES_Booklet_Final_03062023.pdf
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
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
  // https://otr.cfo.dc.gov/sites/default/files/dc/sites/otr/publication/attachments/2023_D-40ES_Booklet_Final_03062023.pdf
  // (2023 D-40ES, Tax Rate Table)
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10000, rate: 4 },
      { min: 10000, max: 40000, rate: 6 },
      { min: 40000, max: 60000, rate: 6.5 },
      { min: 60000, max: 250000, rate: 8.5 },
      { min: 250000, max: 500000, rate: 9.25 },
      { min: 500000, max: 1000000, rate: 9.75 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 10000, rate: 4 },
      { min: 10000, max: 40000, rate: 6 },
      { min: 40000, max: 60000, rate: 6.5 },
      { min: 60000, max: 250000, rate: 8.5 },
      { min: 250000, max: 500000, rate: 9.25 },
      { min: 500000, max: 1000000, rate: 9.75 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 10000, rate: 4 },
      { min: 10000, max: 40000, rate: 6 },
      { min: 40000, max: 60000, rate: 6.5 },
      { min: 60000, max: 250000, rate: 8.5 },
      { min: 250000, max: 500000, rate: 9.25 },
      { min: 500000, max: 1000000, rate: 9.75 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 10000, rate: 4 },
      { min: 10000, max: 40000, rate: 6 },
      { min: 40000, max: 60000, rate: 6.5 },
      { min: 60000, max: 250000, rate: 8.5 },
      { min: 250000, max: 500000, rate: 9.25 },
      { min: 500000, max: 1000000, rate: 9.75 },
      { min: 1000000, max: INFINITY, rate: 10.75 },
    ],
  },
} as TaxData;
