import { INFINITY } from "@/constants";
import {
  CITIES,
  BEULAH,
  BISMARCK,
  CASSELTON,
  DEVILS_LAKE,
  DICKINSON,
  FARGO,
  GRAFTON,
  GRAND_FORKS,
  HORACE,
  JAMESTOWN,
  LINCOLN,
  MANDAN,
  MINOT,
  NEW_TOWN,
  RUGBY,
  VALLEY_CITY,
  WAHPETON,
  WATFORD_CITY,
  WEST_FARGO,
  WILLISTON,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax_types";
import type { SalesTaxData } from "@/types";

// North Dakota Office of State Tax Commissioner, "Local Taxes by Location"
// guideline, rates effective October 1, 2026
// (tax.nd.gov/sites/default/files/documents/guidelines/business/sales-use/local-taxes-by-location.pdf),
// which lists each city's and county's sales, use and gross receipts tax with
// its rate history and local code, and names the cities inside each taxing
// county (Cass, Burleigh, Morton, Ward, Williams, Walsh, Steele, Hettinger),
// where the county tax is added to the city tax; dates of each change come
// from the Streamlined Sales Tax rate file NDR2026Q4AUG14
// (streamlinedsalestax.org/ratesandboundry/Rates/), whose city and county
// rows carry begin and end dates and agree with the guideline. Each city's
// comment gives its local code and the city and county pieces. Local is the
// general rate only: city lodging, lodging-and-restaurant and motor vehicle
// rental taxes are excluded, as are the per-sale maximum tax refund caps,
// which matter only for large single purchases. Cities: the 20 largest by
// Census Vintage 2025 place estimates; places past the top ten are small
// towns.
//
// Walsh County's tax rose from 0.25% to 1% on January 1, 2026 (Grafton);
// Minot's city tax rose from 2% to 2.5% on October 1, 2026.
export default {
  [STATE_SALES_TAX]: 5,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: 2.09,
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 5,
    bands: [
      { min: 0, max: 20000, amounts: [284, 330, 362, 386, 406, 435] },
      { min: 20000, max: 30000, amounts: [391, 455, 498, 531, 560, 599] },
      { min: 30000, max: 40000, amounts: [444, 516, 565, 602, 634, 679] },
      { min: 40000, max: 50000, amounts: [488, 567, 619, 662, 697, 745] },
      { min: 50000, max: 60000, amounts: [526, 611, 668, 714, 752, 804] },
      { min: 60000, max: 70000, amounts: [561, 650, 712, 760, 799, 856] },
      { min: 70000, max: 80000, amounts: [591, 686, 751, 801, 843, 903] },
      { min: 80000, max: 90000, amounts: [619, 718, 786, 839, 884, 945] },
      { min: 90000, max: 100000, amounts: [646, 748, 820, 874, 920, 985] },
      { min: 100000, max: 120000, amounts: [679, 788, 862, 920, 969, 1037] },
      { min: 120000, max: 140000, amounts: [724, 839, 918, 980, 1031, 1104] },
      { min: 140000, max: 160000, amounts: [764, 886, 969, 1034, 1089, 1165] },
      { min: 160000, max: 180000, amounts: [800, 928, 1016, 1084, 1140, 1220] },
      { min: 180000, max: 200000, amounts: [835, 968, 1058, 1129, 1188, 1271] },
      {
        min: 200000,
        max: 225000,
        amounts: [869, 1008, 1103, 1176, 1238, 1325],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [907, 1051, 1150, 1227, 1291, 1381],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [941, 1091, 1193, 1274, 1340, 1434],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [974, 1129, 1235, 1317, 1386, 1484],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1162, 1346, 1472, 1570, 1651, 1767],
      },
    ],
  },
  [CITIES]: {
    // city 105: 2.0, 2.25 from 4/1/25 + Cass Co. 0.5
    [FARGO]: { [LOCAL_SALES_TAX]: 2.75 },
    // city 102: 1.5, 2.0 from 4/1/25 + Burleigh Co. 1.0
    [BISMARCK]: { [LOCAL_SALES_TAX]: 3 },
    // city 101: 2.25 (no county tax)
    [GRAND_FORKS]: { [LOCAL_SALES_TAX]: 2.25 },
    // city 103: 2.0, 2.5 from 10/1/26 + Ward Co. 0.5
    [MINOT]: { [LOCAL_SALES_TAX]: [2.5, 2.5, 2.5, 3] },
    [WEST_FARGO]: { [LOCAL_SALES_TAX]: 3 }, // city 129: 2.5 + Cass Co. 0.5
    [WILLISTON]: { [LOCAL_SALES_TAX]: 3 }, // city 109: 2.0 + Williams Co. 1.0
    [DICKINSON]: { [LOCAL_SALES_TAX]: 1.5 }, // city 106: 1.5 (no county tax)
    // city 108: 2.25 from 1/1/25 + Morton 0.5, 1.0 from 4/1/25
    [MANDAN]: { [LOCAL_SALES_TAX]: 3.25 },
    [JAMESTOWN]: { [LOCAL_SALES_TAX]: 2.5 }, // city 110: 2.5 (no county tax)
    // city 111: 2.0, 3.0 from 10/1/25 (no county tax)
    [WAHPETON]: { [LOCAL_SALES_TAX]: 3 },
    [DEVILS_LAKE]: { [LOCAL_SALES_TAX]: 2.5 }, // city 104: 2.5 (no county tax)
    [HORACE]: { [LOCAL_SALES_TAX]: 2.5 }, // city 239: 2.0 + Cass Co. 0.5
    [VALLEY_CITY]: { [LOCAL_SALES_TAX]: 2.5 }, // city 113: 2.5 (no county tax)
    [WATFORD_CITY]: { [LOCAL_SALES_TAX]: 1.5 }, // city 171: 1.5 (no county tax)
    [LINCOLN]: { [LOCAL_SALES_TAX]: 2 }, // city 242: 1.0 + Burleigh Co. 1.0
    // city 107: 2.75 + Walsh 0.25, 1.0 from 1/1/26
    [GRAFTON]: { [LOCAL_SALES_TAX]: 3.75 },
    [BEULAH]: { [LOCAL_SALES_TAX]: 2 }, // city 200: 2.0 (no county tax)
    [NEW_TOWN]: { [LOCAL_SALES_TAX]: 2 }, // city 241: 2.0 (no county tax)
    [CASSELTON]: { [LOCAL_SALES_TAX]: 2.5 }, // city 163: 2.0 + Cass Co. 0.5
    [RUGBY]: { [LOCAL_SALES_TAX]: 2 }, // city 118: 2.0 (no county tax)
  },
} as SalesTaxData;
