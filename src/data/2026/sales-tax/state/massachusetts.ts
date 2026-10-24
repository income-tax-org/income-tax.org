import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Massachusetts Department of Revenue sales and use tax rate of 6.25%,
// unchanged through 2025 and 2026; Massachusetts has no local general sales
// tax. Cross-checked with Tax Foundation 'State and Local Sales Tax Rates,
// 2026' (Jan 1 2026) and 'Midyear 2026' (Jul 1 2026) tables, both showing a
// 0.00% average local rate and no statewide rate change July 2025-July 2026.
// Local-option meals taxes (up to 0.75%) and room occupancy taxes are
// excluded as not general. A citizen initiative to cut the rate to 5% did not
// reach the November 2026 ballot (Ballotpedia).
export default {
  [STATE_SALES_TAX]: 6.25,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.25,
    bands: [
      { min: 0, max: 20000, amounts: [318, 362, 390, 412, 431, 457] },
      { min: 20000, max: 30000, amounts: [432, 491, 529, 560, 585, 619] },
      { min: 30000, max: 40000, amounts: [486, 552, 597, 631, 659, 699] },
      { min: 40000, max: 50000, amounts: [532, 605, 653, 691, 721, 765] },
      { min: 50000, max: 60000, amounts: [572, 650, 702, 742, 775, 822] },
      { min: 60000, max: 70000, amounts: [607, 690, 744, 787, 823, 871] },
      { min: 70000, max: 80000, amounts: [639, 726, 784, 829, 865, 917] },
      { min: 80000, max: 90000, amounts: [668, 759, 820, 866, 905, 959] },
      { min: 90000, max: 100000, amounts: [695, 789, 852, 901, 941, 997] },
      { min: 100000, max: 120000, amounts: [730, 829, 896, 947, 988, 1047] },
      { min: 120000, max: 140000, amounts: [775, 879, 951, 1004, 1049, 1112] },
      { min: 140000, max: 160000, amounts: [816, 926, 1000, 1057, 1105, 1170] },
      { min: 160000, max: 180000, amounts: [853, 969, 1046, 1106, 1155, 1224] },
      {
        min: 180000,
        max: 200000,
        amounts: [888, 1007, 1089, 1151, 1201, 1273],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [923, 1048, 1131, 1196, 1249, 1324],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [961, 1091, 1178, 1245, 1300, 1377],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [995, 1130, 1221, 1290, 1348, 1428],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1028, 1168, 1260, 1332, 1391, 1475],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1216, 1380, 1491, 1575, 1645, 1743],
      },
    ],
  },
} as SalesTaxData;
