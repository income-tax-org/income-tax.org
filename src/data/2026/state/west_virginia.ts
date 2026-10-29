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
  // SB 392 (2026 session), signed March 31, 2026, cut every rate a further 5%
  // retroactive to January 1, 2026 (W. Va. Code 11-21-4j).
  // Verified against the Tax Division's published 2026 schedule. The
  // cumulative amounts reconcile: $211.00 = 2.11% x $10,000; $632.50 = $211 +
  // 2.81% x $15,000; $1,106.50 = $632.50 + 3.16% x $15,000; $1,950.50 =
  // $1,106.50 + 4.22% x $20,000.
  // https://tax.wv.gov/Individuals/Pages/PersonalIncomeTaxReductionBill.aspx
  [STATE_INCOME]: {
    [SINGLE]: [
      { min: 0, max: 10000, rate: 2.11 },
      { min: 10000, max: 25000, rate: 2.81 },
      { min: 25000, max: 40000, rate: 3.16 },
      { min: 40000, max: 60000, rate: 4.22 },
      { min: 60000, max: INFINITY, rate: 4.58 },
    ],
    [MARRIED]: [
      { min: 0, max: 10000, rate: 2.11 },
      { min: 10000, max: 25000, rate: 2.81 },
      { min: 25000, max: 40000, rate: 3.16 },
      { min: 40000, max: 60000, rate: 4.22 },
      { min: 60000, max: INFINITY, rate: 4.58 },
    ],
    [MARRIED_SEPARATELY]: [
      { min: 0, max: 5000, rate: 2.11 },
      { min: 5000, max: 12500, rate: 2.81 },
      { min: 12500, max: 20000, rate: 3.16 },
      { min: 20000, max: 30000, rate: 4.22 },
      { min: 30000, max: INFINITY, rate: 4.58 },
    ],
    [HEAD_OF_HOUSEHOLD]: [
      { min: 0, max: 10000, rate: 2.11 },
      { min: 10000, max: 25000, rate: 2.81 },
      { min: 25000, max: 40000, rate: 3.16 },
      { min: 40000, max: 60000, rate: 4.22 },
      { min: 60000, max: INFINITY, rate: 4.58 },
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
  //   Weirton     changed mid-2026; see the note on its schedule below.
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
          // Corrected 2026-09-07. Ordinance 2272 amended Ordinance 1417 and
          // raised the Municipal Service Fee from $2.00 to $5.00 per calendar
          // week -- second reading April 13, 2026, effective the 30th day
          // after passage. The City's Administrative Regulations pin the
          // changeover: "$2.00 per week from April 1, 2026 through May 16,
          // 2026 and five dollars ($5.00) per week for the period May 17,
          // 2026 through June 30, 2026 and all periods thereafter."
          // 52 calendar weeks end in 2026 and May 16 is a Saturday, so the
          // split falls on a week boundary and is exact: 20 weeks at $2.00
          // plus 32 weeks at $5.00 = $200.00 for the year. Written as an
          // annual amount because no single weekly figure is right for 2026;
          // 2027 onward is a plain { amount: 5, frequency: "weekly" }.
          // https://cityofweirton.com/DocumentCenter/View/3819/Municipal-Service-Fee-Ordinance-No-2272-PDF
          // https://cityofweirton.com/DocumentCenter/View/68/Municipal-Service-Fee-Administrative-Regulations-PDF
          {
            amount: 200,
          },
        ],
      },
    },
  },
} as TaxData;
