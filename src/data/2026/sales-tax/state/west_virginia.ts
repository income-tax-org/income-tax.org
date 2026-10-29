import { INFINITY } from "@/constants";
import {
  CITIES,
  BECKLEY,
  BLUEFIELD,
  BRIDGEPORT,
  CHARLESTON,
  CHARLES_TOWN,
  CLARKSBURG,
  DUNBAR,
  FAIRMONT,
  HUNTINGTON,
  HURRICANE,
  MARTINSBURG,
  MORGANTOWN,
  MOUNDSVILLE,
  OAK_HILL,
  PARKERSBURG,
  SOUTH_CHARLESTON,
  ST_ALBANS,
  VIENNA,
  WEIRTON,
  WHEELING,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// West Virginia Tax Division, 'Municipalities Imposing Sales and Use Taxes'
// (tax.wv.gov/Documents/SUT/MunicipalitiesImposingSalesAndUseTaxes.pdf, the
// edition listing changes effective January 1, 2027), which lists each
// municipality's 1% rate and effective date; every city below has levied 1%
// since 2022 or earlier. Cross-checked against the Streamlined Sales Tax rate
// file WVR2026Q3FEB25.csv (streamlinedsalestax.org/ratesandboundry/Rates/),
// whose city rows (by Census place code) show 1% open-ended for each. West
// Virginia has no county sales tax, and municipal taxes can start only on
// January 1 or July 1, so no change was possible in Q4 2026. State rate 6%
// (food is exempt from the state tax). Cities are the 20 most populous
// incorporated places in the Census Bureau's Vintage 2025 city estimates
// (SUB-EST2025).
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.59, 0.59, 0.6, 0.6],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [375, 435, 475, 507, 533, 570] },
      { min: 20000, max: 30000, amounts: [532, 617, 675, 720, 758, 810] },
      { min: 30000, max: 40000, amounts: [610, 709, 776, 828, 870, 931] },
      { min: 40000, max: 50000, amounts: [677, 786, 860, 918, 966, 1033] },
      { min: 50000, max: 60000, amounts: [735, 854, 935, 997, 1050, 1123] },
      { min: 60000, max: 70000, amounts: [787, 915, 1001, 1068, 1124, 1202] },
      { min: 70000, max: 80000, amounts: [835, 970, 1061, 1132, 1192, 1276] },
      { min: 80000, max: 90000, amounts: [878, 1021, 1117, 1192, 1254, 1343] },
      { min: 90000, max: 100000, amounts: [919, 1068, 1169, 1248, 1313, 1405] },
      {
        min: 100000,
        max: 120000,
        amounts: [972, 1130, 1238, 1320, 1389, 1487],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1041, 1211, 1325, 1415, 1489, 1592],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1105, 1285, 1407, 1501, 1580, 1690],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1163, 1352, 1481, 1580, 1662, 1779],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1217, 1416, 1550, 1654, 1741, 1863],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1273, 1481, 1621, 1731, 1822, 1949],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1332, 1550, 1697, 1812, 1907, 2040],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1388, 1615, 1768, 1888, 1987, 2127],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1441, 1677, 1836, 1960, 2063, 2208],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1747, 2033, 2227, 2377, 2503, 2679],
      },
    ],
  },
  [CITIES]: {
    // WV Tax Division list; SST place 14600
    [CHARLESTON]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 39460
    [HUNTINGTON]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 55756
    [MORGANTOWN]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 62140
    [PARKERSBURG]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 86452
    [WHEELING]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 52060
    [MARTINSBURG]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 85156
    [WEIRTON]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 26452
    [FAIRMONT]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 05332
    [BECKLEY]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 15628
    [CLARKSBURG]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 75292
    [SOUTH_CHARLESTON]: { [LOCAL_SALES_TAX]: 1 },
    [VIENNA]: { [LOCAL_SALES_TAX]: 1 }, // WV Tax Division list; SST place 83500
    // WV Tax Division list; SST place 71212
    [ST_ALBANS]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 10180
    [BRIDGEPORT]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 14610
    [CHARLES_TOWN]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 08524
    [BLUEFIELD]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 56020
    [MOUNDSVILLE]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 60028
    [OAK_HILL]: { [LOCAL_SALES_TAX]: 1 },
    // WV Tax Division list; SST place 39532
    [HURRICANE]: { [LOCAL_SALES_TAX]: 1 },
    [DUNBAR]: { [LOCAL_SALES_TAX]: 1 }, // WV Tax Division list; SST place 22564
  },
} as SalesTaxData;
