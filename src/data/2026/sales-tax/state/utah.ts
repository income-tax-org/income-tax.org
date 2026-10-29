import { INFINITY } from "@/constants";
import {
  CITIES,
  DRAPER,
  EAGLE_MOUNTAIN,
  HERRIMAN,
  LAYTON,
  LEHI,
  LOGAN,
  MILLCREEK,
  MURRAY,
  OGDEN,
  OREM,
  PROVO,
  SALT_LAKE_CITY,
  SANDY,
  SARATOGA_SPRINGS,
  SOUTH_JORDAN,
  SPANISH_FORK,
  ST_GEORGE,
  TAYLORSVILLE,
  WEST_JORDAN,
  WEST_VALLEY_CITY,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Utah State Tax Commission rates as published in the Streamlined Sales Tax
// rate file UTR2026Q4AUG11.csv
// (streamlinedsalestax.org/Shared-Pages/rate-and-boundary-files), which
// carries each county (type 00) and city (type 01, Census place code) rate
// with effective dates, so it covers every month of 2025 and 2026 including
// Q4 2026. State rate is the type 45 row (4.85%). Local = the county row
// (which in Utah's file bundles the 1% local option, county option, transit
// and other county-wide rates) plus the city row where one exists.
// Cross-checked against the Tax Commission's 'Combined Rates 2026-01' table
// at tax.utah.gov/sales/rates (all 20 cities match). Draper, partly in Utah
// County, uses its Salt Lake County portion where most residents live. Cities
// are the 20 most populous incorporated places in the Census Vintage 2025
// subcounty estimates. Every quarter of 2025-2026 for all 20 cities was also
// checked against the Tax Commission's quarterly 'Combined Sales and Use Tax
// Rates' PDFs (files.tax.utah.gov/tax/salestax/rate/25q1combined.pdf through
// 26q4combined.pdf), which match the SST file, including the timing of each
// change.
//
// Eagle Mountain added a 0.1% city rate on Apr 1 2026; Weber County rose 0.2%
// on Oct 1 2026 (Ogden). Cross-checked against the Utah State Tax
// Commission's 'Combined Rates 2026-01' table, which matches every city for
// January 2026. All four quarters confirmed by the Tax Commission's
// 26q1-26q4combined.pdf.
export default {
  [STATE_SALES_TAX]: 4.85,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it. The Tax Foundation counts 1.25% of statewide
  // uniform local tax as part of the state rate, so it is added back here.
  [LOCAL_SALES_TAX]: 2.57,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.85,
    bands: [
      { min: 0, max: 20000, amounts: [375, 445, 493, 531, 563, 608] },
      { min: 20000, max: 30000, amounts: [508, 603, 668, 720, 763, 824] },
      { min: 30000, max: 40000, amounts: [573, 680, 754, 811, 860, 929] },
      { min: 40000, max: 50000, amounts: [627, 744, 825, 888, 940, 1016] },
      { min: 50000, max: 60000, amounts: [673, 799, 886, 954, 1010, 1091] },
      { min: 60000, max: 70000, amounts: [715, 848, 939, 1012, 1072, 1158] },
      { min: 70000, max: 80000, amounts: [753, 893, 989, 1064, 1128, 1218] },
      { min: 80000, max: 90000, amounts: [786, 933, 1034, 1113, 1179, 1273] },
      { min: 90000, max: 100000, amounts: [819, 970, 1074, 1157, 1226, 1323] },
      {
        min: 100000,
        max: 120000,
        amounts: [859, 1020, 1129, 1216, 1288, 1390],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [912, 1082, 1198, 1290, 1367, 1476],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [961, 1138, 1261, 1358, 1438, 1553],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1004, 1190, 1318, 1420, 1504, 1623],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1045, 1239, 1372, 1477, 1564, 1689],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1087, 1288, 1427, 1536, 1627, 1756],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1130, 1341, 1485, 1597, 1692, 1827],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1172, 1388, 1538, 1655, 1754, 1893],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1211, 1435, 1588, 1710, 1812, 1955],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1432, 1696, 1878, 2021, 2141, 2310],
      },
    ],
  },
  [CITIES]: {
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 67000
    [SALT_LAKE_CITY]: { [LOCAL_SALES_TAX]: 3.6 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 83470
    [WEST_VALLEY_CITY]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 82950
    [WEST_JORDAN]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 62470
    [PROVO]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 053 (Washington) + place 65330
    [ST_GEORGE]: { [LOCAL_SALES_TAX]: 1.9 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 44320
    [LEHI]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 57300
    [OREM]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 67440
    [SANDY]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 057 (Weber) + place 55980
    [OGDEN]: { [LOCAL_SALES_TAX]: [2.4, 2.4, 2.4, 2.6] },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 70850
    [SOUTH_JORDAN]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 011 (Davis) + place 43660
    [LAYTON]: { [LOCAL_SALES_TAX]: 2.4 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 20810
    [EAGLE_MOUNTAIN]: { [LOCAL_SALES_TAX]: [2.5, 2.6, 2.6, 2.6] },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 50150
    [MILLCREEK]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 34970
    [HERRIMAN]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 67825
    [SARATOGA_SPRINGS]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 75360
    [TAYLORSVILLE]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 005 (Cache) + place 45860
    [LOGAN]: { [LOCAL_SALES_TAX]: 2.45 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 53230
    [MURRAY]: { [LOCAL_SALES_TAX]: 2.8 },
    // SST UTR2026Q4AUG11, county 035 (Salt Lake) + place 20120
    [DRAPER]: { [LOCAL_SALES_TAX]: 2.6 },
    // SST UTR2026Q4AUG11, county 049 (Utah) + place 71290
    [SPANISH_FORK]: { [LOCAL_SALES_TAX]: 2.6 },
  },
} as SalesTaxData;
