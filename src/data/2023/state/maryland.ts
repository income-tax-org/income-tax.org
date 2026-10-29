import { INFINITY } from "@/constants";
import {
  ALLEGANY_COUNTY,
  ANNE_ARUNDEL_COUNTY,
  BALTIMORE_CITY,
  BALTIMORE_COUNTY,
  CALVERT_COUNTY,
  CAROLINE_COUNTY,
  CARROLL_COUNTY,
  CECIL_COUNTY,
  CHARLES_COUNTY,
  CITIES,
  DORCHESTER_COUNTY,
  FREDERICK_COUNTY,
  GARRETT_COUNTY,
  HARFORD_COUNTY,
  HOWARD_COUNTY,
  KENT_COUNTY,
  MONTGOMERY_COUNTY,
  PRINCE_GEORGES_COUNTY,
  QUEEN_ANNES_COUNTY,
  SAINT_MARYS_COUNTY,
  SOMERSET_COUNTY,
  TALBOT_COUNTY,
  WASHINGTON_COUNTY,
  WICOMICO_COUNTY,
  WORCESTER_COUNTY,
} from "@/constants/cities";
import {
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  COUNTY_INCOME,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 2550,
    [MARRIED]: 5100,
    [MARRIED_SEPARATELY]: 2550,
    [HEAD_OF_HOUSEHOLD]: 5100,
  },
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 100000, rate: 4.75 },
      { min: 100000, max: 125000, rate: 5 },
      { min: 125000, max: 150000, rate: 5.25 },
      { min: 150000, max: 250000, rate: 5.5 },
      { min: 250000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 150000, rate: 4.75 },
      { min: 150000, max: 175000, rate: 5 },
      { min: 175000, max: 225000, rate: 5.25 },
      { min: 225000, max: 300000, rate: 5.5 },
      { min: 300000, max: INFINITY, rate: 5.75 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 100000, rate: 4.75 },
      { min: 100000, max: 125000, rate: 5 },
      { min: 125000, max: 150000, rate: 5.25 },
      { min: 150000, max: 250000, rate: 5.5 },
      { min: 250000, max: INFINITY, rate: 5.75 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 150000, rate: 4.75 },
      { min: 150000, max: 175000, rate: 5 },
      { min: 175000, max: 225000, rate: 5.25 },
      { min: 225000, max: 300000, rate: 5.5 },
      { min: 300000, max: INFINITY, rate: 5.75 },
    ],
  },
  // All 24 local rates (23 counties + Baltimore City) verified 2026-09 against
  // the Comptroller's "Local Tax Rates" chart, TY2023 column (Wayback
  // 20241002203204 and 20231129125838 of
  // marylandtaxes.gov/individual/credits-deductions/local-countytax-rates.php),
  // cross-checked against the 2023 Maryland Employer Withholding Guide.
  // Three were the county's 2022 rate rather than its 2023 rate; fixed below.
  [CITIES]: {
    [ALLEGANY_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [ANNE_ARUNDEL_COUNTY]: {
      [COUNTY_INCOME]: {
        // Comptroller "Local Tax Rates" chart, TY2023 note: ".0270 of an
        // individual's Maryland taxable income of $1 through $50,000; and .0281
        // of ... income in excess of $50,000." Same for every filing status in
        // 2023 — the status split starts in 2024. Verified 2026-09.
        [SINGLE]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: INFINITY, rate: 2.81 },
        ],
        [MARRIED]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: INFINITY, rate: 2.81 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: INFINITY, rate: 2.81 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: INFINITY, rate: 2.81 },
        ],
      },
    },
    [BALTIMORE_CITY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [BALTIMORE_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [CALVERT_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    [CAROLINE_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [CARROLL_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [CECIL_COUNTY]: {
      [COUNTY_INCOME]: {
        // Comptroller "Local Tax Rates" chart, TY2023 column: lowered to .0280 for TY2023 (.0300 in 2022); file had the 2022 rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.8 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.8 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.8 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.8 }],
      },
    },
    [CHARLES_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [DORCHESTER_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [FREDERICK_COUNTY]: {
      [COUNTY_INCOME]: {
        // Comptroller "Local Tax Rates" chart, TY2023 note, and the 2023
        // Employer Withholding Guide: ".0275 for taxpayers with Maryland taxable
        // income of $100,000 or less and a filing status of married filing joint,
        // head of household, and qualifying widow(er)...; .0275 for taxpayers with
        // ... $50,000 or less and a filing status of single, married filing
        // separately, and dependent; and .0296 for ALL OTHER TAXPAYERS."
        // That last clause is a rate lookup, not a bracket — see rate_on_total.
        //
        // Frederick SELECTS one rate by income and charges it on the whole
        // taxable net income — the statute reads ".0225 FOR TAXPAYERS WHO HAVE a
        // taxable net income of at least $1 and not exceeding $25,000", with no
        // "plus $X" base amount, and Form 502's LOCAL TAX WORKSHEET (19A) says to
        // "Multiply the taxable net income by your local tax rate". Anne Arundel is
        // carved out of that worksheet and Frederick is not. Hence rate_on_total.
        [SINGLE]: [
          { min: 0, max: 50000, rate: 2.75, rate_on_total: true },
          { min: 50000, max: INFINITY, rate: 2.96, rate_on_total: true },
        ],
        [MARRIED]: [
          { min: 0, max: 100000, rate: 2.75, rate_on_total: true },
          { min: 100000, max: INFINITY, rate: 2.96, rate_on_total: true },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 50000, rate: 2.75, rate_on_total: true },
          { min: 50000, max: INFINITY, rate: 2.96, rate_on_total: true },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 100000, rate: 2.75, rate_on_total: true },
          { min: 100000, max: INFINITY, rate: 2.96, rate_on_total: true },
        ],
      },
    },
    [GARRETT_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.65 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.65 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.65 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.65 }],
      },
    },
    [HARFORD_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.06 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.06 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.06 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.06 }],
      },
    },
    [HOWARD_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [KENT_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [MONTGOMERY_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [PRINCE_GEORGES_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [QUEEN_ANNES_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [SAINT_MARYS_COUNTY]: {
      [COUNTY_INCOME]: {
        // Comptroller "Local Tax Rates" chart, TY2023 column: lowered to .0300 for TY2023 (.0310 in 2022); file had the 2022 rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3 }],
      },
    },
    [SOMERSET_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [TALBOT_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.4 }],
      },
    },
    [WASHINGTON_COUNTY]: {
      [COUNTY_INCOME]: {
        // Comptroller "Local Tax Rates" chart, TY2023 column: lowered to .0295 for TY2023 (.0300 in 2022); file had the 2022 rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.95 }],
      },
    },
    [WICOMICO_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [WORCESTER_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.25 }],
      },
    },
  },
} as TaxData;
