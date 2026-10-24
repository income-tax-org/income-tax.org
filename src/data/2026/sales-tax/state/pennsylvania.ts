import { INFINITY } from "@/constants";
import {
  CITIES,
  ALLENTOWN,
  ALTOONA,
  BETHEL_PARK,
  BETHLEHEM,
  CARLISLE,
  CHESTER,
  EASTON,
  ERIE,
  HANOVER,
  HARRISBURG,
  HAZLETON,
  LANCASTER,
  MOUNT_LEBANON,
  NORRISTOWN,
  PENN_HILLS,
  PHILADELPHIA,
  PITTSBURGH,
  READING,
  SCRANTON,
  STATE_COLLEGE,
  WILKES_BARRE,
  YORK,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// Pennsylvania Department of Revenue, "Sales, Use and Hotel Occupancy Tax"
// overview
// (www.pa.gov/agencies/revenue/resources/tax-types-and-information/sales-use-and-hotel-occupancy-tax):
// "The Pennsylvania sales tax rate is 6 percent. By law, a 1 percent local
// tax is added to purchases made in Allegheny County, and 2 percent local tax
// is added to purchases made in Philadelphia." These are the only local sales
// taxes in the state, so Pittsburgh (Allegheny County) is 1%, Philadelphia
// 2%, and every other city 0. The 6% rate has been unchanged since 1968, and
// the local rates since 1994 (Allegheny) and 2009 (Philadelphia's 2%). City
// list: the largest Pennsylvania cities and boroughs (Census incorporated
// places); large townships such as Upper Darby, Lower Merion, Abington and
// Bensalem are not Census places and are left out, but the home-rule
// municipalities Penn Hills, Mount Lebanon and Bethel Park are Census places
// in Allegheny County and take its 1% local tax. All other cities are outside
// Allegheny County and Philadelphia.
export default {
  [STATE_SALES_TAX]: 6,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 0.34,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 6,
    bands: [
      { min: 0, max: 20000, amounts: [351, 397, 427, 449, 468, 494] },
      { min: 20000, max: 30000, amounts: [474, 535, 575, 605, 631, 665] },
      { min: 30000, max: 40000, amounts: [534, 602, 647, 681, 709, 748] },
      { min: 40000, max: 50000, amounts: [583, 658, 707, 743, 775, 818] },
      { min: 50000, max: 60000, amounts: [626, 706, 758, 798, 831, 876] },
      { min: 60000, max: 70000, amounts: [664, 747, 803, 846, 880, 929] },
      { min: 70000, max: 80000, amounts: [698, 786, 844, 889, 925, 976] },
      { min: 80000, max: 90000, amounts: [729, 821, 882, 928, 967, 1020] },
      { min: 90000, max: 100000, amounts: [758, 853, 916, 965, 1004, 1059] },
      { min: 100000, max: 120000, amounts: [795, 896, 962, 1013, 1054, 1112] },
      { min: 120000, max: 140000, amounts: [843, 950, 1020, 1073, 1117, 1178] },
      { min: 140000, max: 160000, amounts: [887, 998, 1072, 1128, 1175, 1239] },
      {
        min: 160000,
        max: 180000,
        amounts: [926, 1043, 1120, 1179, 1227, 1294],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [963, 1085, 1165, 1226, 1276, 1346],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1000, 1127, 1210, 1274, 1325, 1397],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1041, 1172, 1258, 1324, 1378, 1453],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1078, 1214, 1303, 1371, 1427, 1505],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1112, 1252, 1345, 1416, 1474, 1554],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1311, 1477, 1584, 1668, 1736, 1830],
      },
    ],
  },
  [CITIES]: {
    [PHILADELPHIA]: { [LOCAL_SALES_TAX]: 2 }, // PA DOR: Philadelphia 2% local
    [PITTSBURGH]: { [LOCAL_SALES_TAX]: 1 }, // PA DOR: Allegheny County 1% local
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [ALLENTOWN]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [READING]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [ERIE]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [SCRANTON]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [BETHLEHEM]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [LANCASTER]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [HARRISBURG]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [ALTOONA]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [YORK]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [STATE_COLLEGE]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [WILKES_BARRE]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [NORRISTOWN]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [CHESTER]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [EASTON]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [HAZLETON]: { [LOCAL_SALES_TAX]: 0 },
    [PENN_HILLS]: { [LOCAL_SALES_TAX]: 1 }, // PA DOR: Allegheny County 1% local
    // PA DOR: Allegheny County 1% local
    [MOUNT_LEBANON]: { [LOCAL_SALES_TAX]: 1 },
    // PA DOR: Allegheny County 1% local
    [BETHEL_PARK]: { [LOCAL_SALES_TAX]: 1 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [CARLISLE]: { [LOCAL_SALES_TAX]: 0 },
    // PA DOR: no local tax outside Allegheny/Philadelphia
    [HANOVER]: { [LOCAL_SALES_TAX]: 0 },
  },
} as SalesTaxData;
