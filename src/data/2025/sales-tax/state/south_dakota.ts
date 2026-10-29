import { INFINITY } from "@/constants";
import {
  CITIES,
  ABERDEEN,
  BELLE_FOURCHE,
  BOX_ELDER,
  BRANDON,
  BROOKINGS,
  DELL_RAPIDS,
  HARRISBURG,
  HOT_SPRINGS,
  HURON,
  MADISON,
  MITCHELL,
  PIERRE,
  RAPID_CITY,
  SIOUX_FALLS,
  SPEARFISH,
  STURGIS,
  TEA,
  VERMILLION,
  WATERTOWN,
  YANKTON,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// South Dakota Department of Revenue, Municipal / Special Jurisdiction Tax
// Schedules for January-June 2026 and July-December 2026
// (dor.sd.gov/businesses/taxes/municipal-tax/, files
// municipal-sj-tax-schedule-2025-07-1.xlsx and
// municipal-sj-tax-schedule-2026-07.xlsx), which give each municipality's
// general sales tax (code suffix -2) and its municipal gross receipts tax on
// lodging, alcohol, prepared food and admissions (suffix -1, excluded here);
// 2025 rates and start dates come from the Streamlined Sales Tax rate file
// SDR2026Q3JUN02 (streamlinedsalestax.org/ratesandboundry/Rates/), whose city
// rows show every one of these cities at 2% since 2009 or earlier. South
// Dakota municipal tax changes take effect only on January 1 or July 1, so
// the July-December 2026 schedule covers the rest of the year. Counties levy
// no sales tax. The state rate, 4.2% from July 1, 2023 to June 30, 2027, is
// from the department's "Current and Historical Tax Rates"
// (sddor_taxrates-current-historical-updated-july-2026.pdf). Each city's
// comment is its DOR municipal code. Cities: the 20 largest by Census Vintage
// 2025 place estimates.
export default {
  // 4.2% general rate effective 07/01/2023-06/30/2027 (was 4.5% from
  // 06/01/2016), per SD DOR Current and Historical Tax Rates.
  [STATE_SALES_TAX]: 4.2,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2025 and July 1,
  // 2025. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.914, 1.914, 1.91, 1.91],
  // IRS 2025 Optional State Sales Tax Table for this state (Instructions for
  // Schedule A, 2025), at the rate printed beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4.2,
    bands: [
      { min: 0, max: 20000, amounts: [381, 460, 515, 558, 595, 647] },
      { min: 20000, max: 30000, amounts: [519, 626, 701, 760, 809, 879] },
      { min: 30000, max: 40000, amounts: [586, 707, 791, 857, 913, 993] },
      { min: 40000, max: 50000, amounts: [642, 775, 866, 939, 1000, 1087] },
      { min: 50000, max: 60000, amounts: [691, 833, 931, 1009, 1075, 1169] },
      { min: 60000, max: 70000, amounts: [734, 885, 989, 1072, 1142, 1241] },
      { min: 70000, max: 80000, amounts: [773, 931, 1041, 1128, 1201, 1306] },
      { min: 80000, max: 90000, amounts: [808, 974, 1090, 1180, 1257, 1366] },
      { min: 90000, max: 100000, amounts: [841, 1014, 1133, 1228, 1308, 1421] },
      {
        min: 100000,
        max: 120000,
        amounts: [885, 1065, 1191, 1291, 1375, 1494],
      },
      {
        min: 120000,
        max: 140000,
        amounts: [939, 1132, 1265, 1371, 1459, 1586],
      },
      {
        min: 140000,
        max: 160000,
        amounts: [990, 1192, 1333, 1444, 1538, 1671],
      },
      {
        min: 160000,
        max: 180000,
        amounts: [1036, 1247, 1394, 1510, 1609, 1747],
      },
      {
        min: 180000,
        max: 200000,
        amounts: [1079, 1299, 1451, 1572, 1674, 1819],
      },
      {
        min: 200000,
        max: 225000,
        amounts: [1122, 1352, 1510, 1636, 1742, 1892],
      },
      {
        min: 225000,
        max: 250000,
        amounts: [1169, 1407, 1572, 1703, 1813, 1969],
      },
      {
        min: 250000,
        max: 275000,
        amounts: [1212, 1458, 1630, 1765, 1879, 2041],
      },
      {
        min: 275000,
        max: 300000,
        amounts: [1252, 1507, 1684, 1824, 1942, 2109],
      },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1485, 1786, 1996, 2160, 2299, 2497],
      },
    ],
  },
  [CITIES]: {
    // SD DOR municipal code 330-2: 2% sales tax
    [SIOUX_FALLS]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 298-2: 2% sales tax
    [RAPID_CITY]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 001-2: 2% sales tax
    [ABERDEEN]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 045-2: 2% sales tax
    [BROOKINGS]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 379-2: 2% sales tax
    [WATERTOWN]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 405-2: 2% sales tax
    [YANKTON]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 242-2: 2% sales tax
    [MITCHELL]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 177-2: 2% sales tax
    [HURON]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 334-2: 2% sales tax
    [SPEARFISH]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 037-2: 2% sales tax
    [BOX_ELDER]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 284-2: 2% sales tax
    [PIERRE]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 362-2: 2% sales tax
    [VERMILLION]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 039-2: 2% sales tax
    [BRANDON]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 151-2: 2% sales tax
    [HARRISBURG]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 344-2: 2% sales tax
    [TEA]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 341-2: 2% sales tax
    [STURGIS]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 221-2: 2% sales tax
    [MADISON]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 027-2: 2% sales tax
    [BELLE_FOURCHE]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 094-2: 2% sales tax
    [DELL_RAPIDS]: { [LOCAL_SALES_TAX]: 2 },
    // SD DOR municipal code 169-2: 2% sales tax
    [HOT_SPRINGS]: { [LOCAL_SALES_TAX]: 2 },
  },
} as SalesTaxData;
