import { INFINITY } from "@/constants";
import {
  CITIES,
  BELLA_VISTA,
  BENTON,
  BENTONVILLE,
  CABOT,
  CONWAY,
  FAYETTEVILLE,
  FORT_SMITH,
  HOT_SPRINGS,
  JACKSONVILLE,
  JONESBORO,
  LITTLE_ROCK,
  NORTH_LITTLE_ROCK,
  PARAGOULD,
  PINE_BLUFF,
  ROGERS,
  RUSSELLVILLE,
  SHERWOOD,
  SPRINGDALE,
  TEXARKANA,
  VAN_BUREN,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Arkansas Department of Finance and Administration, "List of Cities and
// Counties with Local Sales and Use Tax" quarterly tables
// cityCountyTaxTable_Jan_Mar_2025.pdf through
// cityCountyTaxTable_Oct_Dec_2026.pdf (dfa.arkansas.gov/wp-content/uploads/).
// State rate 6.5% throughout. Local = the city rate plus the county rate of
// the county listed for the city; Springdale, which spans Washington and
// Benton counties, uses the Washington County portion (where most residents
// live; Benton County is 1% instead of 1.25%). Rates are the general rate;
// Arkansas's single-transaction cap on local tax (first $2,500 of a sale) and
// reduced food rates are ignored. Cities are the ~20 most populous Arkansas
// incorporated places by Census Vintage 2024 estimates.
//
// Saline County's 0.375% county tax went to 0% effective October 1, 2025 (DFA
// Oct-Dec 2025 table, Saline County 62-00 dated 10/01/25), lowering Benton
// from 2.875% to 2.5%.
export default {
  [STATE_SALES_TAX]: 6.5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [2.96, 2.96, 2.98, 2.98],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.5,
    bands: [
      { min: 0, max: 20000, amounts: [420, 486, 530, 565, 593, 634] },
      { min: 20000, max: 30000, amounts: [584, 676, 737, 786, 826, 882] },
      { min: 30000, max: 40000, amounts: [665, 770, 840, 895, 939, 1003] },
      { min: 40000, max: 50000, amounts: [733, 849, 926, 986, 1036, 1106] },
      { min: 50000, max: 60000, amounts: [793, 917, 1000, 1065, 1119, 1195] },
      { min: 60000, max: 70000, amounts: [846, 978, 1067, 1136, 1193, 1274] },
      { min: 70000, max: 80000, amounts: [894, 1033, 1127, 1200, 1261, 1346] },
      { min: 80000, max: 90000, amounts: [937, 1084, 1183, 1259, 1323, 1412] },
      { min: 90000, max: 100000, amounts: [978, 1131, 1234, 1314, 1380, 1474] },
      {
        min: 100000,
        max: 120000,
        amounts: [1032, 1193, 1302, 1386, 1455, 1554],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1100, 1273, 1388, 1478, 1553, 1657],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1163, 1345, 1467, 1562, 1641, 1752],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1221, 1412, 1540, 1639, 1721, 1837],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1274, 1473, 1607, 1711, 1798, 1918],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1329, 1537, 1677, 1785, 1875, 2001],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1387, 1605, 1750, 1864, 1957, 2089],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1442, 1668, 1819, 1937, 2034, 2170],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1494, 1726, 1884, 2006, 2106, 2248],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1790, 2070, 2258, 2403, 2524, 2693],
      },
    ],
  },
  [CITIES]: {
    // DFA city/county table, Little Rock 60-05 + Pulaski Co
    [LITTLE_ROCK]: { [LOCAL_SALES_TAX]: 2.125 },
    // DFA city/county table, Fayetteville 72-14 + Washington Co
    [FAYETTEVILLE]: { [LOCAL_SALES_TAX]: 3.25 },
    // DFA city/county table, Fort Smith 65-01 + Sebastian Co
    [FORT_SMITH]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Springdale 72-10 + Washington Co
    [SPRINGDALE]: { [LOCAL_SALES_TAX]: 3.25 },
    // DFA city/county table, Jonesboro 16-11 + Craighead Co
    [JONESBORO]: { [LOCAL_SALES_TAX]: 2 },
    // DFA city/county table, Rogers 04-02 + Benton Co
    [ROGERS]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Conway 23-01 + Faulkner Co
    [CONWAY]: { [LOCAL_SALES_TAX]: 2.25 },
    // DFA city/county table, North Little Rock 60-01 + Pulaski Co
    [NORTH_LITTLE_ROCK]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Bentonville 04-03 + Benton Co
    [BENTONVILLE]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Pine Bluff 35-01 + Jefferson Co
    [PINE_BLUFF]: { [LOCAL_SALES_TAX]: 2.875 },
    // DFA city/county table, Benton 62-03 + Saline Co
    [BENTON]: { [LOCAL_SALES_TAX]: [2.875, 2.875, 2.875, 2.5] },
    // DFA city/county table, Hot Springs 26-01 + Garland Co
    [HOT_SPRINGS]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Bella Vista 04-23 + Benton Co
    [BELLA_VISTA]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Sherwood 60-07 + Pulaski Co
    [SHERWOOD]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Paragould 28-05 + Greene Co
    [PARAGOULD]: { [LOCAL_SALES_TAX]: 2.875 },
    // DFA city/county table, Russellville 58-01 + Pope Co
    [RUSSELLVILLE]: { [LOCAL_SALES_TAX]: 2.5 },
    // DFA city/county table, Texarkana 46-13 + Miller Co
    [TEXARKANA]: { [LOCAL_SALES_TAX]: 3.75 },
    // DFA city/county table, Jacksonville 60-04 + Pulaski Co
    [JACKSONVILLE]: { [LOCAL_SALES_TAX]: 3 },
    // DFA city/county table, Cabot 43-11 + Lonoke Co
    [CABOT]: { [LOCAL_SALES_TAX]: 3.5 },
    // DFA city/county table, Van Buren 17-02 + Crawford Co
    [VAN_BUREN]: { [LOCAL_SALES_TAX]: 2.75 },
  },
} as SalesTaxData;
