import { INFINITY } from "@/constants";
import {
  CITIES,
  EAST_HONOLULU,
  EWA_BEACH,
  EWA_GENTRY,
  HALAWA,
  HILO,
  HONOLULU,
  KAHULUI,
  KAILUA,
  KAILUA_KONA,
  KANEOHE,
  KAPAA,
  KAPOLEI,
  KIHEI,
  MAKAKILO,
  MILILANI_MAUKA,
  MILILANI_TOWN,
  OCEAN_POINTE,
  PEARL_CITY,
  WAHIAWA,
  WAILUKU,
  WAIPAHU,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Hawaii Department of Taxation, 'County Surcharge on General Excise and Use
// Tax' (tax.hawaii.gov/geninfo/countysurcharge/): the state general excise
// tax (GET) is 4% and every county levies a 0.5% surcharge throughout
// 2025-2026 (Honolulu since 2007, Kauai since 2019, Hawaii County 0.5% since
// 2020, Maui since January 1, 2024 per Tax Announcement 2023-05; all run to
// December 31, 2030). The 4% is the state rate and the 0.5% county surcharge
// is local. The GET is legally a tax on the seller, not a sales tax;
// businesses may pass it on visibly at up to 4.712% (the published maximum
// pass-on rate, which grosses up for tax on the tax), not modeled here.
// Hawaii has no incorporated municipalities, so the cities are the 20 most
// populous census-designated places in the 2020 Census redistricting file (PL
// 94-171), plus Kapaa as the largest place in Kauai County; 'kailua' is
// Kailua on Oahu and 'kailua_kona' the Kailua CDP in Hawaii County.
//
// Rates are the statutory GET plus county surcharge; sellers commonly add up
// to the 4.712% maximum pass-on rate, which is not modeled.
export default {
  [STATE_SALES_TAX]: 4,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0.5,
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4,
    bands: [
      { min: 0, max: 20000, amounts: [397, 475, 528, 570, 605, 654] },
      { min: 20000, max: 30000, amounts: [537, 641, 712, 769, 816, 882] },
      { min: 30000, max: 40000, amounts: [604, 721, 801, 864, 917, 991] },
      { min: 40000, max: 50000, amounts: [660, 788, 875, 943, 1001, 1083] },
      { min: 50000, max: 60000, amounts: [709, 845, 939, 1013, 1074, 1161] },
      { min: 60000, max: 70000, amounts: [752, 897, 995, 1073, 1138, 1231] },
      { min: 70000, max: 80000, amounts: [790, 942, 1046, 1128, 1196, 1293] },
      { min: 80000, max: 90000, amounts: [826, 984, 1093, 1178, 1249, 1351] },
      { min: 90000, max: 100000, amounts: [858, 1023, 1135, 1225, 1298, 1404] },
      {
        min: 100000,
        max: 120000,
        amounts: [901, 1073, 1192, 1285, 1363, 1473],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [956, 1138, 1263, 1362, 1444, 1561],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1005, 1197, 1329, 1433, 1519, 1641],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1050, 1251, 1388, 1496, 1586, 1714],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1093, 1301, 1443, 1556, 1649, 1782],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1135, 1352, 1500, 1617, 1713, 1851],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1181, 1406, 1560, 1681, 1781, 1925],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1224, 1456, 1615, 1741, 1845, 1993],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1263, 1503, 1668, 1797, 1904, 2058],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1491, 1772, 1965, 2117, 2244, 2423],
      },
    ],
  },
  [CITIES]: {
    // DOTAX county surcharge, City and County of Honolulu
    [HONOLULU]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [EAST_HONOLULU]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [PEARL_CITY]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Hawaii
    [HILO]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [WAIPAHU]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [KAILUA]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [KANEOHE]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Maui
    [KAHULUI]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [MILILANI_TOWN]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [EWA_GENTRY]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Maui
    [KIHEI]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [KAPOLEI]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [MILILANI_MAUKA]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [MAKAKILO]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Hawaii
    [KAILUA_KONA]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [WAHIAWA]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Maui
    [WAILUKU]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [EWA_BEACH]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [HALAWA]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, City and County of Honolulu
    [OCEAN_POINTE]: { [LOCAL_SALES_TAX]: 0.5 },
    // DOTAX county surcharge, County of Kauai
    [KAPAA]: { [LOCAL_SALES_TAX]: 0.5 },
  },
} as SalesTaxData;
