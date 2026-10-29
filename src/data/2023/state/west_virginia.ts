import { INFINITY } from "@/constants";
import {
  CHARLESTON,
  CITIES,
  HUNTINGTON,
  MORGANTOWN,
  PARKERSBURG,
  WEIRTON,
  WHEELING,
} from "@/constants/cities";
import {
  ALL,
  HEAD_OF_HOUSEHOLD,
  MARRIED,
  MARRIED_SEPARATELY,
  SINGLE,
} from "@/constants/filing-status";
import {
  OCCUPATIONAL_PRIVILEGE_TAX,
  STATE_INCOME,
} from "@/constants/tax-types";
import type { TaxData } from "@/types";

export default {
  // HB 2526 (2023) cut every rate 21.25% retroactive to January 1, 2023,
  // taking the schedule from 3/4/4.5/6/6.5% down to these figures. WV prints
  // one schedule for single, head of household and married filing jointly
  // (Rate Schedule I) and a half-width one for married filing separately
  // (Rate Schedule II).
  // Verified against the 2023 Tax Rate Schedules, page 35 of the Personal
  // Income Tax Information and Instructions. The cumulative amounts
  // reconcile: $236.00 = 2.36% x $10,000; $708.50 = $236 + 3.15% x $15,000;
  // $1,239.50 = $708.50 + 3.54% x $15,000; $2,183.50 = $1,239.50 + 4.72% x
  // $20,000.
  // https://tax.wv.gov/Documents/PIT/2023/it140.TaxRateSchedules.2023.pdf
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10000, rate: 2.36 },
      { min: 10000, max: 25000, rate: 3.15 },
      { min: 25000, max: 40000, rate: 3.54 },
      { min: 40000, max: 60000, rate: 4.72 },
      { min: 60000, max: INFINITY, rate: 5.12 },
    ],
    [MARRIED]: [
      { min: 0, max: 10000, rate: 2.36 },
      { min: 10000, max: 25000, rate: 3.15 },
      { min: 25000, max: 40000, rate: 3.54 },
      { min: 40000, max: 60000, rate: 4.72 },
      { min: 60000, max: INFINITY, rate: 5.12 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 5000, rate: 2.36 },
      { min: 5000, max: 12500, rate: 3.15 },
      { min: 12500, max: 20000, rate: 3.54 },
      { min: 20000, max: 30000, rate: 4.72 },
      { min: 30000, max: INFINITY, rate: 5.12 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 10000, rate: 2.36 },
      { min: 10000, max: 25000, rate: 3.15 },
      { min: 25000, max: 40000, rate: 3.54 },
      { min: 40000, max: 60000, rate: 4.72 },
      { min: 60000, max: INFINITY, rate: 5.12 },
    ],
  },
  // City/local layer verified 2026-09-07 against each city's own published
  // fee document. All six are municipal service/user fees, charged per
  // calendar week worked in the city with no income threshold, and the
  // worksheets annualise them at 52 weeks a year ("the number of calendar
  // weeks ending in such calendar month, quarter, or year"), which is what
  // `frequency: "weekly"` does here.
  //   Charleston  $3.00 - City Service Fee Overview, rev. 12/2022
  //     https://www.charlestonwv.gov/sites/default/files/documents/2022-12/CITY%20SERVICE%20FEE%20OVERVIEW%2012.22%20%282%29.pdf
  //   Huntington  $5.00 - City Service Fee Return, Art. 772
  //     https://www.cityofhuntington.com/business/taxes-and-fees/city-service-fee/
  //   Parkersburg $2.50 - Understanding City Fees, Cod. Ord. 780.04
  //     https://www.parkersburgwv.gov/departments/finance/fees.php
  //   Wheeling    $2.00 - City Service Fee Overview + Employer Worksheet CSF-3
  //     https://www.wheelingwv.gov/departments/Finance/city-service-fee
  //   Morgantown  $3.00 - Safe Streets & Safe Community Fee
  //     https://www.morgantownwv.gov/310/Safe-Streets-Safe-Community
  //   Weirton     $2.00 - Municipal Service Fee, Ordinance 1417 (2004)
  //     https://cityofweirton.com/158/Municipal-Service-Fee
  [CITIES]: {
    [CHARLESTON]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 3,
            frequency: "weekly",
          },
        ],
      },
    },
    [HUNTINGTON]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 5,
            frequency: "weekly",
          },
        ],
      },
    },
    [PARKERSBURG]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 2.5,
            frequency: "weekly",
          },
        ],
      },
    },
    [WHEELING]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 2,
            frequency: "weekly",
          },
        ],
      },
    },
    [MORGANTOWN]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 3,
            frequency: "weekly",
          },
        ],
      },
    },
    [WEIRTON]: {
      [OCCUPATIONAL_PRIVILEGE_TAX]: {
        [ALL]: [
          {
            amount: 2,
            frequency: "weekly",
          },
        ],
      },
    },
  },
} as TaxData;
