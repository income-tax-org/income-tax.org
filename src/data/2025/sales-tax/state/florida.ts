import { INFINITY } from "@/constants";
import {
  CITIES,
  CAPE_CORAL,
  CLEARWATER,
  CORAL_SPRINGS,
  FORT_LAUDERDALE,
  GAINESVILLE,
  HIALEAH,
  HOLLYWOOD,
  JACKSONVILLE,
  LAKELAND,
  MIAMI,
  MIRAMAR,
  ORLANDO,
  PALM_BAY,
  PEMBROKE_PINES,
  POMPANO_BEACH,
  PORT_ST_LUCIE,
  ST_PETERSBURG,
  TALLAHASSEE,
  TAMPA,
  WEST_PALM_BEACH,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Florida Department of Revenue, Form DR-15DSS 'Discretionary Sales Surtax
// Information for Calendar Year 2025' (R. 11/24,
// floridarevenue.com/Forms_library/current/dr15dss.pdf) and 'for Calendar
// Year 2026' (R. 11/25,
// floridarevenue.com/Forms_library/current/dr15dss_26.pdf), which list each
// county's total surtax rate and its components with effective and expiration
// dates. Florida cities levy no sales tax of their own, so each city's local
// rate is its county's discretionary sales surtax. Hillsborough County's 0.5%
// indigent care and 0.5% local government infrastructure surtaxes were
// suspended January 1 through May 31, 2025 (TIP 24A01-15, combined rate 6.5%)
// and resumed June 1, 2025 (TIP 25A01-02, combined 7.5%). Palm Beach County's
// 1% infrastructure surtax was repealed effective December 31, 2025 and a new
// 0.5% school surtax began January 1, 2026 (TIP 25A01-15). Surtax applies
// only to the first $5,000 of a single item's price; that cap is not modeled
// here. State rate 6%. Cities are the 20 most populous incorporated places in
// the Census Bureau's Vintage 2025 city estimates (SUB-EST2025), each wholly
// within one county.
//
// Tampa (Hillsborough) monthly: surtax 0.5% January-May 2025 during the
// suspension, 1.5% from June 1, 2025.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.948, 0.948, 1.02, 1.02],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [379, 433, 468, 497, 519, 550] },
      { min: 20000, max: 30000, amounts: [524, 599, 649, 688, 719, 764] },
      { min: 30000, max: 40000, amounts: [596, 681, 738, 782, 818, 868] },
      { min: 40000, max: 50000, amounts: [656, 751, 812, 861, 901, 956] },
      { min: 50000, max: 60000, amounts: [709, 810, 877, 929, 972, 1032] },
      { min: 60000, max: 70000, amounts: [755, 863, 935, 990, 1036, 1100] },
      { min: 70000, max: 80000, amounts: [797, 911, 987, 1046, 1094, 1162] },
      { min: 80000, max: 90000, amounts: [836, 956, 1035, 1097, 1148, 1218] },
      { min: 90000, max: 100000, amounts: [871, 996, 1080, 1144, 1196, 1270] },
      {
        min: 100000,
        max: 120000,
        amounts: [918, 1050, 1137, 1205, 1261, 1339],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [979, 1119, 1213, 1285, 1344, 1427],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1034, 1182, 1281, 1357, 1420, 1507],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1084, 1240, 1344, 1423, 1489, 1581],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1131, 1294, 1401, 1485, 1554, 1649],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1179, 1349, 1461, 1549, 1620, 1720],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1230, 1408, 1525, 1616, 1691, 1795],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1278, 1461, 1584, 1679, 1756, 1865],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1323, 1513, 1640, 1738, 1818, 1931],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1582, 1810, 1961, 2078, 2174, 2309],
      },
    ],
  },
  [CITIES]: {
    // DR-15DSS 2025, Duval County surtax
    [JACKSONVILLE]: { [LOCAL_SALES_TAX]: 1.5 },
    // DR-15DSS 2025, Miami-Dade County surtax
    [MIAMI]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Hillsborough County surtax
    [TAMPA]: {
      [LOCAL_SALES_TAX]: [
        0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
      ],
    },
    // DR-15DSS 2025, Orange County surtax
    [ORLANDO]: { [LOCAL_SALES_TAX]: 0.5 },
    // DR-15DSS 2025, St. Lucie County surtax
    [PORT_ST_LUCIE]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Pinellas County surtax
    [ST_PETERSBURG]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Lee County surtax
    [CAPE_CORAL]: { [LOCAL_SALES_TAX]: 0.5 },
    // DR-15DSS 2025, Miami-Dade County surtax
    [HIALEAH]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Leon County surtax
    [TALLAHASSEE]: { [LOCAL_SALES_TAX]: 1.5 },
    // DR-15DSS 2025, Broward County surtax
    [FORT_LAUDERDALE]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Broward County surtax
    [PEMBROKE_PINES]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Broward County surtax
    [HOLLYWOOD]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Alachua County surtax
    [GAINESVILLE]: { [LOCAL_SALES_TAX]: 1.5 },
    // DR-15DSS 2025, Brevard County surtax
    [PALM_BAY]: { [LOCAL_SALES_TAX]: 1 },
    [MIRAMAR]: { [LOCAL_SALES_TAX]: 1 }, // DR-15DSS 2025, Broward County surtax
    // DR-15DSS 2025, Broward County surtax
    [CORAL_SPRINGS]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Palm Beach County surtax
    [WEST_PALM_BEACH]: { [LOCAL_SALES_TAX]: 1 },
    [LAKELAND]: { [LOCAL_SALES_TAX]: 1 }, // DR-15DSS 2025, Polk County surtax
    // DR-15DSS 2025, Broward County surtax
    [POMPANO_BEACH]: { [LOCAL_SALES_TAX]: 1 },
    // DR-15DSS 2025, Pinellas County surtax
    [CLEARWATER]: { [LOCAL_SALES_TAX]: 1 },
  },
} as SalesTaxData;
