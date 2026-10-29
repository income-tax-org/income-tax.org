import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Kentucky Department of Revenue general sales and use tax rate of 6%,
// unchanged through 2025 and 2026; Kentucky has no local sales tax.
// Cross-checked with Tax Foundation 'State and Local Sales Tax Rates, 2026'
// (Jan 1 2026) and 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00%
// average local rate and no statewide rate change July 2025-July 2026. 2026
// changes (HB 757, effective Aug 1 2026) broadened the base to data brokering
// services and changed nexus thresholds, not the rate. Local restaurant and
// transient room taxes are excluded.
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
      { min: 0, max: 20000, amounts: [388, 443, 479, 507, 530, 563] },
      { min: 20000, max: 30000, amounts: [537, 613, 664, 703, 734, 779] },
      { min: 30000, max: 40000, amounts: [610, 698, 755, 799, 836, 887] },
      { min: 40000, max: 50000, amounts: [672, 768, 831, 879, 920, 976] },
      { min: 50000, max: 60000, amounts: [726, 829, 898, 951, 993, 1054] },
      { min: 60000, max: 70000, amounts: [773, 884, 957, 1013, 1059, 1123] },
      { min: 70000, max: 80000, amounts: [817, 932, 1009, 1069, 1118, 1186] },
      { min: 80000, max: 90000, amounts: [856, 978, 1058, 1121, 1172, 1244] },
      { min: 90000, max: 100000, amounts: [893, 1020, 1104, 1169, 1223, 1297] },
      {
        min: 100000,
        max: 120000,
        amounts: [940, 1074, 1164, 1232, 1289, 1367],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1002, 1146, 1240, 1313, 1374, 1457],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1059, 1211, 1310, 1387, 1451, 1540],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1110, 1268, 1374, 1455, 1522, 1615],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1159, 1324, 1434, 1518, 1588, 1685],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1208, 1380, 1495, 1583, 1655, 1757],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1260, 1440, 1560, 1652, 1727, 1833],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1309, 1496, 1621, 1716, 1795, 1904],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1355, 1549, 1678, 1777, 1858, 1972],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1620, 1852, 2007, 2126, 2223, 2359],
      },
    ],
  },
} as SalesTaxData;
