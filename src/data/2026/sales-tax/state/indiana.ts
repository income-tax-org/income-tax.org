import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Indiana Department of Revenue general sales and use tax rate of 7%,
// unchanged through 2025 and 2026; Indiana has no general local sales tax.
// Cross-checked with Tax Foundation 'State and Local Sales Tax Rates, 2026'
// (Jan 1 2026) and 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00%
// average local rate and no statewide rate change July 2025-July 2026. County
// and municipal food-and-beverage taxes and innkeeper taxes are
// special-purpose and excluded.
export default {
  [STATE_SALES_TAX]: 7,
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
    rate: 7,
    bands: [
      { min: 0, max: 20000, amounts: [408, 475, 520, 555, 584, 625] },
      { min: 20000, max: 30000, amounts: [564, 655, 716, 764, 804, 860] },
      { min: 30000, max: 40000, amounts: [640, 743, 812, 867, 912, 976] },
      { min: 40000, max: 50000, amounts: [704, 817, 894, 953, 1002, 1072] },
      { min: 50000, max: 60000, amounts: [759, 880, 964, 1028, 1082, 1157] },
      { min: 60000, max: 70000, amounts: [807, 937, 1026, 1094, 1151, 1231] },
      { min: 70000, max: 80000, amounts: [852, 989, 1082, 1154, 1214, 1298] },
      { min: 80000, max: 90000, amounts: [893, 1037, 1133, 1210, 1271, 1360] },
      { min: 90000, max: 100000, amounts: [930, 1081, 1181, 1260, 1325, 1418] },
      {
        min: 100000,
        max: 120000,
        amounts: [980, 1137, 1244, 1327, 1395, 1493],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1044, 1212, 1324, 1413, 1486, 1589],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1102, 1279, 1398, 1491, 1568, 1677],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1155, 1340, 1465, 1563, 1643, 1757],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1204, 1397, 1527, 1629, 1713, 1832],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1255, 1455, 1591, 1697, 1785, 1909],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1308, 1518, 1659, 1770, 1862, 1991],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1359, 1576, 1723, 1837, 1933, 2067],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1406, 1631, 1782, 1901, 2000, 2138],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1677, 1945, 2126, 2267, 2385, 2549],
      },
    ],
  },
} as SalesTaxData;
