import { INFINITY } from "@/constants";
import {
  CITIES,
  BUFFALO,
  CASPER,
  CHEYENNE,
  CODY,
  DOUGLAS,
  EVANSTON,
  GILLETTE,
  GREEN_RIVER,
  JACKSON,
  LANDER,
  LARAMIE,
  MILLS,
  POWELL,
  RAWLINS,
  RIVERTON,
  ROCK_SPRINGS,
  SHERIDAN,
  TORRINGTON,
  WHEATLAND,
  WORLAND,
} from "@/constants/cities";
import {
  LOCAL_SALES_TAX,
  STATE_SALES_TAX,
  TAXABLE_SPENDING,
} from "@/constants/tax-types";
import type { SalesTaxData } from "@/types";

// Wyoming Department of Revenue, Excise Tax Division, "Sale/Use and Lodging
// Tax Rates by Locality" master rate charts
// (excise-tax-div.wyo.gov/sales-use-tax-rate-charts) effective 10/01/2024,
// 04/01/2025, 07/01/2025, 04/01/2026, 07/01/2026 and 10/01/2026; the division
// issues a chart only when a rate changes, so the 10/01/2024 chart covers Q1
// 2025 and the 07/01/2025 chart covers Q4 2025 and Q1 2026. Cross-checked
// against the Streamlined Sales Tax rate file WYR2026Q4AUG20.CSV, whose
// county rows carry the same rates and begin/end dates. Local is the chart's
// total sales/use rate minus the 4% state rate: the general purpose and
// specific purpose county option taxes, Goshen County's 0.25% economic
// development tax, and the City of Casper's 1% municipal option tax (April 1,
// 2025 to June 30, 2026, ended early once its goal was collected, per the
// City of Casper). Wyoming cities otherwise levy no general sales tax of
// their own, so each city takes its county's rate; lodging taxes are
// excluded. Each city's comment names the county whose rate applies. Cities:
// the 20 largest by Census Vintage 2025 place estimates.
//
// Laramie County fell from 2% to 1% on April 1, 2026. Casper's municipal tax
// ended June 30, 2026. Albany County's specific purpose tax lapsed for Q3
// 2026 (1%) and a new one took effect October 1, 2026 (back to 2%).
export default {
  [STATE_SALES_TAX]: 4,
  // No city picked, or one not listed: the Tax Foundation's
  // population-weighted average local rate, as of January 1, 2026 and July 1,
  // 2026. It publishes twice a year, so each figure stands for the two
  // quarters that follow it.
  [LOCAL_SALES_TAX]: [1.56, 1.56, 1.39, 1.39],
  // CARRIED FROM 2025: the 2026 table is published with the 2026 Schedule A
  // instructions, early in 2027. IRS 2025 Optional State Sales Tax Table for
  // this state (Instructions for Schedule A, 2025), at the rate printed
  // beside the state's name.
  [TAXABLE_SPENDING]: {
    rate: 4,
    bands: [
      { min: 0, max: 20000, amounts: [247, 281, 304, 321, 335, 354] },
      { min: 20000, max: 30000, amounts: [343, 391, 421, 446, 466, 494] },
      { min: 30000, max: 40000, amounts: [391, 445, 480, 508, 530, 563] },
      { min: 40000, max: 50000, amounts: [431, 490, 529, 560, 585, 619] },
      { min: 50000, max: 60000, amounts: [465, 529, 572, 605, 632, 669] },
      { min: 60000, max: 70000, amounts: [496, 565, 610, 645, 674, 714] },
      { min: 70000, max: 80000, amounts: [524, 596, 645, 681, 712, 755] },
      { min: 80000, max: 90000, amounts: [549, 626, 676, 715, 746, 791] },
      { min: 90000, max: 100000, amounts: [573, 653, 706, 746, 779, 826] },
      { min: 100000, max: 120000, amounts: [604, 689, 744, 787, 822, 871] },
      { min: 120000, max: 140000, amounts: [645, 734, 793, 839, 876, 929] },
      { min: 140000, max: 160000, amounts: [681, 776, 839, 887, 927, 982] },
      { min: 160000, max: 180000, amounts: [715, 814, 880, 930, 973, 1031] },
      { min: 180000, max: 200000, amounts: [745, 850, 918, 972, 1015, 1075] },
      { min: 200000, max: 225000, amounts: [778, 887, 959, 1014, 1059, 1122] },
      { min: 225000, max: 250000, amounts: [812, 925, 1000, 1058, 1106, 1172] },
      { min: 250000, max: 275000, amounts: [844, 962, 1040, 1100, 1149, 1218] },
      { min: 275000, max: 300000, amounts: [874, 996, 1077, 1138, 1190, 1261] },
      {
        min: 300000,
        max: INFINITY,
        amounts: [1047, 1193, 1290, 1365, 1426, 1511],
      },
    ],
  },
  [CITIES]: {
    [CHEYENNE]: { [LOCAL_SALES_TAX]: [2, 1, 1, 1] }, // Laramie County
    // Natrona County + Casper municipal option
    [CASPER]: { [LOCAL_SALES_TAX]: [2, 2, 1, 1] },
    [GILLETTE]: { [LOCAL_SALES_TAX]: 1 }, // Campbell County
    [LARAMIE]: { [LOCAL_SALES_TAX]: [2, 2, 1, 2] }, // Albany County
    [ROCK_SPRINGS]: { [LOCAL_SALES_TAX]: 2 }, // Sweetwater County
    [SHERIDAN]: { [LOCAL_SALES_TAX]: 2 }, // Sheridan County
    [EVANSTON]: { [LOCAL_SALES_TAX]: 1 }, // Uinta County
    [GREEN_RIVER]: { [LOCAL_SALES_TAX]: 2 }, // Sweetwater County
    [RIVERTON]: { [LOCAL_SALES_TAX]: 1 }, // Fremont County
    [JACKSON]: { [LOCAL_SALES_TAX]: 3 }, // Teton County
    [CODY]: { [LOCAL_SALES_TAX]: 0 }, // Park County (no county option tax)
    [RAWLINS]: { [LOCAL_SALES_TAX]: 2 }, // Carbon County
    [LANDER]: { [LOCAL_SALES_TAX]: 1 }, // Fremont County
    [POWELL]: { [LOCAL_SALES_TAX]: 0 }, // Park County (no county option tax)
    [DOUGLAS]: { [LOCAL_SALES_TAX]: 1 }, // Converse County
    // Goshen County (incl. 0.25 economic development)
    [TORRINGTON]: { [LOCAL_SALES_TAX]: 1.25 },
    [BUFFALO]: { [LOCAL_SALES_TAX]: 1 }, // Johnson County
    [WORLAND]: { [LOCAL_SALES_TAX]: 1 }, // Washakie County
    [MILLS]: { [LOCAL_SALES_TAX]: 1 }, // Natrona County
    [WHEATLAND]: { [LOCAL_SALES_TAX]: 2 }, // Platte County
  },
} as SalesTaxData;
