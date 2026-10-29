import { INFINITY, STATE_INCOME_TAX_BASIS } from "@/constants";
import { CITIES, NEW_YORK_CITY, YONKERS } from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  CITY_INCOME,
  NYC_INCOME,
  NY_DISABILITY_INSURANCE,
  NY_PAID_FAMILY_LEAVE,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 8000,
    [MARRIED]: 16050,
    [MARRIED_SEPARATELY]: 8000,
    [HEAD_OF_HOUSEHOLD]: 11200,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 8500, rate: 3.9 },
      { min: 8500, max: 11700, rate: 4.4 },
      { min: 11700, max: 13900, rate: 5.15 },
      { min: 13900, max: 80650, rate: 5.4 },
      { min: 80650, max: 215400, rate: 5.9 },
      { min: 215400, max: 1077550, rate: 6.85 },
      { min: 1077550, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 17150, rate: 3.9 },
      { min: 17150, max: 23600, rate: 4.4 },
      { min: 23600, max: 27900, rate: 5.15 },
      { min: 27900, max: 161550, rate: 5.4 },
      { min: 161550, max: 323200, rate: 5.9 },
      { min: 323200, max: 2155350, rate: 6.85 },
      { min: 2155350, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 8500, rate: 3.9 },
      { min: 8500, max: 11700, rate: 4.4 },
      { min: 11700, max: 13900, rate: 5.15 },
      { min: 13900, max: 80650, rate: 5.4 },
      { min: 80650, max: 215400, rate: 5.9 },
      { min: 215400, max: 1077550, rate: 6.85 },
      { min: 1077550, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 12800, rate: 3.9 },
      { min: 12800, max: 17650, rate: 4.4 },
      { min: 17650, max: 20900, rate: 5.15 },
      { min: 20900, max: 107650, rate: 5.4 },
      { min: 107650, max: 269300, rate: 5.9 },
      { min: 269300, max: 1616450, rate: 6.85 },
      { min: 1616450, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
  },
  [NY_PAID_FAMILY_LEAVE]: {
    [SINGLE]: [{ min: 0, max: 95349, rate: 0.432 }],
    [MARRIED]: [{ min: 0, max: 95349, rate: 0.432 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 95349, rate: 0.432 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 95349, rate: 0.432 }],
  },
  // WCL §209(3)(a) caps the employee contribution for disability benefits at
  // "one-half of one per centum of the employee's wages ... but not in excess
  // of sixty cents per week": $31.20 a year, i.e. a $6,240 wage base. The cap
  // is statutory and has not moved since 1950, so it is the same every year.
  [NY_DISABILITY_INSURANCE]: {
    [ALL]: [{ min: 0, max: 6240, rate: 0.5 }],
  },
  // NYC resident income tax verified 2026-09-07. No IT-201 instructions
  // exist for a tax year still running, so the source is the Tax
  // Department's own withholding notice for payrolls on or after
  // 2026-01-01: it revised the New York State and Yonkers tables for the
  // state rate cuts and then says outright, "There were no changes to the
  // New York City wage bracket tables and exact calculation methods."
  // So the 2025 schedule -- 3.078 / 3.762 / 3.819 / 3.876% at the same
  // breakpoints -- carries into 2026 unchanged.
  //     https://www.tax.ny.gov/bus/wt/rate.htm
  [CITIES]: {
    [NEW_YORK_CITY]: {
      [NYC_INCOME]: {
        [SINGLE]: [
          { min: 0, max: 12000, rate: 3.078 },
          { min: 12000, max: 25000, rate: 3.762 },
          { min: 25000, max: 50000, rate: 3.819 },
          { min: 50000, max: INFINITY, rate: 3.876 },
        ],
        [MARRIED]: [
          { min: 0, max: 21600, rate: 3.078 },
          { min: 21600, max: 45000, rate: 3.762 },
          { min: 45000, max: 90000, rate: 3.819 },
          { min: 90000, max: INFINITY, rate: 3.876 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 12000, rate: 3.078 },
          { min: 12000, max: 25000, rate: 3.762 },
          { min: 25000, max: 50000, rate: 3.819 },
          { min: 50000, max: INFINITY, rate: 3.876 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 14400, rate: 3.078 },
          { min: 14400, max: 30000, rate: 3.762 },
          { min: 30000, max: 60000, rate: 3.819 },
          { min: 60000, max: INFINITY, rate: 3.876 },
        ],
      },
    },
    [YONKERS]: {
      // A Yonkers RESIDENT pays a surcharge on New York State tax, not a rate
      // on income: IT-201 line 55, whose worksheet line n is "Yonkers resident
      // tax rate (16.75%)" applied to the state tax less credits. Anyone
      // picking a city in a take-home calculator is a resident -- the repo
      // already models New York City that way -- so this is the tax to charge.
      //
      // The file used to carry the Yonkers NON-RESIDENT earnings tax instead
      // (Form Y-203 line 6, "multiply line 5 by 0.5% (0.005)"). That
      // understated a resident by about 45%: $354 a year at $100,000 and $842
      // at $200,000, widening with income. It was wrong for the non-resident
      // reading too, since it charged the 0.5% on income after New York's
      // standard deduction while Y-203 charges gross Yonkers wages.
      //
      // Deliberately NOT written as an income schedule with the state's
      // breakpoints multiplied by 0.1675. That is exact for a filer with no
      // credits and it is a trap: it would copy the state's schedule into a
      // second place, so the next state rate change would go stale here, and
      // it would put bands at rates like 0.98825% on the tax-tables page that
      // appear in no published document. `basis: STATE_INCOME_TAX_BASIS`
      // charges the rate on whatever the state tax came to.
      //
      // MODELLED without credits: worksheet lines b to i subtract the college
      // tuition credit, the household credit and others before the 16.75%
      // applies, and the calculator models none of them, so this is the
      // surcharge on the full state tax.
      //
      // The non-resident tax also allows a $3,000 / $2,000 / $1,000 exclusion
      // that runs out at $30,000 of wages, so it is $0 at any income this app
      // is used at either way.
      //
      // Source: 2026 Form IT-201-I, "Line 55: Yonkers resident income tax
      // surcharge" and its worksheet; Publication NYS-50-T-Y confirms the same
      // 16.75% for withholding.
      [CITY_INCOME]: {
        [ALL]: [
          {
            min: 0,
            max: INFINITY,
            rate: 16.75,
            basis: STATE_INCOME_TAX_BASIS,
          },
        ],
      },
    },
  },
} as TaxData;
