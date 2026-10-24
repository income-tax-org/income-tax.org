import { INFINITY } from "@/constants";
import {
  CITIES,
  BARTLETT,
  BRENTWOOD,
  CHATTANOOGA,
  CLARKSVILLE,
  CLEVELAND,
  COLLIERVILLE,
  COLUMBIA,
  FRANKLIN,
  GALLATIN,
  HENDERSONVILLE,
  JACKSON,
  JOHNSON_CITY,
  KINGSPORT,
  KNOXVILLE,
  LEBANON,
  MEMPHIS,
  MURFREESBORO,
  NASHVILLE,
  SMYRNA,
  SPRING_HILL,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Tennessee Department of Revenue rates as published in the Streamlined Sales
// Tax rate file TNR2026Q4AUG21.csv and boundary file TNB2026Q4AUG21.zip
// (streamlinedsalestax.org/ratesandboundry/), whose rows carry effective
// begin and end dates covering January 2025 through December 2026.
// Tennessee's local option rate is capped at 2.75% and a city row gives the
// whole local rate inside that city (it replaces, not adds to, the county
// rate); cities split by a county line carry their own jurisdiction code
// (type 63), located through the boundary file. Nashville-Davidson adds the
// 0.5% Metro transit surtax (special district 91951, type 79, effective
// February 1, 2025, outside the 2.75% cap; confirmed by DOR Important Notice
// 24-11,
// tn.gov/content/dam/tn/revenue/documents/notices/sales/sales24-11.pdf),
// which the boundary file assigns to Nashville addresses. Johnson City uses
// its Washington County portion (about 97% of residents) and Kingsport its
// Sullivan County portion (about 95%); Spring Hill is 2.75% in both its Maury
// and Williamson portions. The state rate is the 7% general rate (food is
// taxed at 4%, excluded). Cities are the 20 most populous incorporated places
// in the Census Bureau's Vintage 2025 city estimates (SUB-EST2025). DOR's
// interactive rate map (tn.gov/revenue) could not be retrieved (HTTP 403) for
// a direct cross-check.
export default {
  [STATE_SALES_TAX]: 7,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 2.61,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 7,
    bands: [
      { min: 0, max: 20000, amounts: [537, 640, 710, 766, 811, 877] },
      { min: 20000, max: 30000, amounts: [728, 866, 962, 1036, 1099, 1188] },
      { min: 30000, max: 40000, amounts: [822, 976, 1084, 1168, 1238, 1339] },
      { min: 40000, max: 50000, amounts: [898, 1067, 1184, 1277, 1354, 1463] },
      { min: 50000, max: 60000, amounts: [965, 1147, 1273, 1371, 1454, 1572] },
      { min: 60000, max: 70000, amounts: [1024, 1217, 1350, 1454, 1543, 1667] },
      { min: 70000, max: 80000, amounts: [1077, 1280, 1420, 1529, 1622, 1753] },
      { min: 80000, max: 90000, amounts: [1125, 1338, 1484, 1599, 1695, 1832] },
      {
        min: 90000,
        max: 100000,
        amounts: [1171, 1391, 1543, 1662, 1763, 1905],
      },
      {
        min: 100000,
        max: 120000,
        amounts: [1230, 1460, 1620, 1746, 1851, 2001],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [1305, 1550, 1719, 1852, 1964, 2123],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [1373, 1631, 1809, 1949, 2067, 2233],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1436, 1705, 1891, 2037, 2160, 2334],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1494, 1774, 1967, 2119, 2246, 2427],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1553, 1844, 2045, 2203, 2336, 2524],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1616, 1918, 2128, 2292, 2429, 2625],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1675, 1988, 2204, 2374, 2518, 2720],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1730, 2053, 2277, 2453, 2600, 2809],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [2044, 2425, 2689, 2896, 3070, 3316],
      },
    ],
  },
  [CITIES]: {
    // SST TN city 52006 2.25 + transit SD 91951 0.5
    [NASHVILLE]: { [LOCAL_SALES_TAX]: 2.75 },
    [MEMPHIS]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 48000
    [KNOXVILLE]: { [LOCAL_SALES_TAX]: 2.25 }, // SST TN city 40000
    [CHATTANOOGA]: { [LOCAL_SALES_TAX]: 2.25 }, // SST TN city 14000
    [CLARKSVILLE]: { [LOCAL_SALES_TAX]: 2.5 }, // SST TN city 15160
    [MURFREESBORO]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 51560
    [FRANKLIN]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 27740
    // SST TN code 99002 (Washington County portion)
    [JOHNSON_CITY]: { [LOCAL_SALES_TAX]: 2.5 },
    [JACKSON]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 37640
    [HENDERSONVILLE]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 33280
    [SMYRNA]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 69420
    // SST TN codes 96003 (Maury) / 99404 (Williamson)
    [SPRING_HILL]: { [LOCAL_SALES_TAX]: 2.75 },
    // SST TN code 98204 (Sullivan County portion)
    [KINGSPORT]: { [LOCAL_SALES_TAX]: 2.5 },
    [BARTLETT]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 03440
    [GALLATIN]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 28540
    [LEBANON]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 41520
    [COLLIERVILLE]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 16420
    [CLEVELAND]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 15400
    [COLUMBIA]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 16540
    [BRENTWOOD]: { [LOCAL_SALES_TAX]: 2.75 }, // SST TN city 08280
  },
} as SalesTaxData;
