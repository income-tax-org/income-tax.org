import { INFINITY } from "@/constants";
import {
  CITIES,
  BILOXI,
  BRANDON,
  CLINTON,
  COLUMBUS,
  GREENVILLE,
  GULFPORT,
  HATTIESBURG,
  HORN_LAKE,
  JACKSON,
  MADISON,
  MERIDIAN,
  OLIVE_BRANCH,
  OXFORD,
  PASCAGOULA,
  PEARL,
  RIDGELAND,
  SOUTHAVEN,
  STARKVILLE,
  TUPELO,
  VICKSBURG,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Mississippi Department of Revenue: "Sales Tax Rates"
// (dor.ms.gov/business/sales-use-tax/sales-tax-rates) for the 7% general
// state rate, and "Tourism and Economic Development Taxes"
// (dor.ms.gov/business/sales-and-use-tax/tourism-and-economic-development-taxes),
// the DOR's list of every city and county levy it administers. Mississippi
// has no general county or city sales tax; of the levies listed for these
// cities, only Jackson's 1% Special Infrastructure Tax and Tupelo's 0.25%
// Water Procurement Facility Tax apply to general retail sales. Every other
// listed levy for these cities (restaurant, bar, hotel/motel room and
// prepared-food taxes, including the Gulf Coast restaurant and hotel taxes in
// Harrison County) is excluded as meals/lodging-only, so their local rate is
// 0. Cities are the ~20 most populous Mississippi incorporated places by
// Census Vintage 2024 estimates.
//
// From May 1, 2026, Tupelo's 0.25% also applies to groceries taxed at 5%
// (House Bill 4112, 2026); the general-rate figure is unchanged. Jackson's 1%
// special infrastructure tax runs to July 1, 2035 and has product exemptions
// (DOR Notice 72-14-2).
export default {
  [STATE_SALES_TAX]: 7,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0.06,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 7,
    bands: [
      { min: 0, max: 20000, amounts: [611, 741, 833, 904, 965, 1051] },
      { min: 20000, max: 30000, amounts: [819, 991, 1111, 1206, 1286, 1400] },
      { min: 30000, max: 40000, amounts: [918, 1111, 1245, 1351, 1441, 1568] },
      { min: 40000, max: 50000, amounts: [1000, 1210, 1356, 1471, 1568, 1707] },
      { min: 50000, max: 60000, amounts: [1071, 1295, 1451, 1574, 1679, 1827] },
      { min: 60000, max: 70000, amounts: [1134, 1371, 1536, 1666, 1775, 1932] },
      { min: 70000, max: 80000, amounts: [1191, 1438, 1611, 1748, 1863, 2027] },
      { min: 80000, max: 90000, amounts: [1243, 1500, 1680, 1822, 1943, 2113] },
      {
        min: 90000,
        max: 100000,
        amounts: [1290, 1558, 1744, 1892, 2016, 2194],
      },
      {
        min: 100000,
        max: 120000,
        amounts: [1353, 1632, 1827, 1982, 2112, 2297],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1432, 1727, 1934, 2097, 2234, 2430],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1504, 1815, 2030, 2202, 2346, 2551],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1570, 1893, 2117, 2296, 2447, 2661],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1630, 1966, 2199, 2385, 2540, 2762],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1693, 2040, 2282, 2474, 2635, 2866],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1759, 2119, 2370, 2569, 2737, 2976],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1820, 2193, 2452, 2658, 2830, 3078],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1877, 2262, 2529, 2741, 2919, 3174],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [2205, 2653, 2964, 3212, 3420, 3718],
      },
    ],
  },
  [CITIES]: {
    // DOR: Jackson Special Infrastructure Tax 1%
    [JACKSON]: { [LOCAL_SALES_TAX]: 1 },
    [GULFPORT]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [SOUTHAVEN]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [BILOXI]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [HATTIESBURG]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [OLIVE_BRANCH]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    // DOR: Tupelo Water Procurement Facility Tax 0.25%
    [TUPELO]: { [LOCAL_SALES_TAX]: 0.25 },
    [MERIDIAN]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [MADISON]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [GREENVILLE]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [CLINTON]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [PEARL]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [OXFORD]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [BRANDON]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [HORN_LAKE]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [STARKVILLE]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [RIDGELAND]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [COLUMBUS]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [PASCAGOULA]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
    [VICKSBURG]: { [LOCAL_SALES_TAX]: 0 }, // DOR: no general local levy
  },
} as SalesTaxData;
