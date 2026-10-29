import { INFINITY } from "@/constants";
import {
  CITIES,
  APPLETON,
  BROOKFIELD,
  EAU_CLAIRE,
  FOND_DU_LAC,
  GREEN_BAY,
  JANESVILLE,
  KENOSHA,
  LA_CROSSE,
  MADISON,
  MENOMONEE_FALLS,
  MILWAUKEE,
  NEW_BERLIN,
  OSHKOSH,
  RACINE,
  SHEBOYGAN,
  SUN_PRAIRIE,
  WAUKESHA,
  WAUSAU,
  WAUWATOSA,
  WEST_ALLIS,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Streamlined Sales Tax rate file WIR2026Q4AUG17.csv
// (streamlinedsalestax.org/ratesandboundry/Rates/), which lists every
// Wisconsin county and city rate with begin and end dates, cross-checked
// against the Wisconsin Department of Revenue's county and city tax rate
// table (revenue.wi.gov/Pages/FAQS/pcs-taxrates.aspx). Wisconsin's local
// general sales taxes are the 0.5% county tax (0.9% in Milwaukee County since
// January 1, 2024), none in Waukesha and Winnebago counties, and the City of
// Milwaukee's 2% tax (since January 1, 2024); the stadium district taxes
// ended in 2015 and 2020, and premier resort area taxes apply only in small
// resort municipalities outside this list. Exposition district food, beverage
// and lodging taxes are excluded. Each city's comment names the county (with
// its SST county FIPS code) whose rate applies; split cities use the county
// holding most residents: Appleton (Outagamie; its Calumet portion is also
// 0.5, its Winnebago portion 0), Eau Claire (Eau Claire County). Cities: the
// 20 largest by Census Vintage 2025 place estimates.
//
// Racine County's 0.5% county tax began April 1, 2025 (SST row 55,00,101
// begins 20250401; DOR table '0.50% (4/25) New').
export default {
  [STATE_SALES_TAX]: 5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.702, 0.702, 0.72, 0.72],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5,
    bands: [
      { min: 0, max: 20000, amounts: [328, 378, 411, 437, 458, 488] },
      { min: 20000, max: 30000, amounts: [454, 523, 569, 604, 634, 675] },
      { min: 30000, max: 40000, amounts: [516, 594, 647, 687, 720, 767] },
      { min: 40000, max: 50000, amounts: [568, 654, 711, 756, 792, 844] },
      { min: 50000, max: 60000, amounts: [613, 706, 768, 816, 855, 911] },
      { min: 60000, max: 70000, amounts: [653, 752, 818, 869, 911, 970] },
      { min: 70000, max: 80000, amounts: [690, 794, 863, 917, 962, 1024] },
      { min: 80000, max: 90000, amounts: [723, 832, 905, 962, 1008, 1073] },
      { min: 90000, max: 100000, amounts: [755, 867, 943, 1002, 1051, 1119] },
      { min: 100000, max: 120000, amounts: [795, 914, 994, 1056, 1108, 1179] },
      { min: 120000, max: 140000, amounts: [847, 974, 1059, 1125, 1180, 1256] },
      {
        min: 140000,
        max: 160000,
        amounts: [895, 1029, 1119, 1189, 1246, 1326],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [938, 1079, 1173, 1246, 1307, 1391],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [979, 1125, 1224, 1300, 1363, 1450],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1021, 1173, 1276, 1355, 1421, 1512],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1064, 1224, 1331, 1414, 1482, 1577],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1106, 1271, 1382, 1469, 1540, 1638],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1145, 1316, 1431, 1520, 1593, 1696],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1368, 1573, 1710, 1816, 1903, 2026],
      },
    ],
  },
  [CITIES]: {
    // Milwaukee Co. 0.9 + city 2.0 (SST 079, 53000)
    [MILWAUKEE]: { [LOCAL_SALES_TAX]: 2.9 },
    [MADISON]: { [LOCAL_SALES_TAX]: 0.5 }, // Dane Co. 0.5 (SST 025)
    [GREEN_BAY]: { [LOCAL_SALES_TAX]: 0.5 }, // Brown Co. 0.5 (SST 009)
    [KENOSHA]: { [LOCAL_SALES_TAX]: 0.5 }, // Kenosha Co. 0.5 (SST 059)
    // Racine Co. 0.5 from 4/1/2025 (SST 101)
    [RACINE]: { [LOCAL_SALES_TAX]: [0, 0.5, 0.5, 0.5] },
    [APPLETON]: { [LOCAL_SALES_TAX]: 0.5 }, // Outagamie Co. 0.5 (SST 087)
    [EAU_CLAIRE]: { [LOCAL_SALES_TAX]: 0.5 }, // Eau Claire Co. 0.5 (SST 035)
    // Waukesha Co.: no county tax (SST 133)
    [WAUKESHA]: { [LOCAL_SALES_TAX]: 0 },
    // Winnebago Co.: no county tax (SST 139)
    [OSHKOSH]: { [LOCAL_SALES_TAX]: 0 },
    [JANESVILLE]: { [LOCAL_SALES_TAX]: 0.5 }, // Rock Co. 0.5 (SST 105)
    [WEST_ALLIS]: { [LOCAL_SALES_TAX]: 0.9 }, // Milwaukee Co. 0.9 (SST 079)
    [LA_CROSSE]: { [LOCAL_SALES_TAX]: 0.5 }, // La Crosse Co. 0.5 (SST 063)
    [SHEBOYGAN]: { [LOCAL_SALES_TAX]: 0.5 }, // Sheboygan Co. 0.5 (SST 117)
    [WAUWATOSA]: { [LOCAL_SALES_TAX]: 0.9 }, // Milwaukee Co. 0.9 (SST 079)
    [FOND_DU_LAC]: { [LOCAL_SALES_TAX]: 0.5 }, // Fond du Lac Co. 0.5 (SST 039)
    // Waukesha Co.: no county tax (SST 133)
    [BROOKFIELD]: { [LOCAL_SALES_TAX]: 0 },
    // Waukesha Co.: no county tax (SST 133)
    [MENOMONEE_FALLS]: { [LOCAL_SALES_TAX]: 0 },
    [WAUSAU]: { [LOCAL_SALES_TAX]: 0.5 }, // Marathon Co. 0.5 (SST 073)
    // Waukesha Co.: no county tax (SST 133)
    [NEW_BERLIN]: { [LOCAL_SALES_TAX]: 0 },
    [SUN_PRAIRIE]: { [LOCAL_SALES_TAX]: 0.5 }, // Dane Co. 0.5 (SST 025)
  },
} as SalesTaxData;
