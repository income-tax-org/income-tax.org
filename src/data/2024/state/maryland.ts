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
    [SINGLE]: 2600,
    [MARRIED]: 5200,
    [MARRIED_SEPARATELY]: 2600,
    [HEAD_OF_HOUSEHOLD]: 5200,
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
  // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24,
  // marylandcomptroller.gov/content/dam/mdcomp/tax/legal-publications/facts/
  // Withholding-Tax-Facts-2024.pdf) and independently against the LOCAL TAX
  // RATE CHART in the 2024 Form 502 resident booklet.
  //
  // 15 of the 24 were wrong — this file had been populated with Maryland rates
  // from roughly a decade earlier (Worcester 1.25, which it left in 2016;
  // Baltimore County 2.83; Caroline 2.63; Dorchester 2.62; Kent and Queen
  // Anne's 2.85). Every one is corrected below against both sources.
  [CITIES]: {
    [ALLEGANY_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 3.05, Maryland's pre-2023 rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [ANNE_ARUNDEL_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 and the 2024 Form 502 LOCAL TAX WORKSHEET
        // (19A). Genuinely marginal, and the worksheet proves it: "$1,350 plus
        // 2.81% of the filer's taxable net income over $50,000" — $1,350 is
        // 2.7% x $50,000. Verified 2026-09.
        [SINGLE]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: 400000, rate: 2.81 },
          { min: 400000, max: INFINITY, rate: 3.2 },
        ],
        [MARRIED]: [
          { min: 0, max: 75000, rate: 2.7 },
          { min: 75000, max: 480000, rate: 2.81 },
          { min: 480000, max: INFINITY, rate: 3.2 },
        ],
        [MARRIED_SEPARATELY]: [
          { min: 0, max: 50000, rate: 2.7 },
          { min: 50000, max: 400000, rate: 2.81 },
          { min: 400000, max: INFINITY, rate: 3.2 },
        ],
        [HEAD_OF_HOUSEHOLD]: [
          { min: 0, max: 75000, rate: 2.7 },
          { min: 75000, max: 480000, rate: 2.81 },
          { min: 480000, max: INFINITY, rate: 3.2 },
        ],
      },
    },
    [BALTIMORE_CITY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 3.05, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [BALTIMORE_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.83, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [CALVERT_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.8; Calvert was .0300 in 2023 and 2024.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3 }],
      },
    },
    [CAROLINE_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.63, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [CARROLL_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 3.05, Maryland's pre-2023 rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [CECIL_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.75 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.75 }],
      },
    },
    [CHARLES_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.9, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.03 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.03 }],
      },
    },
    [DORCHESTER_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.62, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [FREDERICK_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 and the 2024 Form 502 LOCAL TAX RATE CHART.
        // Frederick brackets by filing status from 2024 on.
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
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.85, a long-superseded rate.
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
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.85, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [SAINT_MARYS_COUNTY]: {
      [COUNTY_INCOME]: {
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.0 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.0 }],
      },
    },
    [SOMERSET_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 3.15, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [TALBOT_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.25; Talbot has been .0240 since well before 2023.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.4 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.4 }],
      },
    },
    [WASHINGTON_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 2.8; Washington has been .0295 since TY2023.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.95 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.95 }],
      },
    },
    [WICOMICO_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 3.1, a long-superseded rate.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 3.2 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 3.2 }],
      },
    },
    [WORCESTER_COUNTY]: {
      [COUNTY_INCOME]: {
        // Withholding Tax Facts 2024 (COM RAD 098 rev 03/24) / 2024 Form 502 LOCAL TAX RATE CHART: was 1.25, a rate Worcester left in 2016.
        [SINGLE]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [MARRIED]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [MARRIED_SEPARATELY]: [{ min: 0, max: INFINITY, rate: 2.25 }],
        [HEAD_OF_HOUSEHOLD]: [{ min: 0, max: INFINITY, rate: 2.25 }],
      },
    },
  },
} as TaxData;
