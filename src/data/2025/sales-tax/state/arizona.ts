import { INFINITY } from "@/constants";
import {
  CITIES,
  AVONDALE,
  BUCKEYE,
  CASA_GRANDE,
  CHANDLER,
  FLAGSTAFF,
  GILBERT,
  GLENDALE,
  GOODYEAR,
  LAKE_HAVASU_CITY,
  MARANA,
  MARICOPA,
  MESA,
  PEORIA,
  PHOENIX,
  QUEEN_CREEK,
  SCOTTSDALE,
  SURPRISE,
  TEMPE,
  TUCSON,
  YUMA,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Arizona Department of Revenue, 'Transaction Privilege and Other Tax Rate
// Tables' (azdor.gov/business/transaction-privilege-tax/tax-rate-table):
// monthly PDFs TPT_RATETABLE_MMDDYYYY.pdf for January 2025 through November
// 2026, and the matching TPT_RATETABLE_ALL_MMDDYYYY.csv downloads (August
// 2025 onward), read for business code 017 Retail. Arizona's TPT is a tax on
// the seller that is customarily passed on as sales tax; state rate 5.6%.
// Local = the city's program-city retail rate plus its county's excise rate
// (ADOR's county rate minus 5.6%: Maricopa 0.7, Pima 0.5, Pinal 1.1, Yuma
// 1.112, Coconino 1.3, Mohave 0). Cities in two counties use the county
// holding most residents: Peoria, Queen Creek and Buckeye use Maricopa,
// Marana uses Pima. Stadium/special taxing districts (Phoenix PZ, Queen Creek
// QD, Maricopa County stadium MCZ) and reduced single-item rates are
// excluded. Cities are the 20 most populous incorporated places in the Census
// Vintage 2025 subcounty estimates.
//
// Mid-year retail (017) changes, all on quarter starts: Phoenix 2.3% -> 2.8%
// and Scottsdale 1.75% -> 1.7% and Flagstaff 2.281% -> 2.486% on Jul 1 2025;
// City of Maricopa 2.0% -> 2.5% on Oct 1 2025. Gilbert's 1.5% -> 2.0% took
// effect Jan 1 2025, so it held all year.
export default {
  [STATE_SALES_TAX]: 5.6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.814, 2.814, 2.92, 2.92],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5.6,
    bands: [
      { min: 0, max: 20000, amounts: [335, 386, 419, 446, 467, 498] },
      { min: 20000, max: 30000, amounts: [463, 532, 579, 615, 646, 688] },
      { min: 30000, max: 40000, amounts: [525, 605, 658, 700, 733, 781] },
      { min: 40000, max: 50000, amounts: [578, 665, 724, 769, 806, 859] },
      { min: 50000, max: 60000, amounts: [624, 718, 781, 830, 870, 927] },
      { min: 60000, max: 70000, amounts: [664, 765, 832, 885, 927, 988] },
      { min: 70000, max: 80000, amounts: [701, 806, 877, 933, 979, 1043] },
      { min: 80000, max: 90000, amounts: [734, 845, 920, 978, 1026, 1093] },
      { min: 90000, max: 100000, amounts: [766, 882, 959, 1020, 1069, 1139] },
      { min: 100000, max: 120000, amounts: [806, 928, 1010, 1074, 1127, 1200] },
      { min: 120000, max: 140000, amounts: [859, 989, 1077, 1145, 1200, 1279] },
      {
        min: 140000,
        max: 160000,
        amounts: [907, 1044, 1136, 1209, 1267, 1351],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [951, 1095, 1191, 1266, 1328, 1416],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [991, 1142, 1243, 1321, 1385, 1477],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1034, 1190, 1296, 1377, 1444, 1539],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1078, 1241, 1351, 1436, 1507, 1606],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1119, 1289, 1404, 1492, 1565, 1668],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1159, 1334, 1452, 1544, 1620, 1725],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1383, 1592, 1734, 1843, 1934, 2061],
      },
    ],
  },
  [CITIES]: {
    // ADOR rate table, PX 017 + Maricopa County excise 0.7%
    [PHOENIX]: { [LOCAL_SALES_TAX]: [3, 3, 3.5, 3.5] },
    // ADOR rate table, TU 017 + Pima County excise 0.5%
    [TUCSON]: { [LOCAL_SALES_TAX]: 3.1 },
    // ADOR rate table, ME 017 + Maricopa County excise 0.7%
    [MESA]: { [LOCAL_SALES_TAX]: 2.7 },
    // ADOR rate table, GB 017 + Maricopa County excise 0.7%
    [GILBERT]: { [LOCAL_SALES_TAX]: 2.7 },
    // ADOR rate table, CH 017 + Maricopa County excise 0.7%
    [CHANDLER]: { [LOCAL_SALES_TAX]: 2.2 },
    // ADOR rate table, GE 017 + Maricopa County excise 0.7%
    [GLENDALE]: { [LOCAL_SALES_TAX]: 3.6 },
    // ADOR rate table, SC 017 + Maricopa County excise 0.7%
    [SCOTTSDALE]: { [LOCAL_SALES_TAX]: [2.45, 2.45, 2.4, 2.4] },
    // ADOR rate table, PE 017 + Maricopa County excise 0.7%
    [PEORIA]: { [LOCAL_SALES_TAX]: 2.5 },
    // ADOR rate table, TE 017 + Maricopa County excise 0.7%
    [TEMPE]: { [LOCAL_SALES_TAX]: 2.5 },
    // ADOR rate table, SP 017 + Maricopa County excise 0.7%
    [SURPRISE]: { [LOCAL_SALES_TAX]: 3.5 },
    // ADOR rate table, BE 017 + Maricopa County excise 0.7%
    [BUCKEYE]: { [LOCAL_SALES_TAX]: 3.7 },
    // ADOR rate table, GY 017 + Maricopa County excise 0.7%
    [GOODYEAR]: { [LOCAL_SALES_TAX]: 3.2 },
    // ADOR rate table, YM 017 + Yuma County excise 1.112%
    [YUMA]: { [LOCAL_SALES_TAX]: 2.812 },
    // ADOR rate table, AV 017 + Maricopa County excise 0.7%
    [AVONDALE]: { [LOCAL_SALES_TAX]: 3.2 },
    // ADOR rate table, QC 017 + Maricopa County excise 0.7%
    [QUEEN_CREEK]: { [LOCAL_SALES_TAX]: 2.95 },
    // ADOR rate table, MP 017 + Pinal County excise 1.1%
    [MARICOPA]: { [LOCAL_SALES_TAX]: [3.1, 3.1, 3.1, 3.6] },
    // ADOR rate table, FS 017 + Coconino County excise 1.3%
    [FLAGSTAFF]: { [LOCAL_SALES_TAX]: [3.581, 3.581, 3.786, 3.786] },
    // ADOR rate table, CG 017 + Pinal County excise 1.1%
    [CASA_GRANDE]: { [LOCAL_SALES_TAX]: 3.1 },
    // ADOR rate table, MA 017 + Pima County excise 0.5%
    [MARANA]: { [LOCAL_SALES_TAX]: 3 },
    // ADOR rate table, LH 017 + Mohave County excise 0.0%
    [LAKE_HAVASU_CITY]: { [LOCAL_SALES_TAX]: 2 },
  },
} as SalesTaxData;
