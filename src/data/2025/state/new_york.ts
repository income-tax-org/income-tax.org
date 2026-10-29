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
      { min: 0, max: 8500, rate: 4 },
      { min: 8500, max: 11700, rate: 4.5 },
      { min: 11700, max: 13900, rate: 5.25 },
      { min: 13900, max: 80650, rate: 5.5 },
      { min: 80650, max: 215400, rate: 6 },
      { min: 215400, max: 1077550, rate: 6.85 },
      { min: 1077550, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [MARRIED]: [
      { min: 0, max: 17150, rate: 4 },
      { min: 17150, max: 23600, rate: 4.5 },
      { min: 23600, max: 27900, rate: 5.25 },
      { min: 27900, max: 161550, rate: 5.5 },
      { min: 161550, max: 323200, rate: 6 },
      { min: 323200, max: 2155350, rate: 6.85 },
      { min: 2155350, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 8500, rate: 4 },
      { min: 8500, max: 11700, rate: 4.5 },
      { min: 11700, max: 13900, rate: 5.25 },
      { min: 13900, max: 80650, rate: 5.5 },
      { min: 80650, max: 215400, rate: 6 },
      { min: 215400, max: 1077550, rate: 6.85 },
      { min: 1077550, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 12800, rate: 4 },
      { min: 12800, max: 17650, rate: 4.5 },
      { min: 17650, max: 20900, rate: 5.25 },
      { min: 20900, max: 107650, rate: 5.5 },
      { min: 107650, max: 269300, rate: 6 },
      { min: 269300, max: 1616450, rate: 6.85 },
      { min: 1616450, max: 5000000, rate: 9.65 },
      { min: 5000000, max: 25000000, rate: 10.3 },
      { min: 25000000, max: INFINITY, rate: 10.9 },
    ],
  },
  // 0.388% of wages up to the annualized NYSAWW of $91,373.88 (52 x
  // $1,757.19), for the published maximum contribution of $354.53. `max` has
  // to be an integer; 91373 is the one that lands on $354.53 exactly.
  [NY_PAID_FAMILY_LEAVE]: {
    [SINGLE]: [{ min: 0, max: 91373, rate: 0.388 }],
    [MARRIED]: [{ min: 0, max: 91373, rate: 0.388 }],
    [MARRIED_SEPARATELY]: [{ min: 0, max: 91373, rate: 0.388 }],
    [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: 91373, rate: 0.388 }],
  },
  // WCL §209(3)(a) caps the employee contribution for disability benefits at
  // "one-half of one per centum of the employee's wages ... but not in excess
  // of sixty cents per week": $31.20 a year, i.e. a $6,240 wage base. The cap
  // is statutory and has not moved since 1950, so it is the same every year.
  [NY_DISABILITY_INSURANCE]: {
    [ALL]: [{ min: 0, max: 6240, rate: 0.5 }],
  },
  // NYC resident income tax verified 2026-09-07 line by line against the
  // "New York City tax rate schedule" in the Form IT-201 instructions for
  // this year: 3.078 / 3.762 / 3.819 / 3.876%, breaking at 12,000-25,000-
  // 50,000 (single and married filing separately), 21,600-45,000-90,000
  // (joint), 14,400-30,000-60,000 (head of household). The schedule has
  // not moved in any of 2023-2026, so this was confirmed rather than
  // assumed.
  //     https://www.tax.ny.gov/pdf/2025/inc/it201i_2025.pdf
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
      // Source: 2025 Form IT-201-I, "Line 55: Yonkers resident income tax
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
