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
    [SINGLE]: 3350,
    [MARRIED]: 6700,
    [MARRIED_SEPARATELY]: 3350,
    [HEAD_OF_HOUSEHOLD]: 6700,
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
      { min: 250000, max: 500000, rate: 5.75 },
      { min: 500000, max: 1000000, rate: 6.25 },
      { min: 1000000, max: INFINITY, rate: 6.5 },
    ],
    [MARRIED]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 150000, rate: 4.75 },
      { min: 150000, max: 175000, rate: 5 },
      { min: 175000, max: 225000, rate: 5.25 },
      { min: 225000, max: 300000, rate: 5.5 },
      { min: 300000, max: 600000, rate: 5.75 },
      { min: 600000, max: 1200000, rate: 6.25 },
      { min: 1200000, max: INFINITY, rate: 6.5 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 100000, rate: 4.75 },
      { min: 100000, max: 125000, rate: 5 },
      { min: 125000, max: 150000, rate: 5.25 },
      { min: 150000, max: 250000, rate: 5.5 },
      { min: 250000, max: 500000, rate: 5.75 },
      { min: 500000, max: 1000000, rate: 6.25 },
      { min: 1000000, max: INFINITY, rate: 6.5 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 1000, rate: 2 },
      { min: 1000, max: 2000, rate: 3 },
      { min: 2000, max: 3000, rate: 4 },
      { min: 3000, max: 150000, rate: 4.75 },
      { min: 150000, max: 175000, rate: 5 },
      { min: 175000, max: 225000, rate: 5.25 },
      { min: 225000, max: 300000, rate: 5.5 },
      { min: 300000, max: 600000, rate: 5.75 },
      { min: 600000, max: 1200000, rate: 6.25 },
      { min: 1200000, max: INFINITY, rate: 6.5 },
    ],
  },
  // All 24 local rates (23 counties + Baltimore City) verified 2026-09 against
  // Withholding Tax Facts 2026 (COM RAD 098 rev 12/25,
  // marylandcomptroller.gov/content/dam/mdcomp/tax/legal-publications/facts/
  // withholding-tax-facts-2026.pdf) and the 2026 state payroll memo
  // (.../md/state-payroll/memos/2026/2026-maryland-state-and-local-withholding
  // -information.pdf). Both agree.
  //
  // Two counties changed for 2026: Allegany .0303 -> .0320 and Kent .0320 ->
  // .0330. All 22 flat rates in this file were already correct; only Anne
  // Arundel and Frederick needed fixing (they were flat and are graduated).
  [CITIES]: {
    [ALLEGANY_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [ANNE_ARUNDEL_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2026 (COM RAD 098 rev 12/25) and the 2026 state
        // payroll memo. The file had a flat 2.81 — both the wrong shape and a
        // rate Anne Arundel left after 2024. Marginal, same as 2025.
        [SINGLE]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: 400000, rate: 2.94 },
          { min: 400000, max: INFINITY, rate: 3.2 },
        ],
        [MARRIED]: [
          { min: 0, max: 75000, rate: 2.7 },
          { min: 75000, max: 480000, rate: 2.94 },
          { min: 480000, max: INFINITY, rate: 3.2 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: 400000, rate: 2.94 },
          { min: 400000, max: INFINITY, rate: 3.2 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 75000, rate: 2.7 },
          { min: 75000, max: 480000, rate: 2.94 },
          { min: 480000, max: INFINITY, rate: 3.2 },
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
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
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
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.74 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.74 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.74 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.74 }],
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
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.3 }],
      },
    },
    [FREDERICK_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2026 (COM RAD 098 rev 12/25) and the 2026 state
        // payroll memo. Same schedule as 2025; the file had a flat 2.96.
        //
        // Frederick SELECTS one rate by income and charges it on the whole
        // taxable net income — the statute reads ".0225 FOR TAXPAYERS WHO HAVE a
        // taxable net income of at least $1 and not exceeding $25,000", with no
        // "plus $X" base amount, and Form 502's LOCAL TAX WORKSHEET (19A) says to
        // "Multiply the taxable net income by your local tax rate". Anne Arundel is
        // carved out of that worksheet and Frederick is not. Hence rate_on_total.
        [SINGLE]: [
          { min: 0, max: 25000, rate: 2.25, rate_on_total: true },
          { min: 25000, max: 50000, rate: 2.75, rate_on_total: true },
          { min: 50000, max: 150000, rate: 2.96, rate_on_total: true },
          { min: 150000, max: INFINITY, rate: 3.2, rate_on_total: true },
        ],
        [MARRIED]: [
          { min: 0, max: 25000, rate: 2.25, rate_on_total: true },
          { min: 25000, max: 100000, rate: 2.75, rate_on_total: true },
          { min: 100000, max: 250000, rate: 2.96, rate_on_total: true },
          { min: 250000, max: INFINITY, rate: 3.2, rate_on_total: true },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 25000, rate: 2.25, rate_on_total: true },
          { min: 25000, max: 50000, rate: 2.75, rate_on_total: true },
          { min: 50000, max: 150000, rate: 2.96, rate_on_total: true },
          { min: 150000, max: INFINITY, rate: 3.2, rate_on_total: true },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 25000, rate: 2.25, rate_on_total: true },
          { min: 25000, max: 100000, rate: 2.75, rate_on_total: true },
          { min: 100000, max: 250000, rate: 2.96, rate_on_total: true },
          { min: 250000, max: INFINITY, rate: 3.2, rate_on_total: true },
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
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.3 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.3 }],
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
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
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
