import { INFINITY } from "@/constants";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// District of Columbia Office of Tax and Revenue (otr.cfo.dc.gov): "Notice of
// Oct. 1, 2025 Tax Changes"
// (otr.cfo.dc.gov/release/notice-oct-1-2025-tax-changes), which says that
// under the Sales Tax Increase Delay Amendment Act of 2025 (Fiscal Year 2026
// Budget Support Act, Act 26-0148) the general sales tax rate remains 6.0%
// through Sept. 30, 2026 and was to rise to 7.0% on Oct. 1, 2026; and the
// site-wide OTR notice as of October 2026: "The increase in the general sales
// tax rate to 7% has been postponed. The general sales tax rate remains 6%
// through September 30, 2027." The Sales and Use Tax FAQs also list the
// general rate as 6%. The District has no separate local sales tax, so no
// cities are listed. The 6.5% step for October 1, 2025, scheduled under the
// earlier FY2025 Budget Support Act, never took effect.
export default {
  // 6% all year; the 7% rate scheduled for Oct 1, 2026 was postponed and the
  // rate stays 6% through Sept 30, 2027 (OTR site notice, Oct 2026).
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
      { min: 0, max: 20000, amounts: [363, 398, 421, 439, 453, 472] },
      { min: 20000, max: 30000, amounts: [493, 541, 573, 596, 615, 641] },
      { min: 30000, max: 40000, amounts: [557, 611, 647, 673, 695, 724] },
      { min: 40000, max: 50000, amounts: [609, 669, 708, 736, 760, 792] },
      { min: 50000, max: 60000, amounts: [655, 719, 761, 792, 818, 852] },
      { min: 60000, max: 70000, amounts: [695, 764, 807, 841, 867, 904] },
      { min: 70000, max: 80000, amounts: [731, 804, 850, 885, 913, 952] },
      { min: 80000, max: 90000, amounts: [765, 841, 889, 925, 955, 994] },
      { min: 90000, max: 100000, amounts: [796, 874, 925, 963, 993, 1035] },
      { min: 100000, max: 120000, amounts: [837, 919, 972, 1012, 1044, 1088] },
      { min: 120000, max: 140000, amounts: [889, 976, 1032, 1074, 1108, 1155] },
      {
        min: 140000,
        max: 160000,
        amounts: [935, 1028, 1087, 1131, 1167, 1216],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [978, 1074, 1136, 1183, 1221, 1271],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1019, 1119, 1183, 1231, 1269, 1323],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1059, 1164, 1231, 1281, 1321, 1376],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1103, 1212, 1281, 1332, 1375, 1432],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1143, 1255, 1327, 1381, 1425, 1485],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1181, 1297, 1371, 1427, 1473, 1534],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1398, 1536, 1623, 1689, 1743, 1815],
      },
    ],
  },
} as SalesTaxData;
