import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Maine Revenue Services general sales tax rate of 5.5%, unchanged through
// 2025 and 2026; Maine has no local sales tax. Cross-checked with Tax
// Foundation 'State and Local Sales Tax Rates, 2026' (Jan 1 2026) and
// 'Midyear 2026' (Jul 1 2026) tables, both showing a 0.00% average local rate
// and no statewide rate change July 2025-July 2026. The Jan 1 2026 changes
// (repeal of the Service Provider Tax and extension of the 5.5% rate to
// digital audio/audiovisual services; MRS GIB 115) changed the base, not the
// general rate. The 8% prepared-food, 9% lodging and 10% short-term auto
// rental rates are excluded.
export default {
  [STATE_SALES_TAX]: 5.5,
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
    rate: 5.5,
    bands: [
      { min: 0, max: 20000, amounts: [305, 346, 374, 395, 412, 437] },
      { min: 20000, max: 30000, amounts: [413, 468, 506, 534, 558, 590] },
      { min: 30000, max: 40000, amounts: [465, 528, 570, 601, 628, 665] },
      { min: 40000, max: 50000, amounts: [509, 577, 623, 658, 687, 727] },
      { min: 50000, max: 60000, amounts: [546, 619, 669, 706, 737, 780] },
      { min: 60000, max: 70000, amounts: [580, 658, 709, 749, 782, 828] },
      { min: 70000, max: 80000, amounts: [609, 692, 746, 788, 823, 870] },
      { min: 80000, max: 90000, amounts: [637, 723, 780, 824, 859, 909] },
      { min: 90000, max: 100000, amounts: [663, 752, 810, 856, 893, 945] },
      { min: 100000, max: 120000, amounts: [696, 789, 851, 899, 937, 992] },
      { min: 120000, max: 140000, amounts: [738, 837, 903, 954, 995, 1053] },
      { min: 140000, max: 160000, amounts: [777, 882, 950, 1003, 1047, 1108] },
      { min: 160000, max: 180000, amounts: [812, 921, 993, 1048, 1094, 1158] },
      { min: 180000, max: 200000, amounts: [845, 958, 1033, 1091, 1137, 1203] },
      { min: 200000, max: 225000, amounts: [878, 995, 1073, 1133, 1183, 1251] },
      {
        min: 225000,
        max: 250000,
        amounts: [914, 1036, 1117, 1179, 1230, 1302],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [947, 1073, 1157, 1222, 1275, 1349],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [978, 1108, 1194, 1261, 1316, 1392],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1155, 1308, 1411, 1489, 1554, 1643],
      },
    ],
  },
} as SalesTaxData;
