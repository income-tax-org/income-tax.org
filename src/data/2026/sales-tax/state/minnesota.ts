import { INFINITY } from "@/constants";
import {
  CITIES,
  APPLE_VALLEY,
  BLAINE,
  BLOOMINGTON,
  BROOKLYN_PARK,
  BURNSVILLE,
  COON_RAPIDS,
  DULUTH,
  EAGAN,
  EDEN_PRAIRIE,
  EDINA,
  LAKEVILLE,
  MAPLE_GROVE,
  MINNEAPOLIS,
  MINNETONKA,
  PLYMOUTH,
  ROCHESTER,
  ST_CLOUD,
  ST_LOUIS_PARK,
  ST_PAUL,
  WOODBURY,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Minnesota Department of Revenue quarterly rate guides: "Metro Counties
// Sales and Use Tax Rate Guide" and "Local Sales and Use Tax Rate Guide"
// effective 10/1/2026-12/31/2026
// (revenue.state.mn.us/sites/default/files/2026-08/metro-tax-rate-guide-2026-q4.pdf
// and local-sales-and-use-tax-rate-guide-2026-q4.pdf), whose columns split
// each city's combined rate into other local, metro area, city and county
// transit rates; start dates come from the department's Tax Type Codes list
// (2026-08/tax-type-codes.xlsx) and the Streamlined Sales Tax rate file
// MNR2026Q4AUG18. Earlier guides (2025 Q1 local guide, 2025 Q3 metro guide,
// retrieved from the Internet Archive) confirm the 2025 figures. The metro
// area rate is the 0.75% Metro Area Transportation tax plus the 0.25% Metro
// Area Housing tax (both since 10/1/2023) in Anoka, Carver, Dakota, Hennepin,
// Ramsey, Scott and Washington counties; Hennepin County adds 0.15% (since
// 2007) and its 0.5% transit tax. Special local taxes (lodging, food and
// beverage, Minneapolis downtown taxes) are excluded. Split cities use the
// county holding most residents: Blaine (Anoka), St. Cloud (Stearns). Cities:
// the 20 largest by Census Vintage 2025 place estimates.
export default {
  [STATE_SALES_TAX]: 6.875,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 1.26,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.88,
    bands: [
      { min: 0, max: 20000, amounts: [366, 414, 447, 471, 492, 520] },
      { min: 20000, max: 30000, amounts: [513, 582, 628, 662, 691, 730] },
      { min: 30000, max: 40000, amounts: [586, 665, 717, 757, 790, 836] },
      { min: 40000, max: 50000, amounts: [648, 735, 792, 837, 873, 923] },
      { min: 50000, max: 60000, amounts: [702, 796, 858, 907, 945, 1000] },
      { min: 60000, max: 70000, amounts: [749, 851, 917, 969, 1010, 1069] },
      { min: 70000, max: 80000, amounts: [793, 900, 971, 1025, 1069, 1131] },
      { min: 80000, max: 90000, amounts: [833, 945, 1020, 1077, 1124, 1189] },
      { min: 90000, max: 100000, amounts: [870, 988, 1065, 1125, 1174, 1242] },
      {
        min: 100000,
        max: 120000,
        amounts: [919, 1044, 1125, 1189, 1241, 1313],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [982, 1115, 1203, 1270, 1325, 1403],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1040, 1181, 1274, 1346, 1405, 1486],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1093, 1241, 1339, 1414, 1476, 1561],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1142, 1297, 1399, 1478, 1543, 1632],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1192, 1355, 1461, 1544, 1611, 1705],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1246, 1416, 1527, 1614, 1684, 1782],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1297, 1473, 1589, 1679, 1752, 1854],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1345, 1527, 1648, 1741, 1817, 1923],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1619, 1840, 1986, 2098, 2191, 2319],
      },
    ],
  },
  [CITIES]: {
    // Hennepin 0.15 + metro 1.00 + city 0.50 + transit 0.50
    [MINNEAPOLIS]: { [LOCAL_SALES_TAX]: 2.15 },
    // Ramsey: metro 1.00 + city 1.50 + transit 0.50
    [ST_PAUL]: { [LOCAL_SALES_TAX]: 3 },
    // Olmsted: city 0.75 + county transit 0.50
    [ROCHESTER]: { [LOCAL_SALES_TAX]: 1.25 },
    // Hennepin 0.15 + metro 1.00 + city 0.50 + transit 0.50
    [BLOOMINGTON]: { [LOCAL_SALES_TAX]: 2.15 },
    // St. Louis: city 1.50 + county transit 0.50
    [DULUTH]: { [LOCAL_SALES_TAX]: 2 },
    // Hennepin 0.15 + metro 1.00 + transit 0.50
    [BROOKLYN_PARK]: { [LOCAL_SALES_TAX]: 1.65 },
    // Washington: metro 1.00 + transit 0.50 + city 0.50 from 4/1/25
    [WOODBURY]: { [LOCAL_SALES_TAX]: 2 },
    // Dakota: metro 1.00 + transit 0.25
    [LAKEVILLE]: { [LOCAL_SALES_TAX]: 1.25 },
    // Hennepin 0.15 + metro 1.00 + transit 0.50
    [PLYMOUTH]: { [LOCAL_SALES_TAX]: 1.65 },
    [BLAINE]: { [LOCAL_SALES_TAX]: 1.25 }, // Anoka: metro 1.00 + transit 0.25
    // Hennepin 0.15 + metro 1.00 + city 0.50 + transit 0.50
    [MAPLE_GROVE]: { [LOCAL_SALES_TAX]: 2.15 },
    // Stearns: area 0.50 + transit 0.25 + county 0.375 from 4/1/25
    [ST_CLOUD]: { [LOCAL_SALES_TAX]: 1.125 },
    [EAGAN]: { [LOCAL_SALES_TAX]: 1.25 }, // Dakota: metro 1.00 + transit 0.25
    // Dakota: metro 1.00 + transit 0.25
    [BURNSVILLE]: { [LOCAL_SALES_TAX]: 1.25 },
    // Anoka: metro 1.00 + transit 0.25
    [COON_RAPIDS]: { [LOCAL_SALES_TAX]: 1.25 },
    // Hennepin 0.15 + metro 1.00 + transit 0.50
    [EDEN_PRAIRIE]: { [LOCAL_SALES_TAX]: 1.65 },
    // Dakota: metro 1.00 + transit 0.25
    [APPLE_VALLEY]: { [LOCAL_SALES_TAX]: 1.25 },
    // Hennepin 0.15 + metro 1.00 + city 0.50 + transit 0.50
    [EDINA]: { [LOCAL_SALES_TAX]: 2.15 },
    // Hennepin 0.15 + metro 1.00 + transit 0.50
    [MINNETONKA]: { [LOCAL_SALES_TAX]: 1.65 },
    // Hennepin 0.15 + metro 1.00 + transit 0.50
    [ST_LOUIS_PARK]: { [LOCAL_SALES_TAX]: 1.65 },
  },
} as SalesTaxData;
