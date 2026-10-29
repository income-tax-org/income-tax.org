import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Comptroller of Maryland 6% sales and use tax rate chart
// (marylandcomptroller.gov Tax_rate_chart.pdf) and Tax Alert 'Sales and Use
// Tax Updates 2025-2026': the general rate stayed 6% through 2025 and 2026;
// Maryland has no local sales tax. Cross-checked with Tax Foundation 'State
// and Local Sales Tax Rates, 2026' (Jan 1 2026) and 'Midyear 2026' (Jul 1
// 2026) tables, both showing a 0.00% average local rate and no statewide rate
// change July 2025-July 2026. The BRFA of 2025 (effective July 1 2025) added
// a separate 3% rate on certain data/IT services and raised the cannabis
// rate, neither a change to the general rate; the 9% alcoholic beverage and
// 12% cannabis rates are excluded.
export default {
  [STATE_SALES_TAX]: 6,
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
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [301, 350, 386, 413, 436, 469] },
      { min: 20000, max: 30000, amounts: [413, 481, 529, 567, 598, 643] },
      { min: 30000, max: 40000, amounts: [468, 545, 599, 642, 677, 727] },
      { min: 40000, max: 50000, amounts: [515, 599, 658, 704, 743, 798] },
      { min: 50000, max: 60000, amounts: [555, 646, 709, 759, 800, 860] },
      { min: 60000, max: 70000, amounts: [590, 687, 754, 806, 851, 914] },
      { min: 70000, max: 80000, amounts: [623, 724, 794, 850, 897, 964] },
      { min: 80000, max: 90000, amounts: [652, 759, 832, 891, 939, 1008] },
      { min: 90000, max: 100000, amounts: [679, 790, 866, 927, 978, 1051] },
      { min: 100000, max: 120000, amounts: [715, 832, 912, 976, 1030, 1106] },
      { min: 120000, max: 140000, amounts: [761, 885, 970, 1038, 1095, 1176] },
      { min: 140000, max: 160000, amounts: [803, 933, 1024, 1095, 1155, 1240] },
      { min: 160000, max: 180000, amounts: [841, 977, 1071, 1147, 1210, 1298] },
      {
        min: 180000,
        max: 200000,
        amounts: [877, 1019, 1117, 1194, 1260, 1353],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [914, 1061, 1164, 1244, 1312, 1409],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [953, 1106, 1213, 1297, 1367, 1467],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [988, 1148, 1258, 1346, 1419, 1522],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1023, 1187, 1301, 1391, 1467, 1575],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1219, 1414, 1549, 1655, 1745, 1873],
      },
    ],
  },
} as SalesTaxData;
