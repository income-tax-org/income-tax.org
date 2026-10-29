import { INFINITY } from "@/constants";
import {
  CITIES,
  AUBURN,
  BELLEVUE,
  BELLINGHAM,
  BOTHELL,
  BREMERTON,
  BURIEN,
  EDMONDS,
  EVERETT,
  FEDERAL_WAY,
  ISSAQUAH,
  KENNEWICK,
  KENT,
  KIRKLAND,
  LACEY,
  LAKEWOOD,
  LAKE_STEVENS,
  LONGVIEW,
  LYNNWOOD,
  MARYSVILLE,
  MOUNT_VERNON,
  OLYMPIA,
  PASCO,
  PULLMAN,
  PUYALLUP,
  REDMOND,
  RENTON,
  RICHLAND,
  SAMMAMISH,
  SEATTLE,
  SHORELINE,
  SPOKANE,
  SPOKANE_VALLEY,
  TACOMA,
  VANCOUVER,
  WALLA_WALLA,
  WENATCHEE,
  YAKIMA,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Washington Department of Revenue, "Local sales & use tax rates", quarterly
// downloads Rates_YYQ1.csv through Rates_YYQ4.csv
// (dor.wa.gov/taxes-rates/sales-use-tax-rates/downloadable-database). Each
// city's comment is the DOR location code and name its figure was read from:
// the file's Local column, as a percent. Every row's State column is 0.065.
// Where DOR splits a city by Sound Transit's district (RTA / NON-RTA) or by
// county, the code covering most of its residents is used: the RTA portion,
// and the King County portions of Auburn and Bothell.
export default {
  [STATE_SALES_TAX]: 6.5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [3.01, 3.01, 3.07, 3.07],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6.5,
    bands: [
      { min: 0, max: 20000, amounts: [430, 492, 532, 565, 591, 628] },
      { min: 20000, max: 30000, amounts: [594, 680, 737, 782, 818, 869] },
      { min: 30000, max: 40000, amounts: [675, 773, 838, 889, 930, 988] },
      { min: 40000, max: 50000, amounts: [743, 851, 922, 978, 1024, 1088] },
      { min: 50000, max: 60000, amounts: [802, 919, 996, 1056, 1105, 1174] },
      { min: 60000, max: 70000, amounts: [855, 979, 1061, 1125, 1177, 1251] },
      { min: 70000, max: 80000, amounts: [903, 1033, 1120, 1187, 1243, 1320] },
      { min: 80000, max: 90000, amounts: [947, 1084, 1174, 1245, 1303, 1384] },
      { min: 90000, max: 100000, amounts: [987, 1129, 1225, 1298, 1359, 1443] },
      {
        min: 100000,
        max: 120000,
        amounts: [1040, 1190, 1291, 1368, 1432, 1521],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1108, 1268, 1375, 1458, 1526, 1621],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1171, 1341, 1453, 1541, 1612, 1712],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1228, 1406, 1523, 1615, 1690, 1796],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1281, 1465, 1589, 1685, 1763, 1874],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1335, 1528, 1657, 1757, 1838, 1953],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1393, 1594, 1728, 1833, 1918, 2038],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1447, 1656, 1796, 1903, 1993, 2116],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1498, 1714, 1860, 1970, 2063, 2192],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1790, 2049, 2222, 2356, 2466, 2619],
      },
    ],
  },
  [CITIES]: {
    [SEATTLE]: { [LOCAL_SALES_TAX]: 4.05 }, // 1726 SEATTLE
    [SPOKANE]: { [LOCAL_SALES_TAX]: 2.6 }, // 3210 SPOKANE CITY
    [TACOMA]: { [LOCAL_SALES_TAX]: [3.8, 3.9, 4, 4] }, // 2717 TACOMA
    [VANCOUVER]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.4, 2.4] }, // 0605 VANCOUVER
    [BELLEVUE]: { [LOCAL_SALES_TAX]: 3.8 }, // 1704 BELLEVUE RTA
    [KENT]: { [LOCAL_SALES_TAX]: 3.9 }, // 1715 KENT RTA
    [EVERETT]: { [LOCAL_SALES_TAX]: 3.4 }, // 3105 EVERETT RTA
    [RENTON]: { [LOCAL_SALES_TAX]: 4 }, // 1725 RENTON RTA
    [SPOKANE_VALLEY]: { [LOCAL_SALES_TAX]: 2.5 }, // 3213 SPOKANE VALLEY
    // 1732 FEDERAL WAY
    [FEDERAL_WAY]: { [LOCAL_SALES_TAX]: [3.8, 3.8, 3.9, 3.9] },
    [YAKIMA]: { [LOCAL_SALES_TAX]: [2, 2, 2.1, 2.1] }, // 3913 YAKIMA CITY
    [KIRKLAND]: { [LOCAL_SALES_TAX]: 3.9 }, // 1716 KIRKLAND
    // 3701 BELLINGHAM
    [BELLINGHAM]: { [LOCAL_SALES_TAX]: [2.6, 2.6, 2.7, 2.7] },
    [AUBURN]: { [LOCAL_SALES_TAX]: [3.9, 3.9, 4, 4] }, // 1702 AUBURN/KING RTA
    [KENNEWICK]: { [LOCAL_SALES_TAX]: 2.3 }, // 0302 KENNEWICK
    [PASCO]: { [LOCAL_SALES_TAX]: 2.4 }, // 1104 PASCO
    [REDMOND]: { [LOCAL_SALES_TAX]: 3.9 }, // 1724 REDMOND RTA
    [MARYSVILLE]: { [LOCAL_SALES_TAX]: 2.9 }, // 3111 MARYSVILLE
    [SAMMAMISH]: { [LOCAL_SALES_TAX]: 3.8 }, // 1739 SAMMAMISH RTA
    [LAKEWOOD]: { [LOCAL_SALES_TAX]: [3.6, 3.6, 3.8, 3.8] }, // 2721 LAKEWOOD
    [RICHLAND]: { [LOCAL_SALES_TAX]: [2.2, 2.3, 2.3, 2.3] }, // 0304 RICHLAND
    [SHORELINE]: { [LOCAL_SALES_TAX]: 4 }, // 1737 SHORELINE
    [LACEY]: { [LOCAL_SALES_TAX]: [3.2, 3.2, 3.3, 3.3] }, // 3402 LACEY
    [OLYMPIA]: { [LOCAL_SALES_TAX]: [3.3, 3.3, 3.5, 3.5] }, // 3403 OLYMPIA
    [BURIEN]: { [LOCAL_SALES_TAX]: [3.8, 3.8, 3.9, 3.9] }, // 1734 BURIEN
    [BOTHELL]: { [LOCAL_SALES_TAX]: 3.8 }, // 1706 BOTHELL/KING
    [BREMERTON]: { [LOCAL_SALES_TAX]: 2.7 }, // 1801 BREMERTON
    [EDMONDS]: { [LOCAL_SALES_TAX]: [4.1, 4.2, 4.2, 4.2] }, // 3104 EDMONDS
    [PUYALLUP]: { [LOCAL_SALES_TAX]: [3.7, 3.7, 3.8, 3.8] }, // 2711 PUYALLUP
    [LYNNWOOD]: { [LOCAL_SALES_TAX]: [4.1, 4.2, 4.2, 4.2] }, // 3110 LYNNWOOD
    [ISSAQUAH]: { [LOCAL_SALES_TAX]: 4 }, // 1714 ISSAQUAH RTA
    [LAKE_STEVENS]: { [LOCAL_SALES_TAX]: 2.8 }, // 3109 LAKE STEVENS
    [LONGVIEW]: { [LOCAL_SALES_TAX]: 1.7 }, // 0804 LONGVIEW
    [WENATCHEE]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.5, 2.5] }, // 0405 WENATCHEE
    // 2907 MOUNT VERNON
    [MOUNT_VERNON]: { [LOCAL_SALES_TAX]: [2.3, 2.4, 2.5, 2.5] },
    [WALLA_WALLA]: { [LOCAL_SALES_TAX]: 2.6 }, // 3604 WALLA WALLA CITY
    [PULLMAN]: { [LOCAL_SALES_TAX]: [1.5, 1.5, 1.7, 1.7] }, // 3812 PULLMAN
  },
} as SalesTaxData;
