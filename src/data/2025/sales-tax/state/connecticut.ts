import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Connecticut Department of Revenue Services (portal.ct.gov/drs) general
// sales and use tax rate of 6.35%, unchanged through 2025 and 2026;
// Connecticut has no local sales tax. Cross-checked with Tax Foundation
// 'State and Local Sales Tax Rates, 2026' (Jan 1 2026) and 'Midyear 2026'
// (Jul 1 2026) tables, both showing a 0.00% average local rate and no
// statewide rate change July 2025-July 2026. The 7.75% luxury-goods rate, the
// 1% computer/data-processing rate and the 4.5% rate on certain motor
// vehicles, and the 1% meals surcharge, are special-purpose rates and are
// excluded.
export default {
  [STATE_SALES_TAX]: 6.35,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0,
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.35,
    bands: [
      { min: 0, max: 20000, amounts: [378, 416, 441, 459, 474, 495] },
      { min: 20000, max: 30000, amounts: [519, 572, 605, 631, 651, 679] },
      { min: 30000, max: 40000, amounts: [589, 649, 687, 715, 738, 770] },
      { min: 40000, max: 50000, amounts: [647, 712, 754, 785, 810, 846] },
      { min: 50000, max: 60000, amounts: [698, 768, 812, 847, 874, 911] },
      { min: 60000, max: 70000, amounts: [742, 817, 865, 901, 930, 970] },
      { min: 70000, max: 80000, amounts: [782, 861, 912, 950, 980, 1023] },
      { min: 80000, max: 90000, amounts: [820, 902, 955, 994, 1027, 1070] },
      { min: 90000, max: 100000, amounts: [854, 940, 995, 1036, 1069, 1115] },
      { min: 100000, max: 120000, amounts: [899, 990, 1048, 1091, 1126, 1174] },
      {
        min: 120000,
        max: 140000,
        amounts: [957, 1053, 1115, 1161, 1198, 1249],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1009, 1111, 1176, 1225, 1264, 1318],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1057, 1164, 1232, 1283, 1324, 1381],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1103, 1214, 1285, 1338, 1380, 1439],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1149, 1264, 1338, 1393, 1438, 1499],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1197, 1317, 1394, 1452, 1499, 1563],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1243, 1368, 1447, 1507, 1556, 1622],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1286, 1415, 1497, 1559, 1609, 1678],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1531, 1685, 1783, 1856, 1916, 1998],
      },
    ],
  },
} as SalesTaxData;
