import { INFINITY } from "@/constants";
import {
  CITIES,
  BEATRICE,
  BELLEVUE,
  BLAIR,
  COLUMBUS,
  FREMONT,
  GERING,
  GRAND_ISLAND,
  GRETNA,
  HASTINGS,
  KEARNEY,
  LA_VISTA,
  LEXINGTON,
  LINCOLN,
  NORFOLK,
  NORTH_PLATTE,
  OMAHA,
  PAPILLION,
  SCOTTSBLUFF,
  SOUTH_SIOUX_CITY,
  YORK,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Nebraska Department of Revenue Streamlined Sales Tax rate file
// NER2026Q4AUG21.csv
// (streamlinedsalestax.org/ratesandboundry/Rates/NER2026Q4AUG21.zip), read by
// effective begin/end date for each 2025-2026 quarter, cross-checked against
// NDOR's quarterly 'Local Sales and Use Tax Rates' charts
// (revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/salestax/slstax_rates_04-01-2025.pdf
// and .../2026/salestax/slstax_rates_07-01-2026.pdf) and NDOR's note that
// nothing changed on 2026-10-01. Local = the city's local option rate only:
// Nebraska county sales taxes (Dakota County) do not apply inside cities that
// levy their own tax, per NDOR's FAQ. Good Life District rate reductions
// (address-specific, type 63) and Omaha's occupation (restaurant) tax are
// excluded. State rate 5.5% throughout.
export default {
  [STATE_SALES_TAX]: 5.5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.472, 1.472, 1.48, 1.48],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5.5,
    bands: [
      { min: 0, max: 20000, amounts: [339, 389, 422, 448, 469, 499] },
      { min: 20000, max: 30000, amounts: [474, 544, 591, 628, 657, 699] },
      { min: 30000, max: 40000, amounts: [541, 622, 675, 716, 751, 798] },
      { min: 40000, max: 50000, amounts: [598, 687, 745, 791, 829, 880] },
      { min: 50000, max: 60000, amounts: [647, 742, 806, 856, 897, 954] },
      { min: 60000, max: 70000, amounts: [691, 793, 861, 914, 958, 1019] },
      { min: 70000, max: 80000, amounts: [730, 839, 911, 967, 1013, 1078] },
      { min: 80000, max: 90000, amounts: [767, 880, 957, 1016, 1063, 1131] },
      { min: 90000, max: 100000, amounts: [801, 920, 999, 1060, 1111, 1181] },
      { min: 100000, max: 120000, amounts: [846, 971, 1055, 1119, 1173, 1247] },
      {
        min: 120000,
        max: 140000,
        amounts: [903, 1037, 1126, 1195, 1252, 1332],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [956, 1098, 1192, 1265, 1325, 1410],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1003, 1153, 1252, 1328, 1392, 1481],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1048, 1204, 1308, 1388, 1454, 1547],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1095, 1257, 1366, 1449, 1518, 1615],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1144, 1313, 1427, 1514, 1586, 1688],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1189, 1366, 1484, 1575, 1650, 1755],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1233, 1416, 1539, 1633, 1710, 1819],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1483, 1703, 1850, 1963, 2058, 2189],
      },
    ],
  },
  [CITIES]: {
    // NER2026Q4 / NDOR rate chart, FIPS 37000
    [OMAHA]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 28000
    [LINCOLN]: { [LOCAL_SALES_TAX]: 1.75 },
    // NER2026Q4 / NDOR rate chart, FIPS 03950
    [BELLEVUE]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 19595
    [GRAND_ISLAND]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 25055
    [KEARNEY]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 17670
    [FREMONT]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 34615
    [NORFOLK]: { [LOCAL_SALES_TAX]: [1.5, 2, 2, 2] },
    // NER2026Q4 / NDOR rate chart, FIPS 10110
    [COLUMBUS]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 38295
    [PAPILLION]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 21415
    [HASTINGS]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 35000
    [NORTH_PLATTE]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 26385
    [LA_VISTA]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 44245
    [SCOTTSBLUFF]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 46030
    [SOUTH_SIOUX_CITY]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 03390
    [BEATRICE]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 26910
    [LEXINGTON]: { [LOCAL_SALES_TAX]: 1.5 },
    // NER2026Q4 / NDOR rate chart, FIPS 20260
    [GRETNA]: { [LOCAL_SALES_TAX]: 2 },
    // NER2026Q4 / NDOR rate chart, FIPS 18580
    [GERING]: { [LOCAL_SALES_TAX]: 2 },
    [YORK]: { [LOCAL_SALES_TAX]: 2 }, // NER2026Q4 / NDOR rate chart, FIPS 54045
    // NER2026Q4 / NDOR rate chart, FIPS 05350
    [BLAIR]: { [LOCAL_SALES_TAX]: 1.5 },
  },
} as SalesTaxData;
