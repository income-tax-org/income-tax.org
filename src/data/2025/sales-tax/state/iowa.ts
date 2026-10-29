import { INFINITY } from "@/constants";
import {
  CITIES,
  AMES,
  ANKENY,
  BETTENDORF,
  CEDAR_FALLS,
  CEDAR_RAPIDS,
  COUNCIL_BLUFFS,
  DAVENPORT,
  DES_MOINES,
  DUBUQUE,
  IOWA_CITY,
  JOHNSTON,
  MARION,
  MARSHALLTOWN,
  MASON_CITY,
  OTTUMWA,
  SIOUX_CITY,
  URBANDALE,
  WATERLOO,
  WAUKEE,
  WEST_DES_MOINES,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Iowa Department of Revenue, "Local Option Rates and Sunsets" spreadsheet
// (revenue.iowa.gov/media/195/download, file "Status of All Juris Jul1, 2026
// 06182026.xlsx", linked from
// revenue.iowa.gov/taxes/tax-guidance/sales-use-excise-tax/local-option-sales-tax-lost),
// which lists each county/city jurisdiction, whether it imposes the 1% local
// option sales tax (LOST), the date it began and any sunset; and the
// department's "Updates to Iowa Local Option (LOST) Tax Jurisdictions" page,
// which lists Iowa City's new 1% LOST effective July 1, 2026 (Johnson
// County). Iowa has no other general local sales tax, so local is 1 where the
// city imposes LOST and 0 where it does not. Every LOST start date for these
// cities predates 2025 except Iowa City's, and none has a sunset before 2027.
// Split cities use the county portion holding most residents: West Des Moines
// and Urbandale (Polk; their Dallas and Warren portions also impose LOST, a
// small Madison County slice of West Des Moines does not), Waukee (Dallas;
// its small Polk portion has no LOST), Des Moines (Polk). Cities: the 20
// largest by Census Vintage 2025 place estimates.
//
// Ankeny (Polk County) does not impose LOST, so its combined rate is the 6%
// state rate.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [0.942, 0.942, 0.94, 0.94],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [401, 464, 507, 539, 567, 605] },
      { min: 20000, max: 30000, amounts: [551, 638, 696, 741, 778, 831] },
      { min: 30000, max: 40000, amounts: [626, 723, 789, 840, 882, 940] },
      { min: 40000, max: 50000, amounts: [687, 794, 866, 922, 968, 1033] },
      { min: 50000, max: 60000, amounts: [740, 856, 933, 993, 1043, 1113] },
      { min: 60000, max: 70000, amounts: [787, 910, 993, 1056, 1109, 1183] },
      { min: 70000, max: 80000, amounts: [830, 960, 1047, 1114, 1170, 1247] },
      { min: 80000, max: 90000, amounts: [869, 1005, 1096, 1167, 1225, 1306] },
      { min: 90000, max: 100000, amounts: [906, 1047, 1142, 1215, 1276, 1361] },
      {
        min: 100000,
        max: 120000,
        amounts: [954, 1102, 1201, 1279, 1343, 1432],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1015, 1173, 1279, 1361, 1429, 1523],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1070, 1237, 1349, 1435, 1507, 1608],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1121, 1296, 1413, 1503, 1578, 1683],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1169, 1351, 1473, 1567, 1644, 1754],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1218, 1407, 1534, 1632, 1713, 1827],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1269, 1466, 1599, 1700, 1785, 1903],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1317, 1521, 1658, 1765, 1852, 1975],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1363, 1574, 1715, 1825, 1916, 2043],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1623, 1874, 2041, 2172, 2280, 2431],
      },
    ],
  },
  [CITIES]: {
    // IDR LOST status, POLK / DES MOINES: LOST 1%
    [DES_MOINES]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, LINN / CEDAR RAPIDS: LOST 1%
    [CEDAR_RAPIDS]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, SCOTT / DAVENPORT: LOST 1%
    [DAVENPORT]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, WOODBURY / SIOUX CITY: LOST 1%
    [SIOUX_CITY]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, POLK / ANKENY: no LOST
    [ANKENY]: { [LOCAL_SALES_TAX]: 0 },
    // IDR LOST status, JOHNSON / IOWA CITY: LOST from 7/1/2026
    [IOWA_CITY]: { [LOCAL_SALES_TAX]: 0 },
    // IDR LOST status, POLK / WEST DES MOINES: LOST 1%
    [WEST_DES_MOINES]: { [LOCAL_SALES_TAX]: 1 },
    [AMES]: { [LOCAL_SALES_TAX]: 1 }, // IDR LOST status, STORY / AMES: LOST 1%
    // IDR LOST status, BLACK HAWK / WATERLOO: LOST 1%
    [WATERLOO]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, POTTAWATTAMIE / COUNCIL BLUFFS: LOST 1%
    [COUNCIL_BLUFFS]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, DUBUQUE / DUBUQUE: LOST 1%
    [DUBUQUE]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, POLK / URBANDALE: LOST 1%
    [URBANDALE]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, LINN / MARION: LOST 1%
    [MARION]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, BLACK HAWK / CEDAR FALLS: LOST 1%
    [CEDAR_FALLS]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, SCOTT / BETTENDORF: LOST 1%
    [BETTENDORF]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, DALLAS / WAUKEE: LOST 1%
    [WAUKEE]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, MARSHALL / MARSHALLTOWN: LOST 1%
    [MARSHALLTOWN]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, CERRO GORDO / MASON CITY: LOST 1%
    [MASON_CITY]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, WAPELLO / OTTUMWA: LOST 1%
    [OTTUMWA]: { [LOCAL_SALES_TAX]: 1 },
    // IDR LOST status, POLK / JOHNSTON: LOST 1%
    [JOHNSTON]: { [LOCAL_SALES_TAX]: 1 },
  },
} as SalesTaxData;
