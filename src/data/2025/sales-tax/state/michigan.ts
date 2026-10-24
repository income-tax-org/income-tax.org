import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Michigan Department of Treasury sales and use tax rate of 6%, unchanged
// through 2025 and 2026 (fixed by the state constitution); Michigan has no
// local sales tax. Cross-checked with Tax Foundation 'State and Local Sales
// Tax Rates, 2026' (Jan 1 2026) and 'Midyear 2026' (Jul 1 2026) tables, both
// showing a 0.00% average local rate and no statewide rate change July
// 2025-July 2026. Proposals to extend the tax to services had not been
// enacted.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0,
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [342, 392, 427, 453, 474, 505] },
      { min: 20000, max: 30000, amounts: [470, 540, 587, 624, 653, 696] },
      { min: 30000, max: 40000, amounts: [533, 612, 666, 707, 741, 789] },
      { min: 40000, max: 50000, amounts: [586, 673, 731, 777, 814, 867] },
      { min: 50000, max: 60000, amounts: [632, 726, 789, 838, 878, 935] },
      { min: 60000, max: 70000, amounts: [672, 773, 840, 892, 934, 995] },
      { min: 70000, max: 80000, amounts: [709, 814, 886, 940, 986, 1049] },
      { min: 80000, max: 90000, amounts: [742, 853, 927, 985, 1033, 1099] },
      { min: 90000, max: 100000, amounts: [774, 890, 967, 1027, 1075, 1146] },
      { min: 100000, max: 120000, amounts: [816, 936, 1018, 1081, 1133, 1206] },
      { min: 120000, max: 140000, amounts: [867, 996, 1084, 1151, 1206, 1284] },
      {
        min: 140000,
        max: 160000,
        amounts: [915, 1052, 1144, 1214, 1273, 1355],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [959, 1102, 1197, 1271, 1333, 1420],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [999, 1149, 1248, 1326, 1390, 1480],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1042, 1196, 1301, 1381, 1448, 1542],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1086, 1247, 1356, 1440, 1510, 1608],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1127, 1295, 1408, 1495, 1567, 1669],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1166, 1340, 1456, 1547, 1622, 1726],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1389, 1596, 1736, 1843, 1933, 2058],
      },
    ],
  },
} as SalesTaxData;
