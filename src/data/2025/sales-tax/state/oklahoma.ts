import { INFINITY } from "@/constants";
import {
  CITIES,
  ARDMORE,
  BARTLESVILLE,
  BIXBY,
  BROKEN_ARROW,
  EDMOND,
  ENID,
  JENKS,
  LAWTON,
  MIDWEST_CITY,
  MOORE,
  MUSKOGEE,
  MUSTANG,
  NORMAN,
  OKLAHOMA_CITY,
  OWASSO,
  PONCA_CITY,
  SHAWNEE,
  STILLWATER,
  TULSA,
  YUKON,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Oklahoma Tax Commission, "Rates and Codes for Sales, Use, and Lodging Tax"
// quarterly charts copo1Q25.pdf through copo4Q26.pdf
// (oklahoma.gov/content/dam/ok/en/tax/documents/resources/publications/businesses/sales-and-use-tax/rate-charts-copos/{year}/).
// State rate 4.5% (effective May 1, 1990, per every chart). Local = the
// city's sales tax rate plus, where the chart marks the city with ** (county
// tax also due), the county rate of the county whose COPO shares the city
// COPO's first two digits; lodging-only rates are excluded. Cities spanning
// counties use the COPO for the county where most residents live: Oklahoma
// City 5521 (Oklahoma County, no county tax), Tulsa 7281, Broken Arrow 7204,
// Owasso 7214 and Bixby 7203 (Tulsa County), Bartlesville 7401 (Washington
// County). Cities are the ~20 most populous Oklahoma incorporated places by
// Census Vintage 2024 estimates.
//
// Muskogee County's county rate rose from 0.65% to 1.499% on April 1, 2025
// (OTC 2Q25 chart, Changes in Tax Rates), raising Muskogee's local rate from
// 4.65% to 5.499%. No other listed city or its county changed rate during
// 2025.
export default {
  [STATE_SALES_TAX]: 4.5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [4.505, 4.505, 4.55, 4.55],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.5,
    bands: [
      { min: 0, max: 20000, amounts: [318, 381, 425, 459, 488, 531] },
      { min: 20000, max: 30000, amounts: [432, 517, 577, 624, 663, 720] },
      { min: 30000, max: 40000, amounts: [487, 584, 651, 704, 748, 812] },
      { min: 40000, max: 50000, amounts: [534, 639, 712, 770, 819, 889] },
      { min: 50000, max: 60000, amounts: [574, 687, 766, 828, 880, 955] },
      { min: 60000, max: 70000, amounts: [609, 729, 812, 878, 934, 1014] },
      { min: 70000, max: 80000, amounts: [642, 768, 855, 924, 983, 1066] },
      { min: 80000, max: 90000, amounts: [671, 802, 894, 966, 1028, 1114] },
      { min: 90000, max: 100000, amounts: [699, 835, 929, 1005, 1068, 1159] },
      { min: 100000, max: 120000, amounts: [734, 877, 977, 1056, 1123, 1218] },
      { min: 120000, max: 140000, amounts: [780, 931, 1037, 1121, 1192, 1293] },
      { min: 140000, max: 160000, amounts: [822, 981, 1092, 1180, 1255, 1361] },
      {
        min: 160000,
        max: 180000,
        amounts: [859, 1026, 1142, 1234, 1312, 1423],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [894, 1067, 1188, 1285, 1365, 1481],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [930, 1110, 1236, 1335, 1420, 1540],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [968, 1156, 1287, 1390, 1478, 1602],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1003, 1198, 1333, 1441, 1531, 1660],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1037, 1238, 1377, 1489, 1582, 1715],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1229, 1465, 1630, 1761, 1871, 2028],
      },
    ],
  },
  [CITIES]: {
    // OTC COPO chart, Oklahoma City 5521 + Oklahoma Co
    [OKLAHOMA_CITY]: { [LOCAL_SALES_TAX]: 4.125 },
    // OTC COPO chart, Tulsa 7281 + Tulsa Co
    [TULSA]: { [LOCAL_SALES_TAX]: 4.017 },
    // OTC COPO chart, Norman 1411 + Cleveland Co
    [NORMAN]: { [LOCAL_SALES_TAX]: 4.25 },
    // OTC COPO chart, Broken Arrow 7204 + Tulsa Co
    [BROKEN_ARROW]: { [LOCAL_SALES_TAX]: 3.917 },
    // OTC COPO chart, Edmond 5507 + Oklahoma Co
    [EDMOND]: { [LOCAL_SALES_TAX]: 3.75 },
    // OTC COPO chart, Lawton 1621 + Comanche Co
    [LAWTON]: { [LOCAL_SALES_TAX]: 4.5 },
    // OTC COPO chart, Moore 1404 + Cleveland Co
    [MOORE]: { [LOCAL_SALES_TAX]: 4 },
    // OTC COPO chart, Midwest City 5522 + Oklahoma Co
    [MIDWEST_CITY]: { [LOCAL_SALES_TAX]: 4.6 },
    // OTC COPO chart, Stillwater 6071 + Payne Co
    [STILLWATER]: { [LOCAL_SALES_TAX]: 4.813 },
    // OTC COPO chart, Enid 2411 + Garfield Co
    [ENID]: { [LOCAL_SALES_TAX]: 4.6 },
    // OTC COPO chart, Owasso 7214 + Tulsa Co
    [OWASSO]: { [LOCAL_SALES_TAX]: 4.417 },
    // OTC COPO chart, Bartlesville 7401 + Washington Co
    [BARTLESVILLE]: { [LOCAL_SALES_TAX]: 4.4 },
    // OTC COPO chart, Muskogee 5111 + Muskogee Co
    [MUSKOGEE]: { [LOCAL_SALES_TAX]: [4.65, 5.499, 5.499, 5.499] },
    // OTC COPO chart, Bixby 7203 + Tulsa Co
    [BIXBY]: { [LOCAL_SALES_TAX]: 4.417 },
    // OTC COPO chart, Shawnee 6351 + Pottawatomie Co
    [SHAWNEE]: { [LOCAL_SALES_TAX]: 5.495 },
    // OTC COPO chart, Yukon 0955 + Canadian Co
    [YUKON]: { [LOCAL_SALES_TAX]: 4.35 },
    // OTC COPO chart, Jenks 7208 + Tulsa Co
    [JENKS]: { [LOCAL_SALES_TAX]: 3.917 },
    // OTC COPO chart, Ardmore 1001 + Carter Co
    [ARDMORE]: { [LOCAL_SALES_TAX]: 4.625 },
    // OTC COPO chart, Mustang 0933 + Canadian Co
    [MUSTANG]: { [LOCAL_SALES_TAX]: 4.35 },
    // OTC COPO chart, Ponca City 3621 + Kay Co
    [PONCA_CITY]: { [LOCAL_SALES_TAX]: 5.083 },
  },
} as SalesTaxData;
