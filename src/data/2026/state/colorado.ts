import { CITIES, INFINITY } from "@/constants";
import {
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
    [SINGLE]: 16100,
    [MARRIED]: 32200,
    [MARRIED_SEPARATELY]: 16100,
    [HEAD_OF_HOUSEHOLD]: 24150,
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
  // Employee half of the FAMLI premium, capped at the Social Security wage
  // base. Total premium is 0.88%, split evenly with the employer.
  [COLORADO_FAMLI]: {
    [ALL]: [
      { min: 0, max: 184500, rate: 0.44 },
      { min: 184500, max: INFINITY, rate: 0 },
    ],
  },
  // Aurora's occupational privilege tax was repealed effective 2025-01-01
  // (Ordinance 2022-77), so it is intentionally absent here.
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
  // Aurora's repeal re-confirmed against the same page: "The city of Aurora
  // Occupational Privilege Tax will be repealed effective Jan. 1, 2025."
  // Its absence here is correct, as is its presence in 2023 and 2024.
  //     https://www.auroragov.org/business_services/taxes/occupational_privilege_tax
  [CITIES]: {
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
