import { INFINITY } from "@/constants";
import {
  CITIES,
  BOULDER_CITY,
  CARSON_CITY,
  ELKO,
  ELY,
  FALLON,
  FERNLEY,
  HENDERSON,
  LAS_VEGAS,
  MESQUITE,
  NORTH_LAS_VEGAS,
  RENO,
  SPARKS,
  WEST_WENDOVER,
  WINNEMUCCA,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Nevada Department of Taxation: 'Components of Sales and Use Tax Rates'
// (tax.nv.gov/wp-content/uploads/2024/12/Components-of-Sales-Tax.pdf), the
// county Tax Rate Sheets and 'County Map of Nevada' ADM-T047
// (tax.nv.gov/wp-content/uploads/2024/05/ADM-T047-State-Sales-Tax-Map.pdf,
// 'All rates effective 01/01/20'), listed on the Sales & Use Tax Publications
// page. Nevada sales tax is levied by county with no city-level rates, so
// each city takes its county's combined rate; the latest county change was
// Clark's on 1/1/2020, and no county rate changed in 2025 or 2026. Local =
// county combined rate minus the 4.6% state portion (2% state sales tax +
// 2.6% Local School Support Tax), so the 2.25% uniform city-county relief
// taxes count as local. Cities are the 14 most populous incorporated places
// (Census Vintage 2025 subcounty estimates); Carson City is a consolidated
// municipality. Cross-checked against the Streamlined Sales Tax rate file
// NVR2025Q4NOV05.csv, whose county rows (Clark 8.375 from 2020-01-01, Washoe
// 8.265 from 2017-04-01, etc.) run open-ended to 2099.
export default {
  // State rate 4.6% = 2% sales tax (NRS 372) + 2.6% Local School Support Tax
  // (NRS 374). Local includes the 2.25% uniform city-county relief taxes
  // (0.5% BCCRT + 1.75% SCCRT) plus county option taxes.
  [STATE_SALES_TAX]: 4.6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it. The Tax Foundation counts 2.25% of statewide
  // uniform local tax as part of the state rate, so it is added back here.
  [LOCAL_SALES_TAX]: 3.64,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.85,
    bands: [
      { min: 0, max: 20000, amounts: [392, 453, 494, 525, 551, 589] },
      { min: 20000, max: 30000, amounts: [536, 619, 675, 718, 755, 804] },
      { min: 30000, max: 40000, amounts: [607, 701, 764, 812, 853, 910] },
      { min: 40000, max: 50000, amounts: [665, 768, 837, 891, 935, 998] },
      { min: 50000, max: 60000, amounts: [716, 827, 901, 959, 1006, 1074] },
      { min: 60000, max: 70000, amounts: [762, 878, 958, 1019, 1069, 1142] },
      { min: 70000, max: 80000, amounts: [802, 925, 1008, 1073, 1127, 1202] },
      { min: 80000, max: 90000, amounts: [839, 968, 1055, 1123, 1179, 1258] },
      { min: 90000, max: 100000, amounts: [873, 1008, 1099, 1169, 1228, 1310] },
      {
        min: 100000,
        max: 120000,
        amounts: [919, 1060, 1156, 1230, 1291, 1378],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [977, 1127, 1229, 1307, 1372, 1464],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1030, 1188, 1295, 1378, 1446, 1544],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1078, 1243, 1355, 1442, 1514, 1615],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1122, 1295, 1412, 1502, 1577, 1682],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1169, 1348, 1469, 1563, 1641, 1751],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1217, 1404, 1530, 1628, 1709, 1824],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1262, 1456, 1586, 1689, 1773, 1891],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1305, 1505, 1640, 1746, 1833, 1955],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1550, 1786, 1947, 2072, 2175, 2321],
      },
    ],
  },
  [CITIES]: {
    // NV Taxation Clark County 8.375% rate sheet
    [LAS_VEGAS]: { [LOCAL_SALES_TAX]: 3.775 },
    // NV Taxation Clark County 8.375% rate sheet
    [HENDERSON]: { [LOCAL_SALES_TAX]: 3.775 },
    // NV Taxation Clark County 8.375% rate sheet
    [NORTH_LAS_VEGAS]: { [LOCAL_SALES_TAX]: 3.775 },
    // NV Taxation Washoe County 8.265% rate sheet
    [RENO]: { [LOCAL_SALES_TAX]: 3.665 },
    // NV Taxation Washoe County 8.265% rate sheet
    [SPARKS]: { [LOCAL_SALES_TAX]: 3.665 },
    // NV Taxation Carson City 7.6% rate sheet
    [CARSON_CITY]: { [LOCAL_SALES_TAX]: 3 },
    // NV Taxation Lyon County 7.1% rate sheet
    [FERNLEY]: { [LOCAL_SALES_TAX]: 2.5 },
    // NV Taxation Clark County 8.375% rate sheet
    [MESQUITE]: { [LOCAL_SALES_TAX]: 3.775 },
    // NV Taxation Elko County 7.1% rate sheet
    [ELKO]: { [LOCAL_SALES_TAX]: 2.5 },
    // NV Taxation Clark County 8.375% rate sheet
    [BOULDER_CITY]: { [LOCAL_SALES_TAX]: 3.775 },
    // NV Taxation Churchill County 7.6% rate sheet
    [FALLON]: { [LOCAL_SALES_TAX]: 3 },
    // NV Taxation Humboldt County 6.85% rate sheet
    [WINNEMUCCA]: { [LOCAL_SALES_TAX]: 2.25 },
    // NV Taxation Elko County 7.1% rate sheet
    [WEST_WENDOVER]: { [LOCAL_SALES_TAX]: 2.5 },
    // NV Taxation White Pine County 7.725% rate sheet
    [ELY]: { [LOCAL_SALES_TAX]: 3.125 },
  },
} as SalesTaxData;
