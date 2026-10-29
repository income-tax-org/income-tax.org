import { CITIES, INFINITY } from "@/constants";
import {
  AURORA,
  DENVER,
  GLENDALE,
  GREENWOOD_VILLAGE,
  SHERIDAN,
} from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  COLORADO_FAMLI,
  OCCUPATIONAL_PRIVILEGE_TAX,
  STANDARD_DEDUCTION,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // Colorado taxes federal taxable income (C.R.S. 39-22-104), so the federal
  // standard deduction flows through; Colorado has none of its own.
  [STANDARD_DEDUCTION]: {
    [SINGLE]: 13850,
    [MARRIED]: 27700,
    [MARRIED_SEPARATELY]: 13850,
    [HEAD_OF_HOUSEHOLD]: 20800,
  },
  [STATE_INCOME]: {
    [ALL]: [
      {
        min: 0,
        max: INFINITY,
        rate: 4.4,
      },
    ],
  },
  [COLORADO_FAMLI]: {
    [ALL]: [
      {
        min: 0,
        max: 160200,
        rate: 0.45,
      },
    ],
  },
  // Occupational privilege taxes verified 2026-09-07 against each city's own
  // page. These model the employee half only; every one of these cities also
  // charges the employer a separate matching fee. `min` is the city's monthly
  // earnings test annualised (Denver's $500/month is 6,000/yr, and so on).
  //   Denver            $5.75/mo at $500/mo - Tax Guide Topic 61
  //     https://www.denvergov.org/content/dam/denvergov/Portals/571/documents/TaxGuide/TaxGuideTopic61_OccupationalPrivilegeTaxes.pdf
  //   Glendale          $5.00/mo at $750/mo
  //     https://www.glendale.co.us/355/Occupational-Privilege-Tax
  //   Greenwood Village $2.00/mo at $250/mo
  //     https://www.greenwoodvillage.com/1220/Occupational-Privilege-Tax-OPT
  //   Sheridan          $3.00/mo, no earnings test published
  //     https://www.ci.sheridan.co.us/288/Occupational-Privilege-Tax
  //   Aurora            $2.00/mo at $250/mo, still in force this year
  //     https://www.auroragov.org/business_services/taxes/occupational_privilege_tax
  [CITIES]: {
    [AURORA]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 2,
            frequency: "monthly",
            min: 3000,
          },
        ],
      },
    },
    [DENVER]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 5.75,
            frequency: "monthly",
            min: 6000,
          },
        ],
      },
    },
    [GLENDALE]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 5,
            frequency: "monthly",
            min: 9000,
          },
        ],
      },
    },
    [GREENWOOD_VILLAGE]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 2,
            frequency: "monthly",
            min: 3000,
          },
        ],
      },
    },
    [SHERIDAN]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 3,
            frequency: "monthly",
          },
        ],
      },
    },
  },
} as TaxData;
