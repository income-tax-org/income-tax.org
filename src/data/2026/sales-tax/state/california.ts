import { INFINITY } from "@/constants";
import {
  CITIES,
  ANAHEIM,
  BAKERSFIELD,
  CHULA_VISTA,
  FONTANA,
  FREMONT,
  FRESNO,
  IRVINE,
  LONG_BEACH,
  LOS_ANGELES,
  MODESTO,
  MORENO_VALLEY,
  OAKLAND,
  RIVERSIDE,
  SACRAMENTO,
  SANTA_ANA,
  SANTA_CLARITA,
  SAN_BERNARDINO,
  SAN_DIEGO,
  SAN_FRANCISCO,
  SAN_JOSE,
  STOCKTON,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// California Department of Tax and Fee Administration (CDTFA), 'California
// City & County Sales & Use Tax Rates'
// (cdtfa.ca.gov/taxes-and-fees/sales-use-tax-rates.htm): the archived
// quarterly PDF tables ArchivesRates01-01-2025-03-31-2025.pdf,
// ArchivesRates-04-01-2025-06-30-2025.pdf,
// ArchivesRates-07-01-2025-09-30-2025.pdf,
// ArchivesRates-10-01-2025-12-31-2025.pdf,
// ArchivesRates-01-01-2026-03-31-2026.pdf and
// ArchivesRates-04-01-2026-09-30-2026.pdf
// (cdtfa.ca.gov/taxes-and-fees/archive-rates.htm), and the current download
// SalesTaxRates10-1-26.xlsx for Q4 2026. Each city's figure is its
// incorporated-city combined rate in those tables minus the 6% state rate
// (the 7.25% statewide base includes 1.25% uniform local tax, which is
// counted as local here). Rate changes were checked against CDTFA's
// 'Explanation of Tax Rate Changes'. Cities are the 21 most populous
// incorporated places in the Census Bureau's Vintage 2025 subcounty estimates
// (sub-est2025.csv).
//
// Santa Clara County +0.625% from Apr 1 2026 (San Jose). Los Angeles County
// Measure ER (June 2, 2026 election) adds 0.5% countywide from Oct 1 2026
// (Los Angeles, Long Beach, Santa Clarita), per CDTFA 'Explanation of Tax
// Rate Changes'. CDTFA's 04/01/2026-09/30/2026 archive table covers Q2 and Q3
// with one rate.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it. The Tax Foundation counts 1.25% of statewide
  // uniform local tax as part of the state rate, so it is added back here.
  [LOCAL_SALES_TAX]: [2.99, 2.99, 3.03, 3.03],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 7.25,
    bands: [
      { min: 0, max: 20000, amounts: [412, 476, 519, 552, 580, 619] },
      { min: 20000, max: 30000, amounts: [564, 650, 709, 754, 792, 845] },
      { min: 30000, max: 40000, amounts: [637, 734, 801, 852, 895, 955] },
      { min: 40000, max: 50000, amounts: [698, 805, 877, 934, 981, 1046] },
      { min: 50000, max: 60000, amounts: [752, 866, 944, 1005, 1055, 1126] },
      { min: 60000, max: 70000, amounts: [798, 921, 1003, 1067, 1121, 1196] },
      { min: 70000, max: 80000, amounts: [841, 970, 1057, 1124, 1181, 1259] },
      { min: 80000, max: 90000, amounts: [879, 1015, 1106, 1176, 1235, 1318] },
      { min: 90000, max: 100000, amounts: [915, 1056, 1151, 1225, 1286, 1372] },
      {
        min: 100000,
        max: 120000,
        amounts: [963, 1110, 1211, 1288, 1352, 1442],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1023, 1180, 1286, 1368, 1437, 1532],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1079, 1243, 1355, 1442, 1514, 1615],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1128, 1301, 1418, 1508, 1584, 1690],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1175, 1355, 1477, 1571, 1649, 1760],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1223, 1410, 1537, 1635, 1716, 1831],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1274, 1469, 1600, 1702, 1787, 1907],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1320, 1522, 1659, 1765, 1853, 1977],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1365, 1574, 1715, 1825, 1915, 2043],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1619, 1867, 2034, 2164, 2272, 2423],
      },
    ],
  },
  [CITIES]: {
    // CDTFA city rate table, Los Angeles
    [LOS_ANGELES]: { [LOCAL_SALES_TAX]: [3.75, 3.75, 3.75, 4.25] },
    // CDTFA city rate table, San Diego
    [SAN_DIEGO]: { [LOCAL_SALES_TAX]: 1.75 },
    // CDTFA city rate table, San Jose
    [SAN_JOSE]: { [LOCAL_SALES_TAX]: [3.375, 4, 4, 4] },
    // CDTFA city rate table, San Francisco
    [SAN_FRANCISCO]: { [LOCAL_SALES_TAX]: 2.625 },
    [FRESNO]: { [LOCAL_SALES_TAX]: 2.35 }, // CDTFA city rate table, Fresno
    // CDTFA city rate table, Sacramento
    [SACRAMENTO]: { [LOCAL_SALES_TAX]: 2.75 },
    // CDTFA city rate table, Long Beach
    [LONG_BEACH]: { [LOCAL_SALES_TAX]: [4.5, 4.5, 4.5, 5] },
    [OAKLAND]: { [LOCAL_SALES_TAX]: 4.75 }, // CDTFA city rate table, Oakland
    // CDTFA city rate table, Bakersfield
    [BAKERSFIELD]: { [LOCAL_SALES_TAX]: 2.25 },
    [ANAHEIM]: { [LOCAL_SALES_TAX]: 1.75 }, // CDTFA city rate table, Anaheim
    [STOCKTON]: { [LOCAL_SALES_TAX]: 3 }, // CDTFA city rate table, Stockton
    // CDTFA city rate table, Riverside
    [RIVERSIDE]: { [LOCAL_SALES_TAX]: 2.75 },
    [IRVINE]: { [LOCAL_SALES_TAX]: 1.75 }, // CDTFA city rate table, Irvine
    // CDTFA city rate table, Santa Ana
    [SANTA_ANA]: { [LOCAL_SALES_TAX]: 3.25 },
    // CDTFA city rate table, Chula Vista
    [CHULA_VISTA]: { [LOCAL_SALES_TAX]: 2.75 },
    // CDTFA city rate table, Santa Clarita
    [SANTA_CLARITA]: { [LOCAL_SALES_TAX]: [3.75, 3.75, 3.75, 4.25] },
    [FREMONT]: { [LOCAL_SALES_TAX]: 4.25 }, // CDTFA city rate table, Fremont
    // CDTFA city rate table, San Bernardino
    [SAN_BERNARDINO]: { [LOCAL_SALES_TAX]: 2.75 },
    [FONTANA]: { [LOCAL_SALES_TAX]: 2.75 }, // CDTFA city rate table, Fontana
    [MODESTO]: { [LOCAL_SALES_TAX]: 2.875 }, // CDTFA city rate table, Modesto
    // CDTFA city rate table, Moreno Valley
    [MORENO_VALLEY]: { [LOCAL_SALES_TAX]: 2.75 },
  },
} as SalesTaxData;
