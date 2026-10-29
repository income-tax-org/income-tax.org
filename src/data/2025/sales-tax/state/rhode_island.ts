import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Rhode Island Division of Taxation sales and use tax rate of 7% (tax.ri.gov
// sales & use tax page; 2025 and 2026 Summary of Legislative Changes),
// unchanged through 2025 and 2026; Rhode Island has no local sales tax.
// Cross-checked with Tax Foundation 'State and Local Sales Tax Rates, 2026'
// (Jan 1 2026) and 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00%
// average local rate and no statewide rate change July 2025-July 2026. The
// FY2026 budget added parking services to the base and the local hotel tax
// rose 1% to 2% on Jan 1 2026; the 1% local meals and beverage tax and hotel
// taxes are excluded as not general.
export default {
  [STATE_SALES_TAX]: 7,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0,
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 7,
    bands: [
      { min: 0, max: 20000, amounts: [370, 423, 460, 487, 511, 543] },
      { min: 20000, max: 30000, amounts: [507, 581, 630, 668, 699, 743] },
      { min: 30000, max: 40000, amounts: [575, 657, 713, 756, 791, 841] },
      { min: 40000, max: 50000, amounts: [631, 721, 782, 830, 868, 922] },
      { min: 50000, max: 60000, amounts: [678, 777, 842, 893, 935, 993] },
      { min: 60000, max: 70000, amounts: [722, 826, 896, 950, 994, 1056] },
      { min: 70000, max: 80000, amounts: [761, 870, 943, 1000, 1047, 1113] },
      { min: 80000, max: 90000, amounts: [796, 911, 988, 1047, 1096, 1165] },
      { min: 90000, max: 100000, amounts: [830, 949, 1029, 1091, 1142, 1213] },
      { min: 100000, max: 120000, amounts: [872, 998, 1083, 1148, 1200, 1276] },
      {
        min: 120000,
        max: 140000,
        amounts: [928, 1061, 1151, 1220, 1277, 1357],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [979, 1119, 1214, 1286, 1347, 1430],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1025, 1172, 1270, 1347, 1410, 1497],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1067, 1221, 1323, 1403, 1469, 1560],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1112, 1271, 1378, 1460, 1528, 1624],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1159, 1324, 1436, 1521, 1592, 1692],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1201, 1374, 1489, 1578, 1651, 1755],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1243, 1421, 1540, 1632, 1708, 1814],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1478, 1689, 1830, 1939, 2029, 2155],
      },
    ],
  },
} as SalesTaxData;
