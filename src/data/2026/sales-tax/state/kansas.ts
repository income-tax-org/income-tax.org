import { INFINITY } from "@/constants";
import {
  CITIES,
  DERBY,
  DODGE_CITY,
  EMPORIA,
  GARDEN_CITY,
  GARDNER,
  HUTCHINSON,
  JUNCTION_CITY,
  KANSAS_CITY,
  LAWRENCE,
  LEAVENWORTH,
  LEAWOOD,
  LENEXA,
  MANHATTAN,
  OLATHE,
  OVERLAND_PARK,
  PRAIRIE_VILLAGE,
  SALINA,
  SHAWNEE,
  TOPEKA,
  WICHITA,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Kansas Department of Revenue Streamlined Sales Tax rate file
// KSR2026Q4AUG19.csv
// (streamlinedsalestax.org/ratesandboundry/Rates/KSR2026Q4AUG19.zip), which
// carries effective begin/end dates so every 2025-2026 quarter is read from
// one file; changes cross-checked against KDOR's quarterly local rate change
// notices (ksrevenue.gov/salesratechanges.html) and the City of Hutchinson's
// announcement of its 0.75% tax from 2026-10-01. Local = county rate
// (jurisdiction type 00) + city rate (type 01) for the county holding the
// city's residents (Census 2025 place-by-county estimates; Manhattan uses
// Riley County). Address-specific special districts (CIDs, TDDs, STAR bond
// and similar, types 63/79) are excluded. State rate 6.5% throughout; the
// food rate cut to 0% on 2025-01-01 does not affect the general rate.
export default {
  [STATE_SALES_TAX]: 6.5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.19, 2.19, 2.21, 2.21],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.5,
    bands: [
      { min: 0, max: 20000, amounts: [417, 493, 544, 586, 619, 668] },
      { min: 20000, max: 30000, amounts: [572, 675, 745, 801, 848, 914] },
      { min: 30000, max: 40000, amounts: [647, 764, 844, 907, 960, 1034] },
      { min: 40000, max: 50000, amounts: [710, 838, 925, 994, 1052, 1133] },
      { min: 50000, max: 60000, amounts: [765, 903, 996, 1070, 1132, 1221] },
      { min: 60000, max: 70000, amounts: [813, 960, 1059, 1138, 1204, 1297] },
      { min: 70000, max: 80000, amounts: [857, 1010, 1116, 1199, 1268, 1367] },
      { min: 80000, max: 90000, amounts: [898, 1058, 1169, 1255, 1327, 1430] },
      { min: 90000, max: 100000, amounts: [934, 1102, 1217, 1307, 1382, 1489] },
      {
        min: 100000,
        max: 120000,
        amounts: [984, 1160, 1281, 1375, 1454, 1567],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1046, 1233, 1361, 1461, 1546, 1666],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1103, 1300, 1435, 1542, 1630, 1756],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1155, 1361, 1502, 1614, 1706, 1837],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1203, 1418, 1565, 1681, 1777, 1914],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1253, 1477, 1629, 1750, 1850, 1993],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1306, 1538, 1697, 1823, 1928, 2076],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1355, 1595, 1761, 1891, 1999, 2153],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1400, 1649, 1821, 1955, 2067, 2226],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1666, 1961, 2163, 2322, 2455, 2644],
      },
    ],
  },
  [CITIES]: {
    // KSR2026Q4 city 79000 + county 173 Sedgwick
    [WICHITA]: { [LOCAL_SALES_TAX]: 1 },
    // KSR2026Q4 city 53775 + county 091 Johnson
    [OVERLAND_PARK]: { [LOCAL_SALES_TAX]: 2.85 },
    // KSR2026Q4 city 36000 + county 209 Wyandotte
    [KANSAS_CITY]: { [LOCAL_SALES_TAX]: 2.625 },
    // KSR2026Q4 city 52575 + county 091 Johnson
    [OLATHE]: { [LOCAL_SALES_TAX]: 2.975 },
    // KSR2026Q4 city 71000 + county 177 Shawnee
    [TOPEKA]: { [LOCAL_SALES_TAX]: 2.85 },
    // KSR2026Q4 city 38900 + county 045 Douglas
    [LAWRENCE]: { [LOCAL_SALES_TAX]: 2.85 },
    // KSR2026Q4 city 64500 + county 091 Johnson
    [SHAWNEE]: { [LOCAL_SALES_TAX]: 3.1 },
    // KSR2026Q4 city 39350 + county 091 Johnson
    [LENEXA]: { [LOCAL_SALES_TAX]: 2.85 },
    // KSR2026Q4 city 44250 + county 161 Riley
    [MANHATTAN]: { [LOCAL_SALES_TAX]: 2.65 },
    // KSR2026Q4 city 62700 + county 169 Saline
    [SALINA]: { [LOCAL_SALES_TAX]: 2.75 },
    // KSR2026Q4 city 33625 + county 155 Reno
    [HUTCHINSON]: { [LOCAL_SALES_TAX]: [1.75, 1.75, 1.75, 2.5] },
    // KSR2026Q4 city 39000 + county 103 Leavenworth
    [LEAVENWORTH]: { [LOCAL_SALES_TAX]: 3 },
    // KSR2026Q4 city 39075 + county 091 Johnson
    [LEAWOOD]: { [LOCAL_SALES_TAX]: 2.6 },
    // KSR2026Q4 city 18250 + county 057 Ford
    [DODGE_CITY]: { [LOCAL_SALES_TAX]: 2.5 },
    // KSR2026Q4 city 25325 + county 055 Finney
    [GARDEN_CITY]: { [LOCAL_SALES_TAX]: [2.45, 2.95, 2.95, 2.95] },
    // KSR2026Q4 city 17800 + county 173 Sedgwick
    [DERBY]: { [LOCAL_SALES_TAX]: 2 },
    // KSR2026Q4 city 25425 + county 091 Johnson
    [GARDNER]: { [LOCAL_SALES_TAX]: 2.975 },
    // KSR2026Q4 city 21275 + county 111 Lyon
    [EMPORIA]: { [LOCAL_SALES_TAX]: 2 },
    // KSR2026Q4 city 57575 + county 091 Johnson
    [PRAIRIE_VILLAGE]: { [LOCAL_SALES_TAX]: 2.475 },
    // KSR2026Q4 city 35750 + county 061 Geary
    [JUNCTION_CITY]: { [LOCAL_SALES_TAX]: 3.25 },
  },
} as SalesTaxData;
